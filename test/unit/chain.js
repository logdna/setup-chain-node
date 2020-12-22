'use strict'

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

test('chain', async (t) => {
  t.test('#lookup', async (t) => {
    const chain = new Chain(state)
    chain.set('x', 1000)
    await chain.execute()

    t.strictEqual(chain.lookup(), null, 'no input returns null')
    t.strictEqual(chain.lookup(null), null, 'no input returns null')
    t.strictEqual(chain.lookup('a'), 'a', 'returns literal values')
    t.strictEqual(chain.lookup(true), true, 'returns literal values')
    t.strictEqual(chain.lookup(1), 1, 'returns literal values')
    t.strictEqual(chain.lookup('#a'), 1, 'can lookup single values')
    t.strictEqual(chain.lookup('#x'), 1000, 'initial values accessable')
    t.throws(() => {
      chain.lookup('#')
    }, /expecting: one of these possible token sequences:/i)

    {
      const val = chain.lookup('!random')
      t.type(val, 'string')
      t.notStrictEqual(val, '!random', 'function call executed')
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
      const expected = {key: 11, values: [2, 10, {foo: 3}]}
      const lookup = {key: '#g', values: ['#b.c', '#f', {foo: '#b.d.e'}]}
      t.deepEqual(chain.lookup(lookup), expected, 'can populate nested object/array')
    }

    {
      const expected = {key: 11, rand: String}
      const lookup = {key: '#g', rand: '!random'}
      const out = chain.lookup(lookup)
      t.match(out, expected, 'can eval function in object')
      t.notStrictEqual(out.rand, lookup.rand, 'random value generated')
    }

    {
      const expected = {tpl: '1, - [11] -  - 2'}
      const lookup = {
        tpl: '!template:"{{#a}}, - [{{#g}}] - {{#missing}} - {{#b.c}}{{noprefix}}"'
      }
      const out = chain.lookup(lookup)
      t.deepEqual(out, expected, 'templated string replaced with values from the chain')
    }

    {
      const expected = {tpl: /the value [a-f0-9]{6} is random/i}
      const lookup = {
        tpl: '!template:"the value {{!random:3}} is random"'
      }

      const out = chain.lookup(lookup)
      t.match(out, expected, 'templated string values support function calls')
    }
  })
  t.test('#set', async (t) => {
    {
      const state = await new Chain().set('foo.bar', 'hello world').execute()
      t.deepEqual(state, {
        foo: {
          bar: 'hello world'
        }
      , set: undefined
      }, 'can set nested literal values')
    }

    {
      const state = await new Chain()
        .set('one', 2)
        .set('foo.bar', '#one')
        .execute()

      t.deepEqual(state, {
        one: 2
      , foo: {
          bar: 2
        }
      , set: undefined
      }, 'can set nested lookup values')
    }

    {
      const state = await new Chain()
        .set('foo', 'bar')
        .set({
          one: '!random'
        , two: ['#foo', '#one']
        })
        .execute()

      t.match(state, {
        one: /^[a-f0-9]{10,}/
      , two: ['bar', state.one]
      , foo: 'bar'
      , set: undefined
      }, 'can resolve array values')
    }

    {
      const chain = new Chain().set('foo', 'foo.bar')
      t.rejects(chain.execute(), /setup chain error in set/gi)
    }
  })

  t.test('reset', async (t) => {
    const chain = new Chain().set('foo.bar', 'hello world')
    const state = await chain.execute()
    t.match(state, {
      foo: {
        bar: 'hello world'
      }
    }, 'can set nested literal values')

    chain.set('foo.bar', 'goodbye').reset()
    t.deepEqual(chain.tasks, [], 'internal tasks reset')

    const reset = await chain.execute()
    t.match(state, reset, 'can set nested literal values')
    t.deepEqual(chain.state, {
      foo: {
        bar: 'hello world'
      }
    }, 'internal state reset')
  })


}).catch(threw)
