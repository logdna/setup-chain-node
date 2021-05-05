'use strict'

const {test, threw} = require('tap')
const Chain = require('../../../lib/chain.js')
const actions = require('../../fixtures/actions/index.js')

class ActionsChain extends Chain {
  constructor(state) {
    super(state, actions)
  }
}

test('SetupChain.repeat() as a builtin action', async (t) => {
  const chain = new ActionsChain()

  t.test('chain.repeat is a function', async (t) => {
    t.type(chain.repeat, 'function', 'repeat is a function')
  })

  t.test('Success; Call repeat for an existing action', async (t) => {
    const state = await chain
      .repeat(5, 'name', {name: 'Bodhi'}, 'all_names')
      .execute()

    const expected = new Array(5).fill('Bodhi')
    t.same(state.all_names, expected, 'Expected result in state')
    t.same(chain.state.all_names, expected, 'Expected result in chain.state')
  })

  t.test('Success; Call repeat using a lookup', async (t) => {
    const state = await chain
      .repeat(2, 'greet', {names: '#all_names', greeting: 'Hi'}, 'all_greetings')
      .execute()

    const greetings = new Array(5).fill('Hi Bodhi')
    const expected = [greetings, greetings]
    t.same(state.all_greetings, expected, 'Expected result in state')
    t.same(chain.state.all_greetings, expected, 'Result in chain.state')
  })

  t.test('Error: times is not a number', async (t) => {
    const msg = new RegExp('requires \'times\' to be an integer')

    t.rejects(chain.repeat().execute(), {
      err: msg
    }, 'No parameters')

    t.rejects(chain.repeat(null).execute(), {
      err: msg
    }, 'times is null')

    t.rejects(chain.repeat({}).execute(), {
      err: msg
    }, 'times is an object')

    t.rejects(chain.repeat('ten').execute(), {
      err: msg
    }, 'times is a string')
  })

  t.test('Error: action is not a function', async (t) => {
    const msg = new RegExp('\'NOPE\' does not exist as a chain action')
    t.rejects(chain.repeat(10, 'NOPE').execute(), {
      err: msg
    }, 'Unknown action')
  })
}).catch(threw)
