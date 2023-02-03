'use strict'
/**
 * @module lib/lang/typeof
 * @author Eric Satterwhite
 **/

const TYPE_EXP = /^\[object (.*)\]$/
const toString = Object.prototype.toString

module.exports = function typeOf(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (value._isAMomentObject && typeof value.format === 'function') return 'moment'
  if (value.isLuxonDateTime) return 'luxondatetime'
  if (value.isLuxonInterval) return 'luxoninterval'
  if (value.isLuxonDuration) return 'luxonduration'
  const parts = TYPE_EXP.exec(toString.call(value))
  return parts[1].toLowerCase()
}

/**
 * A more accurate version of the javascript built-in function typeof
 * Date strings in ISO format are special cased to identify as `'date'`
 * and `moment` (date) instances return `'moment'`.
 * @function module:lib/lang/type-of
 * @param {Any} value The javascript object to type check
 * @returns {String} The type of the object passed in
 * @example
 * typeOf([]) // 'array'
 * typeOf(/\w+/) // 'regexp'
 * @example
 * class FooBar {
 *   get [Symbol.toStringTag]() {
 *     return 'foobar'
 *   }
 * }
 * typeOf(new FooBar()) // 'foobar'
 *
 * @example
 * const moment = require('moment')
 * typeOf(new Date('1-31-2016')) // 'date'
 * typeOf(moment('2016-01-31')) // 'moment'
 **/
