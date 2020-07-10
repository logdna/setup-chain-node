'use strict'
/**
 * @module lib/lang/object/get-property
 * @author Eric Satterwhite
 */

module.exports = function getProperty(obj, string = '', sep = '.') {
  const parts = string.split(sep)
  let ret = obj
  const last = parts.pop()
  let prop
  while ((prop = parts.shift())) {
    ret = ret[prop]
    /* eslint-disable no-eq-null */
    if (ret == null) return ret
  }
  return ret[last]
}

/**
 * Given an object and a character-delimited string of keys (for deep nesting),
 * returns the value for the key.
 * @function module:lib/lang/object/get-property
 * @param {Object} obj The input object
 * @param {String} string The key(s) value
 * @param {String} [sep='.'] Delimit character
 * @returns {Mixed} Returns whatever value is found at the key
 * @example
 * const obj = {one: { two: three: 3 } }
 * const value = getProperty(obj, 'one-two-three', '-')
 */

