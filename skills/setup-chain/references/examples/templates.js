// Using templates and random
const SetupChain = require('@logdna/setup-chain')
const chain = new SetupChain()

chain.set('name', 'Alice').set('email', 'alice@example.com').execute()
chain.lookup('!template:"Hello, {{#name}}!"')  // 'Hello, Alice!'
chain.lookup('!template:"User {{#name}} ({{#email}})"')  // 'User Alice (alice@example.com)'
chain.lookup('!random:10')  // random hex string like 'a7f39c2e4e'
chain.lookup('!template:"ID-{{#this.name}}-{{!random:8}}"')