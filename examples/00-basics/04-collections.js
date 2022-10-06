'use strict'

const SetupChain = require('../../index.js')

{ // map() works much like Array.prototype.map(), appying an iterator function
  // to each item of the input
  const chain = new SetupChain()

  chain
    .map([1, 2, 3], function addOne(num) {
      return num + 1
    }, 'added_one')
    .map('#added_one', function timesTwo(num) {
      return num * 2
    }, 'times_two')
    .execute()
    .then(console.log)
}

{ // sort() works much like Array.prototype.map(), appying an iterator function
  // to each item of the input
  const chain = new SetupChain()

  chain
    .set('unsorted', [2, 1, 3])
    .sort(
      '#unsorted',
      function comparator(a, b) {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      }
    , 'sorted'
    )
    .execute()
    .then(console.log)
}
