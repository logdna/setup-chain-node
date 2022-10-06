'use strict'

const SetupChain = require('../../index.js')
class Chain extends SetupChain {
  $add(lh = 0, rh = 0) {
    return lh + rh
  }
}

{
  const chain = new Chain()
  console.log(chain.lookup({
    one: 1
  , two: 2
  , three: '!add(#one, #two)'
  }))
}

{
  const chain = new Chain()
  console.log(chain.lookup({
    one: 1
  , two: 2
  , three: '!add(#this.one, #this.two)'
  }))
}
