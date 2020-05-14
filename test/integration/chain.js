'use strict'

const {test, threw} = require('tap')
const Chain = require('../../lib/chain.js')
const actions = require('../actions')

test('Setup chain', async (t) => {
  t.test('base chain', async (tt) => {
    const chain = new Chain()
    tt.type(chain.sleep, 'function', 'chain has sleep function')
    const start = new Date()
    await new Chain()
      .sleep()
      .execute()

    const end = new Date()
    tt.ok((end - start) >= 10, 'sleep timeout elapsed')
  })

  t.test('extended chain', async (tt) => {
    class ExtendedChain extends Chain {
      constructor(state) {
        super(state)

        this.actions = {
          ...this.actions
        , ...actions
        }
      }

      $double(value) {
        return value * 2
      }

      $last(...args) {
        return args[args.length - 1]
      }

      greet(opts, label) {
        this.tasks.push({key: 'greet', opts, label})
        return this
      }

      name(opts, label) {
        this.tasks.push({key: 'name', opts, label})
        return this
      }

      error(opts, label) {
        this.tasks.push({key: 'error', opts, label})
        return this
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
}).catch(threw)
