'use strict'

const SetupChain = require('../../index.js')

/**
 * The first argument to the constructor is
 * an object that is used as the initial data set
 * to be used during execution. Using the output from
 * one chain as the input to another is a simple way to
 * reuse data across multiple chains
 **/

{
  const chain = new SetupChain({x: 1})

  chain
    .set('hello', 'world')
    .set('goodbye', 'world')
    .execute()
    .then((state) => {
      // new chain seeded with data from
      // a previous chain
      new SetupChain(state)
        .set('foo', 'bar')
        .execute()
        .then(console.log)
    })
}
