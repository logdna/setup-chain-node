'use strict'

const {test, threw} = require('tap')
const Chain = require('../../../lib/chain.js')
const actions = require('../../fixtures/actions/index.js')

class MapChain extends Chain {
  constructor(state) {
    super(state, actions)
  }
}

async function addOne(num) {
  return num + 1
}

test('SetupChain.map() as a builtin action', async (t) => {
  const chain = new MapChain()

  t.test('map method exists', async (t) => {
    t.type(chain.map, 'function', 'map is a function')
  })

  t.test('Success; map a given array with a non-async function', async (t) => {
    const state = await chain
      .map([1, 2, 3], (num) => { return num === 2 }, 'is_two')
      .execute()

    const expected = [false, true, false]
    t.same(state.is_two, expected, 'Expected result in state')
    t.same(chain.state.is_two, expected, 'Expected result in chain.state')
  })

  t.test('Success; map #lookup with a non-async function', async (t) => {
    const state = await chain
      .set('my_array', [1, 2, 3])
      .map('#my_array', (num) => { return num === 2 }, 'is_two')
      .execute()

    const expected = [false, true, false]
    t.same(state.is_two, expected, 'Expected result in state')
    t.same(chain.state.is_two, expected, 'Expected result in chain.state')
  })

  t.test('Success; map #lookup with an async arrow function', async (t) => {
    const state = await chain
      .set('my_array', [1, 2, 3])
      .map('#my_array', async (num) => {
        // Just to prove you can `await` in this test
        const result = await addOne(num)
        return result
      }, 'add_one')
      .execute()

    const expected = [2, 3, 4]
    t.same(state.add_one, expected, 'Expected result in state')
    t.same(chain.state.add_one, expected, 'Result in chain.state')
  })

  t.test('Success; map #lookup with an async Function', async (t) => {
    const state = await chain
      .set('my_array', [1, 2, 3])
      .map('#my_array', async function addOneSecond(num) {
        const result = await addOne(num)
        return result
      }, 'one_sec_Func')
      .execute()

    const expected = [2, 3, 4]
    t.same(state.one_sec_Func, expected, 'Expected result in state')
    t.same(chain.state.one_sec_Func, expected, 'Result in chain.state')
  })

  t.test('Error: first parameter is not an array', async (t) => {
    const msg = new RegExp(
      'first param should be an array.  Supports dynamic lookups'
    )

    t.rejects(chain.map().execute(), {
      err: msg
    }, 'No parameters')

    t.rejects(chain.map(null).execute(), {
      err: msg
    }, 'collection is null')

    t.rejects(chain.map({}).execute(), {
      err: msg
    }, 'collection is an object')

    t.rejects(chain.map('NOPE').execute(), {
      err: msg
    }, 'collection is a string with no #lookup')
  })

  t.test('Error: second parameter is not a function', async (t) => {
    const msg = new RegExp('second param should be a function')

    t.rejects(chain.map([], 'nope').execute(), {
      err: msg
    }, 'string is not a function')

    t.rejects(chain.map([], {}).execute(), {
      err: msg
    }, 'object is not a function')
  })
}).catch(threw)
