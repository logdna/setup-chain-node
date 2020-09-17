'use strict'

/**
 * @module lib/lang/array/to-array
 * @author Eric Satterwhite
 **/

const CSV_SEP_EXP = /\s*,\s*/
module.exports = function toArray(item, sep = CSV_SEP_EXP) {
  if (!item) return []
  if (item instanceof Set) return Array.from(item)
  if (Array.isArray(item)) return item
  return typeof item === 'string' ? item.split(sep) : [item]
}

/**
 * Converts an item into an array. If a csv formatted string is provided
 * The elements of the csv will be parsed into elements of an array
 * If non-iterable object is provided it will be wrapped in a new single element array.
 * @function module:lib/lang/array/to-array
 * @param {Object|Set|String|Array} [item] The element to convert to an array
 * @param {RegExp|String} [sep=RegExp("\s*,\s*")] Pattern or string to delimit csv-formatted strings
 * @returns {Array} The provided item converted into an array
 * @example
 * toArray('1,2,3') // ['1', '2', '3']
 * @example
 * toArray() // []
 * @example
 * toArray(null) // []
 * @example
 * toArray(new Set()) // []
 **/
