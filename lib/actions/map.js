'use strict'

/**
 * @module lib/actions/map
 * @author Darin Spivey
 **/

const assert = require('assert')
const {typeOf} = require('@answerbook/stdlib')

const NAME = 'SetupChain.map'
const ARRAY_ERR = `${NAME} first param should be an array.  Supports dynamic lookups`
const FN_ERR = `${NAME} second param should be a function`

module.exports = async function map(collection, fn) {
  const coll = this.lookup(collection)

  assert.equal(typeOf(coll), 'array', ARRAY_ERR)
  assert.equal(typeof fn, 'function', FN_ERR)

  if (typeOf(fn) === 'asyncfunction') {
    const tasks = []
    for (let i = 0; i < coll.length; i++) {
      tasks.push(fn.call(this, coll[i]))
    }
    return Promise.all(tasks)
  }

  // Normal function can use Array.map
  return coll.map(fn)
}

/**
 * Chain action that applies a map function to a collection.  The collection
 * may come from the state via .lookup() syntax, or be passed an array.
 * @async
 * @function module:lib/actions/map
 * @param {Array} collection The collection #name or array
 * @param {String} fn The function to execute for each array item.  Can be async
 * @example
 * await new SetupChain().map(
 *   '#my_collection'
 * , (item) => { return item.id }
 * , 'my_ids'
 * ).execute()
 **/
