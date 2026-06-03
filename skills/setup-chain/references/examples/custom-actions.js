// Custom actions with defaults
const SetupChain = require('@logdna/setup-chain')

const defaults = {
  first: 'bobby'
, last: 'fischer'
, full: '!template:"{{#this.first}} {{#this.last}}"'
}

const actions = {
  person: async function person(opts) {
    return this.lookup({...defaults, ...opts})
  }
}

const chain = new SetupChain(null, actions)
const state = await chain
  .person({}, 'bobby')  // uses defaults
  .person({first: 'fred'}, 'fred')
  .person({last: 'williams'}, 'williams')
  .execute()
// state: {
//   bobby: {first: 'bobby', last: 'fischer', full: 'bobby fischer'},
//   fred: {first: 'fred', last: 'fischer', full: 'fred fischer'},
//   williams: {first: 'bobby', last: 'williams', full: 'bobby williams'}
// }
