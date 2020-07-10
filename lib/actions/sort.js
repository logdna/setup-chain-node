'use strict'

/**
 * @module lib/actions/sort
 * @author Darin Spivey
 **/

const assert = require('assert')
const typeOf = require('../lang/type-of.js')

const NAME = 'SetupChain.sort'
const ARRAY_ERR = `${NAME} first param should be an array.  Supports dynamic lookups`
const FN_ERR = `${NAME} second param should be a sort comparator function`

module.exports = async function map(collection, comparator) {
  const coll = this.lookup(collection)

  assert.equal(typeOf(coll), 'array', ARRAY_ERR)
  assert.equal(typeof comparator, 'function', FN_ERR)

  return coll.slice().sort(comparator) // Make sure we don't mutate
}

/**
 * Chain action that applies a sort function to a collection.  The collection
 * may come from the state via .lookup() syntax, or be passed an array.
 * @async
 * @function module:lib/actions/sort
 * @param {Array} collection The collection #name or array
 * @param {String} comparator The comparator function used by
 *   {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort|Javascript's sort function}
 * @example
 * await new SetupChain().sort(
 *   '#my_collection'
 * , (a, b) => {
 *     if (a < b) return -1
 *     if (a > b) return 1
 *     return 0
 *   }
 * , 'my_sorted'
 * ).execute()
 **/
