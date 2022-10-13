'use strict'

/**
 * @module lib/actions/serial
 * @author Eric Satterwhite
 **/

const assert = require('assert')
const {typeOf, object} = require('@logdna/stdlib')

const NAME = 'SetupChain.serial'
const TIMES_ERR = `
  ${NAME} requires 'times' to be an integer and greater than or equal to 0
`.trim()

const ACTION_ERR = `${NAME} 'action' invalid`

module.exports = async function serial(times, action, opts) {
  assert.equal(typeOf(times), 'number', TIMES_ERR)
  assert.ok(times >= 0, TIMES_ERR)
  assert.ok(Number.isInteger(times), TIMES_ERR)
  assert.ok(Number.isFinite(times), TIMES_ERR)
  assert.ok(
    object.has(this.actions, action)
  , `${ACTION_ERR}. '${action}' does not exist as a chain action.`
  )

  const results = new Array(times)
  const fn = this.actions[action]

  for (let i = 0; i < times; i++) {
    results[i] = await fn.call(this, opts)
  }

  return results
}

/**
 * Chain action that similar to {@link module:lib/actions/repeat|repeat} but always executes
 * in a sequential order.
 * @async
 * @function module:lib/actions/serial
 * @param {Object} input
 * @param {Number} input.times The number of times to run the action
 * @param {String} input.action The name of the chain action to execute
 * @param {Object} [input.opts] Options to pass to the action
 * @example
 * await new SetupChain().serial(10, 'delay', {value: '!template("{{!increment}}")'}).execute()
 **/

