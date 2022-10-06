'use strict'

const SetupChain = require('../../index.js')

{
  const chain = new SetupChain({
    one: 1
  , two: 2
  , three: 3
  , four: [4, 5]
  })

  // simple property lookup
  console.log(
    'chain.lookup(#one) ->'
  , chain.lookup('#one')
  )

  // read array position
  console.log(
    'chain.lookup(#four.1) ->'
  , chain.lookup('#four.1')
  )

  /**
   * If the lookup function encounters an array
   * It will iterate over each element executing itself
   * on the each value. This can be used to construct dynamic arrays
   **/
  console.log(
    'chain.lookup([#one, #two]) ->'
  , chain.lookup(['#one', '#two'])
  )

  /**
   * If the lookup function encounters an object
   * It will recursively iterate over the keys until
   * a scaler value is returned. This can be used to construct
   * complex nested objects
   **/
  console.log(
    'chain.lookup(\'{one: #one, two: [#two, {key: #three}]} \') ->\n'
  , chain.lookup({
      one: '#one'
    , two: ['#two', {key: '#three'}]
    })
  )
}
