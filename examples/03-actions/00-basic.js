'use strict'

const SetupChain = require('../../index.js')

{
  const chain = new SetupChain(null, {
    hello: async function hello(name) {
      return name
    }
  })

  chain
    .hello('world') // assign result of action `hello` to key named after the function
    .hello('world', 'goodbye') // assign result of action `hello` to key "goodbye"
    .execute()
    .then(console.log)
}
