'use strict'

const {test, threw} = require('tap')
const Chain = require('../../lib/chain.js')
const actions = require('../fixtures/actions/index.js')

test('Setup chain', async (t) => {
  t.test('base chain', async (tt) => {
    const start = new Date()
    await new Chain()
      .sleep()
      .execute()

    const end = new Date()
    tt.ok((end - start) >= 10, 'sleep timeout elapsed')
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

  t.test('extended chain created with an existing state', async (tt) => {
    class WithStateChain extends Chain {
      constructor(state) {
        super(state)
      }
    }
    const state_param = {hello: 'there'}

    const chain = new WithStateChain(state_param)
    const hello = chain.lookup('#hello')
    tt.equal(hello, 'there', 'State input was parsed and saved')
    tt.deepEqual(chain.state.hello, 'there', 'Saved in `state` instance variable')
  })

  t.test('Default SetupChain (no actions, state); Only built-ins', async (tt) => {
    const chain = new Chain(null, null)
    tt.deepEqual(chain.state, {}, 'Empty state')
    tt.equal(Object.keys(chain.actions).length, 4, 'Built-in action count')
    tt.match(chain.actions, {
      map: Function
    , repeat: Function
    , sleep: Function
    , sort: Function
    }, 'Built-in function names')
  })
}).catch(threw)
