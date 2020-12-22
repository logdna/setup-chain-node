'use strict'

/**
 * @module lib/actions/set
 * @author Eric Satterwhite
 **/

const {object} = require('@answerbook/stdlib')
const typeOf = require('../lang/type-of.js')

module.exports = set

async function set(key, value) {
  if (typeOf(key) === 'object') {
    for (const [k, v] of Object.entries(key)) kv.call(this, k, v)
    return
  }

  kv.call(this, key, value)
}

function kv(key, value) {
  let result = null
  try {
    result = this.lookup(value)
  } catch (err) {
    if (err.name !== 'NotAllInputParsedException') throw err
    result = value
  }
  object.set(this.keep, key, result)
  object.set(this.state, key, result)
}

/**
 * Injects a value into state during execution. keys may be object path notation (a.b).
 * values will be passed through the lookup function. The resolved values will be reset
 * in state across multiple executions
 * @async
 * @function module.lib/actions/set
 * @param {String|Object} key the named object key to store a value.
 *   If an object, each key will be persisted individually
 * @param {*} [value] The value to persist. This value will be passed through the lookup function
 * @example
 * const chain = new SetupChain({lost: true})
 * await chain
 *  .set('foo', 'hello world')
 *  .set('bar.baz', '!random')
 *  .set({
 *    a: 1
 *  , b: '!random'
 *  , 'c.d': '#a'
 *  })
 *  .execute()
 *  {lost: true, foo: 'hello world', a: 1, b: 'afc312', c: {d: 1}, bar: {baz: 'f1a24e'}}
 *
 *  chain.reset().execute()
 *  {foo: 'hello world', a: 1, b: 'afc312', c: {d: 1}, bar: {baz: 'f1a24e'}}
 **/
