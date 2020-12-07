'use strict'

const crypto = require('crypto')
const builtins = require('./actions/index.js')
const object = require('./lang/object/index.js')
const typeOf = require('./lang/type-of.js')
const parseFnCall = require('./parse-fn-call.js')
const LOOKUP_EXP = /^(#|!)(.*)/

const kLookup = Symbol('kLookup')

const COMPLEX_LOOKUP_TYPES = new Set([
  'string'
, 'date'
, 'moment'
])

module.exports = class SetupChain {
  constructor(state, actions) {
    this.state = state || {}
    this.keep = {}
    this.tasks = []
    this.actions = {
      ...builtins
    , ...(actions || {})
    }

    const childMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
    for (const name of Object.keys(this.actions)) {
      if (object.hasOwnProperty(SetupChain.prototype, name)
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

  set(key, value) {
    this.keep[key] = value
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
    if (!path) return null
    const path_type = typeOf(path)
    // Don't screw up Date's / moment prototype.  Terminate iteration if a complex type.
    if (COMPLEX_LOOKUP_TYPES.has(path_type)) return this[kLookup](path)

    const out = Object.create(null)
    // path is an object remap values with lookup result
    for (const [key, value] of Object.entries(path)) {

      // remap array values with lookup result
      if (Array.isArray(value)) {
        out[key] = value.map((val) => {
          if (val && typeof val === 'object') return this.lookup(val)
          return this[kLookup](val)
        })
        continue
      }

      if (value && typeof value === 'object') {
        out[key] = this.lookup(value)
        continue
      }
      out[key] = this[kLookup](value)
    }

    if (Array.isArray(path)) return Object.values(out)

    return out
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

  [kLookup](key) {
    const parts = LOOKUP_EXP.exec(key)
    if (!parts) return key
    const operator = parts[1]
    const lookup = parts[2]

    if (!lookup) {
      const error = new Error(`Invalid state lookup expression: ${key}`)
      error.code = 'ENOLOOKUP'
      throw error
    }
    let val

    switch (operator) {
      case '#': { // path lookup
        val = object.getProperty(this.state, lookup)
        break
      }
      case '!': { // fn call
        const {fn, args} = parseFnCall(lookup)
        const fnkey = `$${fn}`
        if (typeOf(this[fnkey]) === 'function') {
          val = this[fnkey].apply(this, args)
        }
        break
      }
    }

    return val === undefined ? null : val
  }

  $random(bytes = 5) {
    return crypto.randomBytes(bytes).toString('hex')
  }

  $template(str) {
    return str.replace(/{{([^{}]*)}}/g, (match) => {
      let replacement = ''
      const key = match.slice(2, match.length - 2)
      if (key[0] === '#') {
        const val = this[kLookup](key)
        if (val) replacement = val
      }

      return replacement
    })
  }
}
