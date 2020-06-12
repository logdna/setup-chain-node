'use strict'

const crypto = require('crypto')
const builtins = require('./actions/index.js')
const object = require('./lang/object/index.js')
const array = require('./lang/array/index.js')
const string = require('./lang/string/index.js')
const typeOf = require('./lang/type-of.js')
const LOOKUP_EXP = /^(#|!)(.*)/

const kLookup = Symbol('kLookup')

module.exports = class SetupChain {
  constructor(state = {}, actions = {}) {
    this.state = state
    this.keep = {}
    this.tasks = []
    this.actions = {
      ...builtins
    , ...actions
    }

    for (const name of Object.keys(this.actions)) {
      Object.defineProperties(this, {
        [name]: {
          enumerable: true
        , writable: false
        , configurable: true
        , value: function(opts, label) {
            this.tasks.push({key: name, opts, label})
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

  lookup(path) {
   if (!path) return null
    const path_type = typeOf(path)
    // Don't screw up Date's prototype.  Terminate iteration if date.
    if (path_type === 'string' || path_type === 'date') {
      return this[kLookup](path)
    }

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
      const {opts = {}, key, label} = task
      try {
        const fn = this.actions[key]
        this.state[label || key] = await fn.call(this, opts)
      } catch (err) {
        console.error(err)
        const error = new Error(`Setup Chain error in ${key}`)
        error.stack = err.stack
        error.chain_params = opts
        error.err = err
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
        const [fn, args] = lookup.split(':')
        const fnkey = `$${fn}`
        if (typeOf(this[fnkey]) === 'function') {
          val = this[fnkey].apply(this, array.toArray(args).map(string.typecast))
        }
        break
      }
    }

    return val === undefined ? null : val
  }

  // builder lookup functions
  $random(bytes = 5) {
    return crypto.randomBytes(bytes).toString('hex')
  }
}

