'use strict'
const {test, threw} = require('tap')

const array = require('../../../lib/lang/array/index.js')

test('Exports as expected', async (t) => {
  const entries = Object.entries(array)
  t.equal(entries.length, 1, 'function count')
  t.match(array, {
    toArray: Function
  }, 'function names')
})

test('array', (t) => {
  t.test('toArray', (tt) => {
    const cases = [
      {value: undefined, expected: [], message: 'toArray(undefined) == []'}
    , {value: null, expected: [], message: 'toArray(null) == []'}
    , {value: '', expected: [], message: 'toArray(\'\') == []'}
    , {value: 'test', expected: ['test']}
    , {value: '1,2,3', expected: ['1', '2', '3']}
    , {value: [1, 2, 3], expected: [1, 2, 3]}
    , {value: {}, expected: [{}], message: 'toArray({}) == [{}]'}
    , {value: new Set([1, null, 'test']), expected: [1, null, 'test']}
    ]
    for (const current of cases) {
      tt.deepEqual(
        array.toArray(current.value)
        , current.expected
        , current.message || `toArray(${current.value}) == ${current.expected}`
      )
    }
    tt.end()
  })
  t.end()
}).catch(threw)

