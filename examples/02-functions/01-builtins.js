'use strict'

const SetupChain = require('../../index.js')

{ // The random function generates a random number of bytes as a hex string
  const chain = new SetupChain()

  console.log('!random ->', chain.lookup('!random'))
  console.log('!random:10 ->', chain.lookup('!random:10'))
  console.log('!random(20) ->', chain.lookup('!random(20)'))
}

{ // The template function can execute basic placeholder replacements
  const chain = new SetupChain({hello: 'world', name: 'james brown'})
  console.log(
    '!template("hello {{#hello}}, i am {{#name}}") ->'
  , chain.lookup(
      '!template("hello {{#hello}}, i am {{#name}}")'
    )
  )
}

