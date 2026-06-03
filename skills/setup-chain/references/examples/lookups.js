// Lookup syntax examples
const SetupChain = require('@logdna/setup-chain')
const chain = new SetupChain(
  {one: 1, two: 2, three: 3, four: ['a', 'b', 'c']}
, {
    myAction: async function(opts) {
      return this.lookup(opts)
    }
  }
)

console.log(chain.lookup('#one'))  // 1
console.log(chain.lookup('#four.1'))  // 'b'
console.log(chain.lookup(['#one', '#two']))  // [1, 2]
console.log(chain.lookup({
  one: '#one'
, nested: '#three'
}))


console.dir(
  await chain.myAction({four: '#four.0'}).execute()
) // {myAction: {four: 'a'}}
