'use strict'

const {test, threw} = require('tap')
const Chain = require('../../../lib/chain.js')
const actions = require('../../fixtures/actions/index.js')

class ActionsChain extends Chain {
  constructor(state) {
    super(state, actions)
    this.count = 0
  }
  $incr() {
    return ++this.count
  }
}

test('SetupChain.serial() as a builtin action', async (t) => {
  const chain = new ActionsChain()

  t.test('chain.serial is a function', async (t) => {
    t.type(chain.serial, 'function', 'serial is a function')
  })

  t.test('Success; Call serial for an existing action', async (t) => {
    const state = await chain
      .serial(5, 'delay', {value: '!template("Bodhi {{!incr}}")'}, 'all_names')
      .execute()

    const expected = ['Bodhi 1', 'Bodhi 2', 'Bodhi 3', 'Bodhi 4', 'Bodhi 5']
    t.same(state.all_names, expected, 'Expected result in state')
    t.same(chain.state.all_names, expected, 'Expected result in chain.state')
  })

  t.test('Success; Call serial using a lookup', async (t) => {
    const state = await chain
      .serial(2, 'greet', {names: '#all_names', greeting: 'Hi'}, 'all_greetings')
      .execute()

    const greetings = [
      'Hi Bodhi 1'
    , 'Hi Bodhi 2'
    , 'Hi Bodhi 3'
    , 'Hi Bodhi 4'
    , 'Hi Bodhi 5'
    ]
    const expected = [greetings, greetings]
    t.same(state.all_greetings, expected, 'Expected result in state')
    t.same(chain.state.all_greetings, expected, 'Result in chain.state')
  })

  t.test('Error: times is not a number', async (t) => {
    const msg = new RegExp(
      'requires \'times\' to be an integer and greater than or equal to 0'
    )

    t.rejects(chain.serial().execute(), {
      err: msg
    }, 'No parameters')

    t.rejects(chain.serial(null).execute(), {
      err: msg
    }, 'times is null')

    t.rejects(chain.serial({}).execute(), {
      err: msg
    }, 'times is an object')

    t.rejects(chain.serial('ten').execute(), {
      err: msg
    }, 'times is a string')

    t.rejects(chain.serial(-1).execute(), {
      err: msg
    }, 'times is a a negetive number')

    t.rejects(chain.serial(1.1).execute(), {
      err: msg
    }, 'times is a decimal')

    t.rejects(chain.serial(Number.POSITIVE_INFINITY).execute(), {
      err: msg
    }, 'times is a infinate')

    t.rejects(chain.serial(NaN).execute(), {
      err: msg
    }, 'times is NaN')
  })

  t.test('Error: action is not a function', async (t) => {
    const msg = new RegExp('\'NOPE\' does not exist as a chain action')
    t.rejects(chain.serial(10, 'NOPE').execute(), {
      err: msg
    }, 'Unknown action')
  })
}).catch(threw)
