'use strict'

const SetupChain = require('../../index.js')

const defaults = {
  first: 'bobby'
, last: 'fischer'
, full: '!template:"{{#this.first}} {{#this.last}}"'
}

{
  const chain = new SetupChain(null, {
    person: async function person(opts = {}) {
      return this.lookup({
        ...defaults
      , ...opts
      })
    }
  })

  chain
    .person(null, 'bobby') // use only defaults
    .person({first: 'fred'}, 'fred') // set first to fred
    .person({last: 'williams'}, 'williams') // set last to williams
    .execute()
    .then(console.log)
}
