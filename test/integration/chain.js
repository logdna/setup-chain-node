'use strict'

const moment = require('moment')
const {test, threw} = require('tap')
const Chain = require('../../lib/chain.js')
const actions = require('../fixtures/actions/index.js')

test('Setup chain', async (t) => {
  t.test('base chain', async (tt) => {
    const start = new Date()
    const state = await new Chain({
      a: 'b'
    , c: {
        d: 'e'
      }
    })
      .sleep()
      .execute()

    const end = new Date()
    tt.ok((end - start) >= 10, 'sleep timeout elapsed')
    tt.deepEqual(state, {
      a: 'b'
    , c: {
        d: 'e'
      }
    , sleep: undefined
    }, 'initial state passed through constructor')
  })

  t.test('extended chain with passed-in actions', async (tt) => {
    class ExtendedChain extends Chain {
      constructor(state) {
        super(state, actions)
      }

      $double(value) {
        return value * 2
      }

      $last(...args) {
        return args[args.length - 1]
      }
      fake(opts, label) {
        this.tasks.push(null)
        return this
      }
    }

    {
      const state = await new ExtendedChain()
        .name({name: '!last:foo,bar,foobar'})
        .name({name: 'bill'}, 'name_2')
        .name({name: 'fred'}, 'name_3')
        .greet({
          greeting: 'Hello'
        , names: ['Jeff', '#name_2', '#name_3', '#name', '!double:3']
        })
        .sleep()
        .execute()

      tt.match(state, {
        name: 'foobar'
      , name_2: 'bill'
      , name_3: 'fred'
      , greet: [
          'Hello Jeff'
        , 'Hello bill'
        , 'Hello fred'
        , `Hello ${state.name}`
        , 'Hello 6'
        ]}, 'expected output')
    }

    tt.rejects(
      new ExtendedChain().error().execute()
    , /setup chain error in error/i
    )
    tt.rejects(
      new ExtendedChain().fake().execute()
    , /tasks must be an array of objects/i
    )
  })

  t.test('Custom action signatures are not auto-exposed', async (tt) => {
    async function printNames(first, last) {
      return `Hello, ${first} ${last}`
    }
    class ExtendedChain extends Chain {
      constructor(state) {
        super(state, {printNames})
      }

      printNames(first, last, label) {
        this.tasks.push(['printNames', label, first, last])
        return this
      }
    }

    {
      const state = await new ExtendedChain()
        .printNames('Mr.', 'Wonderful', 'names')
        .execute()

      tt.match(state, {
        names: 'Hello, Mr. Wonderful'
      }, 'expected output')
    }
  })

  t.test('extended chain w/ lookup functions', async (tt) => {
    class MomentChain extends Chain {
      constructor(state) {
        super(state)
      }

      $now() {
        return moment().utc().valueOf()
      }

      $dateadd(date, amount, units = 'm', format) {
        const [_date, _amount, _units] = this.lookup([date, amount, units])
        const out = moment(_date).subtract(_amount, _units)
        return format ? this.$strftime(format, out) : out
      }

      $strftime(format = 'Y-MM-DD', date) {
        const input = this.lookup(date) || undefined
        return moment(input).utc().format(format)
      }
    }

    const chain = new MomentChain()
    {
      const value = chain.lookup('!dateadd:!now,1,d')
      tt.ok(value instanceof moment, 'is moment value')
    }
    {
      const value = chain.lookup('!dateadd:!now,1,d,x')
      tt.match(value, /\d+/, 'formatted number value')
    }
  })

  t.test('extended chain created with an existing state', async (tt) => {
    class WithStateChain extends Chain {
      constructor(state) {
        super(state)
      }
    }
    const state_param = {hello: 'there'}

    const chain = new WithStateChain(state_param)
    const hello = chain.lookup('#hello')
    tt.strictEqual(hello, 'there', 'State input was parsed and saved')
    tt.deepEqual(chain.state.hello, 'there', 'Saved in `state` instance variable')
  })

  t.test('chain function argument handling', async (tt) => {
    class FunctionChain extends Chain {
      constructor(state) {
        super(state)
      }

      $reflect(...args) {
        return args
      }
    }

    const testCases = [
      {input: '!reflect:one,two,three', expected: ['one', 'two', 'three']}
    , {input: '!reflect:"one,two,three"', expected: ['one,two,three']}
    , {input: '!reflect:one,true,three', expected: ['one', true, 'three']}
    , {input: "!reflect:'one,two',three", expected: ['one,two', 'three']}
    , {input: '!reflect:four  ,five, false', expected: ['four', 'five', false]}
    , {input: '!reflect:"one:two",three', expected: ['one:two', 'three']}
    , {input: '!reflect:"one:two,three"', expected: ['one:two,three']}
    , {
        input: '!reflect:"one,two",three,"four,five",six'
      , expected: ['one,two', 'three', 'four,five', 'six']
      }
    ]

    const chain = new FunctionChain()
    await chain.execute()

    for (const testCase of testCases) {
      tt.deepEqual(
        chain.lookup(testCase.input)
      , testCase.expected
      , `"${testCase.input}" arguments correct`
      )
    }
  })

  t.test('Default SetupChain (no actions, state); Only built-ins', async (tt) => {
    const chain = new Chain(null, null)
    tt.deepEqual(chain.state, {}, 'Empty state')
    tt.strictEqual(Object.keys(chain.actions).length, 5, 'Built-in action count')
    tt.match(chain.actions, {
      map: Function
    , repeat: Function
    , sleep: Function
    , sort: Function
    , set: Function
    }, 'Built-in action names')

    tt.match(chain, {
      $random: Function
    , $template: Function
    }, 'Built-in function names')
  })
}).catch(threw)
