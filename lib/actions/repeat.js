'use strict'

/**
 * @module lib/actions/repeat
 * @author Darin Spivey
 **/

const assert = require('assert')
const typeOf = require('../lang/type-of.js')
const object = require('../lang/object/index.js')

const NAME = 'SetupChain.repeat'
const TIMES_ERR = `${NAME} requires 'times' to be an integer`
const ACTION_ERR = `${NAME} 'action' invalid`

module.exports = async function repeat(times, action, opts) {
  assert.equal(typeOf(times), 'number', TIMES_ERR)
  assert.ok(
    object.hasOwnProperty(this.actions, action)
  , `${ACTION_ERR}. '${action}' does not exist as a chain action.`
  )

  const tasks = []
  const fn = this.actions[action]
  for (let i = 0; i < times; i++) {
    tasks.push(fn.call(this, opts))
  }
  return Promise.all(tasks)
}

/**
 * Chain action that repeats a specified action N number of times
 * @async
 * @function module:lib/actions/repeat
 * @param {Object} input
 * @param {Number} input.times The number times to run the action
 * @param {String} input.action The name of the chain action to execute
 * @param {Object} [input.opts] Options to pass to the action
 * @example
 * await new SetupChain().repeat(10, 'sleep', {ms: 10}).execute()
 **/
