// Basic set() usage
const SetupChain = require('@logdna/setup-chain')
const chain = new SetupChain()
await chain.set('hello', 'world').set('goodbye', 'world').execute()
// state: {hello: 'world', goodbye: 'world'}