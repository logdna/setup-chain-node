'use strict'

const crypto = require('crypto')
const {object} = require('@logdna/stdlib')
const typeOf = require('./lang/type-of.js')
const builtins = require('./actions/index.js')
const {Parser, Lexer, Visitor} = require('./parser/index.js')
const {BANG, HASH} = require('./parser/tokens.js')
const PARSE_TOKENS = new Set([BANG.name, HASH.name])

const lookup = Symbol('lookup')
const call = Symbol('call')
const astToValue = Symbol('astToValue')

const COMPLEX_LOOKUP_TYPES = new Set([
  'date'
, 'moment'
, 'boolean'
, 'number'
])

module.exports = class SetupChain {
  constructor(state, actions) {
    this.parser = new Parser()
    this.lexer = new Lexer()
    this.visitor = new Visitor()
    this.state = state || {} // runtime execution results
    this.keep = {} // Used by `set` to merge with final results
    this.tasks = [] // pending tasks to execute
    this.ctx = [] // execution context stack
    this.actions = { // public actions handlers
      ...builtins
    , ...(actions || {})
    }

    const childMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
    for (const name of Object.keys(this.actions)) {
      if (object.has(SetupChain.prototype, name)
        || childMethods.includes(name)) continue
      // If users don't expose their own method (and desired signature),
      // then use a default of (opts, label) and auto-expose the actions
      Object.defineProperties(this, {
        [name]: {
          enumerable: true
        , writable: false
        , configurable: true
        , value(opts, label) {
            this.tasks.push([name, label, opts])
            return this
          }
        }
      })
    }
  }

  get context() {
    return this.ctx.length ? this.ctx[this.ctx.length - 1] : this.state
  }

  set(key, value) {
    this.tasks.push(['set', 'set', key, value])
    return this
  }

  map(collection, fn, label) {
    this.tasks.push(['map', label, collection, fn])
    return this
  }

  repeat(times, action, opts, label) {
    this.tasks.push(['repeat', label, times, action, opts])
    return this
  }

  sort(collection, comparator, label) {
    this.tasks.push(['sort', label, collection, comparator])
    return this
  }

  lookup(path) {
    const path_type = typeOf(path)
    // Don't screw up Date's / moment prototype.  Terminate iteration if a complex type.
    if (COMPLEX_LOOKUP_TYPES.has(path_type)) return path
    if (!path) return null
    if (path_type === 'string') return this[lookup](this.parse(path))

    const out = Object.create(null)
    this.ctx.push(out)
    // path is an object remap values with lookup result
    for (const [key, value] of Object.entries(path)) {

      // remap array values with lookup result
      if (Array.isArray(value)) {
        out[key] = value.map((val) => {
          if (typeOf(val) === 'object') return this.lookup(val)
          const resolved = this[lookup](this.parse(val))
          return resolved
        })
        continue
      }

      // remap object values with lookup result
      if (value && typeOf(value) === 'object') {
        out[key] = this.lookup(value)
        continue
      }

      out[key] = typeOf(value) === 'string'
        ? this[lookup](this.parse(value))
        : value

    }

    this.ctx.pop()
    if (Array.isArray(path)) return Object.values(out)

    return out
  }

  parse(str) {
    const lexed = this.lexer.tokenize(str)
    if (!lexed.tokens.length) return this.visitor.wrapLiteral(str)

    const firstToken = lexed.tokens[0]
    if (!PARSE_TOKENS.has(firstToken.tokenType.name)) {
      return this.visitor.wrapLiteral(str)
    }

    this.parser.input = lexed.tokens

    // returns unist compliant syntax tree root node
    const ast = this.parser.last()
    const errors = this.parser._errors
    if (errors.length) throw errors[0]

    this.parser.reset()
    const node = this.visitor.visit(ast)

    // the root node of a LAST tree only has 1 child
    return node.children[0]
  }

  reset() {
    this.state = {}
    this.tasks = []
    this.ctx = []
    return this
  }

  async execute() {
    this.state = {
      ...this.state
    , ...this.keep
    }

    if (!this.tasks.length) return this.state

    for (const task of this.tasks) {
      if (!task || typeof task !== 'object') {
        throw new TypeError('tasks must be an array of objects')
      }
      const [key, label, ...rest] = task

      try {
        const fn = this.actions[key]
        this.state[label || key] = await fn.apply(this, rest)
      } catch (err) {
        console.error(err)
        const error = new Error(`Setup Chain error in ${key}`)
        error.stack = err.stack
        error.chain_params = task
        error.err = err
        this.tasks = []
        throw error
      }
    }
    this.tasks = []
    return this.state
  }

  [lookup](ast) {
    const val = this[astToValue].call(this, ast)
    return val === undefined ? null : val
  }

  [astToValue](ast) {
    switch (ast.type) {
      case 'literal': { // literal value
        return ast.value
      }

      case 'lookup': { // path lookup
        const data = ast.data
        const context = data.local ? data.context : this.state
        return object.get(context, ast.value)
      }

      case 'function': { // fn call
        const {value: fn, children} = ast
        return this[call](fn, children)
      }

      case 'ref': { // local context reference
        const node = ast.children[0]
        node.data.context = this.context
        return this[lookup](node)
      }
    }
  }

  [call](fn, args) {
    const fnkey = `$${fn}`
    if (typeof this[fnkey] !== 'function') return

    const mapper = this[astToValue].bind(this)
    const resolved = args.map(mapper)
    return this[fnkey].apply(this, resolved)
  }

  $random(bytes = 5) {
    return crypto.randomBytes(bytes).toString('hex')
  }

  $template(str) {
    return str.replace(/{{([^{}]*)}}/g, (match) => {
      let replacement = ''
      const key = match.slice(2, match.length - 2)
      if (key[0] === HASH.LABEL || key[0] === BANG.LABEL) {
        const val = this[lookup](this.parse(key))
        if (val) replacement = val
      }
      return replacement
    })
  }
}
