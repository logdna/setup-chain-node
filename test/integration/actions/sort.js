'use strict'

const {test, threw} = require('tap')
const Chain = require('../../../lib/chain.js')
const actions = require('../../fixtures/actions/index.js')

class ActionsChain extends Chain {
  constructor(state) {
    super(state, actions)
  }
}

function comparator(a, b) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

test('SetupChain.sort() as a builtin action', async (t) => {
  const chain = new ActionsChain()

  t.test('chain.sort is a function', async (tt) => {
    tt.type(chain.sort, 'function', 'sort is a function')
  })

  t.test('Success; Call sort for a given collection', async (tt) => {
    const coll = ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    const state = await chain
      .sort(coll, comparator, 'coll_sorted')
      .execute()

    const expected = ['app', 'biz', 'biz', 'clunk', 'goof', 'zarf']
    tt.deepEqual(state.coll_sorted, expected, 'Expected result in state')
    tt.deepEqual(chain.state.coll_sorted, expected, 'Expected result in chain.state')
    tt.deepEqual(
      coll
    , ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    , 'Original array is NOT mutated due to .lookup'
    )
  })

  t.test('Success; Call sort for lookup value', async (tt) => {
    const coll = ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    const state = await chain
      .set('my_collection', coll)
      .sort('#my_collection', comparator, 'lookup_sorted')
      .execute()

    const expected = ['app', 'biz', 'biz', 'clunk', 'goof', 'zarf']
    tt.deepEqual(state.lookup_sorted, expected, 'Expected result in state')
    tt.deepEqual(chain.state.lookup_sorted, expected, 'Result in chain.state')
    tt.deepEqual(
      coll
    , ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    , 'Original array is NOT mutated due to .lookup'
    )
  })

  t.test('Error: collection is not an array', async (tt) => {
    const msg = new RegExp(
      'first param should be an array.  Supports dynamic lookups'
    )

    tt.rejects(chain.sort().execute(), {
      err: msg
    }, 'No parameters')

    tt.rejects(chain.sort(null).execute(), {
      err: msg
    }, 'collection is null')

    tt.rejects(chain.sort({}).execute(), {
      err: msg
    }, 'collection is an object')

    tt.rejects(chain.sort('ten').execute(), {
      err: msg
    }, 'collection is a string')
  })

  t.test('Error: comparator is not a function', async (tt) => {
    const msg = new RegExp('second param should be a sort comparator function')
    tt.rejects(chain.sort([], 'NOPE').execute(), {
      err: msg
    }, 'Bad sort function')
  })
}).catch(threw)
