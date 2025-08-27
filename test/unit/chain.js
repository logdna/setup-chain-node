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
    t.equal(chain.context, state, 'ctx defaults to state if context stack is empty')

    chain.set('x', 1000)
    await chain.execute()

    t.equal(chain.lookup(), null, 'no input returns null')
    t.equal(chain.lookup(null), null, 'no input returns null')
    t.equal(chain.lookup('a'), 'a', 'returns literal values')
    t.equal(chain.lookup('*'), '*', 'returns literal values')
    t.same( // same will ignore that the `found` has a null prototype, but expected doesn't
      chain.lookup({one: 1, two: 2})
    , {one: 1, two: 2}
    , 'Returns object literals with no substitutions'
    )
    t.same(
      chain.lookup([5, 'something', {one: 1}])
    , [5, 'something', {one: 1}]
    , 'Returns array literals with no substitutions, but mixed types'
    )
    t.equal(
      chain.lookup(
        '2020-11-21T19:16:27.705Z'
      )
    , '2020-11-21T19:16:27.705Z'
    , 'returns literal values'
    )
    t.equal(chain.lookup(true), true, 'returns literal values')
    t.equal(chain.lookup(1), 1, 'returns literal values')
    t.equal(chain.lookup('#a'), 1, 'can lookup single values')
    t.equal(chain.lookup('#x'), 1000, 'initial values accessable')
    t.throws(() => {
      chain.lookup('#')
    }, /expecting: expecting at least one iteration/i)

    {
      const val = chain.lookup('!random')
      t.type(val, 'string')
      t.not(val, '!random', 'function call executed')
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
      t.same(chain.lookup(lookup), expected)
    }

    {
      const expected = {key: 11, array: [1, 2, 3]}
      const lookup = {key: '#g', array: ['#a', '#b.c', '#b.d.e']}
      t.same(chain.lookup(lookup), expected, 'can look through an array')
    }

    {
      const expected = {key: 11, array: [{a: 2, b: 10}]}
      const lookup = {key: '#g', array: [{a: '#b.c', b: '#f'}]}
      t.same(chain.lookup(lookup), expected, 'can look through an array')
    }

    {
      const lookup = ['!notfound']
      t.throws(() => { chain.lookup(lookup) }, {
        name: 'TypeError'
      , message: '\'notfound\' is not a callable chain function'
      }, 'invalid function lookup throws')
    }

    {
      const expected = [null]
      const lookup = ['#fake']
      t.same(chain.lookup(lookup), expected, 'invalid key lookup returns null')
    }

    {
      const expected = [11, 2]
      const lookup = ['#g', '#b.c']
      t.same(chain.lookup(lookup), expected, 'can populate an array')
    }

    {
      const expected = {position: [11, 2]}
      const lookup = {position: [11, 2]}
      t.same(chain.lookup(lookup), expected, 'array values parse number literals')
    }

    {
      const expected = {key: 11, values: [2, 10, {foo: 3}]}
      const lookup = {key: '#g', values: ['#b.c', '#f', {foo: '#b.d.e'}]}
      t.same(chain.lookup(lookup), expected, 'can populate nested object/array')
    }

    {
      const expected = {key: 11, rand: String}
      const lookup = {key: '#g', rand: '!random'}
      const out = chain.lookup(lookup)
      t.match(out, expected, 'can eval function in object')
      t.not(out.rand, lookup.rand, 'random value generated')
    }

    {
      const expected = {tpl: '1, - [11] -  - 2'}
      const lookup = {
        tpl: '!template:"{{#a}}, - [{{#g}}] - {{#missing}} - {{#b.c}}{{noprefix}}"'
      }
      const out = chain.lookup(lookup)
      t.same(out, expected, 'templated string replaced with values from the chain')
    }

    {
      const expected = {tpl: /the value [a-f0-9]{6} is random/i}
      const lookup = {
        tpl: '!template:"the value {{!random:3}} is random"'
      }

      const out = chain.lookup(lookup)
      t.match(out, expected, 'templated string values support function calls')
    }

    {
      t.throws(() => {
        chain.lookup('#foo.this')
      }, /expecting token of type --> identifier <-- but found --> 'this' <--/i)
    }

    {
      t.throws(() => {
        chain.lookup('#this')
      }, /expecting token of type --> dot <-- but found --> '' <--/i)
    }

    {
      const expected = {
        empty: null
      , key: 'world'
      , alt: 'bill'
      , name: 'hello {{#this.key}} {{#this.alt}}'
      , output: 'hello world bill'
      , nested: [
          {deep: 'yes', works: 'yes'}
        , {deep: 'no', works: 'no'}
        ]
      }

      const out = chain
        .lookup({
          empty: '#this.does_not_exist'
        , key: 'world'
        , alt: 'bill'
        , name: 'hello {{#this.key}} {{#this.alt}}'
        , output: '!template:#this.name'
        , nested: [{
            deep: 'yes'
          , works: '#this.deep'
          }, {
            deep: 'no'
          , works: '#this.deep'
          }]
        })
      t.match(out, expected, '#this references context object it belongs to')
    }

  })
  t.test('#set', async (t) => {
    {
      const state = await new Chain().set('foo.bar', 'hello world').execute()
      t.same(state, {
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

      t.same(state, {
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
        .set('message', '!template:"{{#foo}} added first, then in an array [{{#two.0}}]"')
        .execute()

      t.match(state, {
        one: /^[a-f0-9]{10,}/
      , two: ['bar', state.one]
      , foo: 'bar'
      , set: undefined
      , message: 'bar added first, then in an array [bar]'
      }, 'can resolve array values')
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
    t.same(chain.tasks, [], 'internal tasks reset')
    t.same(chain.context, [], 'internal context reset')

    const reset = await chain.execute()
    t.match(state, reset, 'can set nested literal values')
    t.same(chain.state, {
      foo: {
        bar: 'hello world'
      }
    }, 'internal state reset')
  })

}).catch(threw)
