'use strict'

/**
 * @module lib/lang/iter/cycle
 * @author Eric Satterwhite
 **/

module.exports = cycle

/**
 * Creates generator that indefinitely cycles through elements in an array
 * The elements in the array can be anything
 * @generator
 * @function module:lib/lang/iter/cycle
 * @param {Array} items The items to cycle through
 * @yields {Object} The next element in the array
 * @example
 * const numbers = cylce([1, 2, 3])
 * numbers.next().value // 1
 * numbers.next().value // 2
 * numbers.next().value // 3
 * numbers.next().value // 1
 * numbers.next().value // 2
 * numbers.next().value // 3
 **/
function * cycle(items) {
  if (!Array.isArray(items)) {
    const error = new TypeError('first argument to cycle must be an array')
    throw error
  }

  const elements = items.slice()
  let idx = -1
  while (true) {
    idx = (idx + 1) % elements.length
    yield elements[idx]
  }
}

