'use strict'

// functions are defined as syncronous functions prefixed with a $
// functions are executed by name when prefixed by a bang !
const SetupChain = require('../../index.js')

class FunctionChain extends SetupChain {
  $plusone(value = 0) {
    return value + 1
  }

  $plustwo(value = 0) {
    return value + 2
  }
}

{
  // function can take 3 forms
  const chain = new FunctionChain({ten: 10})

  // no args - !foo
  console.log('!plusone ->', chain.lookup('!plusone'))

  // short hplus args - !foo:1,2,3
  console.log('!plusone:1 ->', chain.lookup('!plusone:1'))

  // stplusard call args - !foo(1, 2, 3)
  console.log('!plusone(2) ->', chain.lookup('!plusone(2)'))

  // function arguments can also be function calls
  console.log('!plustwo(!plusone:3) ->', chain.lookup('!plustwo(!plusone:3)'))

  // function arguments can also be function calls which access state
  console.log('!plustwo(!plusone:#ten) ->', chain.lookup('!plustwo(!plusone:#ten)'))
}

