'use strict'

const moment = require('moment')
const luxon = require('luxon')
const {test, threw} = require('tap')
const Chain = require('../../lib/chain.js')
const actions = require('../fixtures/actions/index.js')

test('Setup chain', async (t) => {
  t.test('base chain', async (t) => {
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
    t.ok((end - start) >= 10, 'sleep timeout elapsed')
    t.same(state, {
      a: 'b'
    , c: {
        d: 'e'
      }
    , sleep: undefined
    }, 'initial state passed through constructor')
  })

  t.test('extended chain with passed-in actions', async (t) => {
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

      t.match(state, {
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

    t.rejects(
      new ExtendedChain().error().execute()
    , /setup chain error in error/i
    )
    t.rejects(
      new ExtendedChain().fake().execute()
    , /tasks must be an array of objects/i
    )
  })

  t.test('Custom action signatures are not auto-exposed', async (t) => {
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

      t.match(state, {
        names: 'Hello, Mr. Wonderful'
      }, 'expected printNames output')
    }
  })

  t.test('extended chain w/ lookup functions (moment)', async (t) => {
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
      t.ok(value instanceof moment, 'is moment value')
    }
    {
      const value = chain.lookup('!dateadd:!now,1,d,x')
      t.match(value, /\d+/, 'formated number value')
    }
  })

  t.test('extended chain w/ lookup functions (luxon)', async (t) => {
    class LuxonChain extends Chain {
      constructor(state) {
        super(state)
      }

      $now() {
        return luxon.DateTime.now()
      }

      $dateadd(date, amount, units = 'minutes', format) {
        const [_date, _amount, _units] = this.lookup([date, amount, units])
        let out = _date.isLuxonDateTime ? _date : new luxon.DateTime(_date)
        out = out.plus({[_units]: _amount})
        return format ? this.$strftime(format, out) : out
      }

      $strftime(format = 'Y-MM-DD', date) {
        const input = this.lookup(date) || undefined
        return input.setZone('utc').toFormat(format)
      }
    }

    const chain = new LuxonChain()
    {
      const value = chain.lookup('!dateadd:!now,1,day')
      t.ok(luxon.DateTime.isDateTime(value), 'is luxon DateTime value')
    }
    {
      const value = chain.lookup('!dateadd:!now,1,day,x')
      t.match(value, /\d+/, 'formated number value')
    }
  })

  t.test('extended chain created with an existing state', async (t) => {
    class WithStateChain extends Chain {
      constructor(state) {
        super(state)
      }
    }
    const state_param = {hello: 'there'}

    const chain = new WithStateChain(state_param)
    const hello = chain.lookup('#hello')
    t.equal(hello, 'there', 'State input was parsed and saved')
    t.same(chain.state.hello, 'there', 'Saved in `state` instance variable')
  })

  t.test('chain function argument handling', async (t) => {
    class FunctionChain extends Chain {
      constructor(state) {
        super(state)
      }

      $test(...args) {
        return `test-${args.join('-')}`
      }

      $reflect(...args) {
        return args
      }
    }

    const chain = new FunctionChain()
    chain.set('foo', {bar: 'baz'})

    const testCases = [
      {input: '!reflect:one,two,three', expected: ['one', 'two', 'three']}
    , {input: '!reflect:"one,two,three"', expected: ['one,two,three']}
    , {input: '!reflect:#foo', expected: [{bar: 'baz'}]}
    , {input: "!reflect:'one,two',three", expected: ['one,two', 'three']}
    , {input: '!reflect:four  ,five, false', expected: ['four', 'five', false]}
    , {input: '!reflect:"one:two",#foo.bar', expected: ['one:two', 'baz']}
    , {input: '!reflect:"one:two",!test:three', expected: ['one:two', 'test-three']}
    , {input: '!reflect:"one:two,three"', expected: ['one:two,three']}
    , {
        input: '!reflect("2020-11-21T19:16:27.705Z",true,3)'
      , expected: ['2020-11-21T19:16:27.705Z', true, 3]
      }
    , {
        input: '!reflect:"one:two",!test(three,four)'
      , expected: ['one:two', 'test-three-four']
      }
    , {
        input: '!reflect:"one,two",three,"four,five",six'
      , expected: ['one,two', 'three', 'four,five', 'six']
      }
    ]

    await chain.execute()

    for (const testCase of testCases) {
      t.same(
        chain.lookup(testCase.input)
      , testCase.expected
      , `"${testCase.input}" arguments correct`
      )
    }
  })

  t.test('calling undefined chain function', async (t) => {
    const chain = new Chain()
    chain.set('foo', {bar: '!baz("qux")'})

    t.rejects(chain.execute(), 'baz action is undefined')
  })

  t.test('Default SetupChain (no actions, state); Only built-ins', async (t) => {
    const chain = new Chain(null, null)
    t.same(chain.state, {}, 'Empty state')
    t.equal(Object.keys(chain.actions).length, 6, 'Built-in action count')
    t.match(chain.actions, {
      map: Function
    , repeat: Function
    , sleep: Function
    , serial: Function
    , sort: Function
    , set: Function
    }, 'Built-in action names')

    t.match(chain, {
      $random: Function
    , $template: Function
    }, 'Built-in function names')
  })
}).catch(threw)
