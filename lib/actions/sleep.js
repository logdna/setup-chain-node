'use strict'

/**
 * @module lib/actions/sleep
 * @author Eric Satterwhite
 **/

module.exports = function sleep(opts) {
  const {ms = 10} = opts
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Chain action that awaits for a specified number of milliseconds
 * @async
 * @function module:lib/actions/sleep
 * @param {Object} opts
 * @param {Number} [opts.ms=10] The number of milliseconds to sleep
 * @example
 * await new Chain().sleep({ms: 100}).execute()
 **/
