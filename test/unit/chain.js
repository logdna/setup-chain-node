const {test, threw} = require('tap')
const Chain = require('../../index.js')
const state = {
  a: 1
, b: {
    c: 2
  , d: {
      e: 3
    }
  }
, f: 10
, g: 11
}
test('create-chain#lookup', async (t) => {
  const chain = new Chain(state)
  chain.set('x', 1000)
  await chain.execute()

  t.strictEqual(chain.lookup(), null, 'no input returns null')
  t.equal(chain.lookup('a'), 'a', 'returns literal values')
  t.equal(chain.lookup('#a'), 1, 'can lookup single values')
  t.equal(chain.lookup('#x'), 1000, 'initial values accessable')
  t.throws(() => {
    chain.lookup('#')
  }, /invalid state lookup/i)

  {
    const val = chain.lookup('!random')
    t.type(val, 'string')
    t.notEqual(val, '!random', 'function call executed')
  }

  {
    const short = chain.lookup('!random:2')
    const long = chain.lookup('!random:10')
    t.type(short, 'string')
    t.type(long, 'string')
    t.ok(long.length > short.length, 'arguments passed')
  }

  {
    const expected = {key: 1, nested: {key: 3}}
    const lookup = {key: '#a', nested: {key: '#b.d.e'}}
    t.deepEqual(chain.lookup(lookup), expected)
  }

  {
    const expected = {key: 11, array: [1, 2, 3]}
    const lookup = {key: '#g', array: ['#a', '#b.c', '#b.d.e']}
    t.deepEqual(chain.lookup(lookup), expected, 'can look through an array')
  }

  {
    const expected = {key: 11, array: [{a: 2, b: 10}]}
    const lookup = {key: '#g', array: [{a: '#b.c', b: '#f'}]}
    t.deepEqual(chain.lookup(lookup), expected, 'can look through an array')
  }

  {
    const expected = [null]
    const lookup = ['!notfound']
    t.deepEqual(chain.lookup(lookup), expected, 'invalid key lookup returns null')
  }

  {
    const expected = [null]
    const lookup = ['#fake']
    t.deepEqual(chain.lookup(lookup), expected, 'invalid key lookup returns null')
  }

  {
    const expected = [11, 2]
    const lookup = ['#g', '#b.c']
    t.deepEqual(chain.lookup(lookup), expected, 'can populate an array')
  }

  {
    const expected = {key: 11, rand: String}
    const lookup = {key: '#g', rand: '!random'}
    const out = chain.lookup(lookup)
    t.match(out, expected, 'can eval function in object')
    t.notEqual(out.rand, lookup.rand, 'random value generated')
  }
}).catch(threw)
