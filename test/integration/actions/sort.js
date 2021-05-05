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

  t.test('chain.sort is a function', async (t) => {
    t.type(chain.sort, 'function', 'sort is a function')
  })

  t.test('Success; Call sort for a given collection', async (t) => {
    const coll = ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    const state = await chain
      .sort(coll, comparator, 'coll_sorted')
      .execute()

    const expected = ['app', 'biz', 'biz', 'clunk', 'goof', 'zarf']
    t.same(state.coll_sorted, expected, 'Expected result in state')
    t.same(chain.state.coll_sorted, expected, 'Expected result in chain.state')
    t.same(
      coll
    , ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    , 'Original array is NOT mutated due to .lookup'
    )
  })

  t.test('Success; Call sort for lookup value', async (t) => {
    const coll = ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    const state = await chain
      .set('my_collection', coll)
      .sort('#my_collection', comparator, 'lookup_sorted')
      .execute()

    const expected = ['app', 'biz', 'biz', 'clunk', 'goof', 'zarf']
    t.same(state.lookup_sorted, expected, 'Expected result in state')
    t.same(chain.state.lookup_sorted, expected, 'Result in chain.state')
    t.same(
      coll
    , ['biz', 'zarf', 'biz', 'clunk', 'goof', 'app']
    , 'Original array is NOT mutated due to .lookup'
    )
  })

  t.test('Error: collection is not an array', async (t) => {
    const msg = new RegExp(
      'first param should be an array.  Supports dynamic lookups'
    )

    t.rejects(chain.sort().execute(), {
      err: msg
    }, 'No parameters')

    t.rejects(chain.sort(null).execute(), {
      err: msg
    }, 'collection is null')

    t.rejects(chain.sort({}).execute(), {
      err: msg
    }, 'collection is an object')

    t.rejects(chain.sort('ten').execute(), {
      err: msg
    }, 'collection is a string')
  })

  t.test('Error: comparator is not a function', async (t) => {
    const msg = new RegExp('second param should be a sort comparator function')
    t.rejects(chain.sort([], 'NOPE').execute(), {
      err: msg
    }, 'Bad sort function')
  })
}).catch(threw)
