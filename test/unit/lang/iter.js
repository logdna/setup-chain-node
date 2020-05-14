'use strict'

const {test, threw} = require('tap')

const cycle = require('../../../lib/lang/iter/cycle.js')

test('iter', (t) => {
  t.test('cycle', (tt) => {
    const items = [1, /\w+/, {a: 2}, true]
    const cycler = cycle(items)
    tt.doesNotThrow(() => {
      let times = items.length * 2
      while (times--) {
        const {value, done} = cycler.next()
        tt.ok(value, 'next value returned')
        tt.notOk(done, 'cycle never ends')
      }
    })

    while (items.length) {
      const {value} = cycler.next()
      const element = items.shift()
      tt.deepEqual(value, element, `elements cycled in order ${value} == ${element}`)
    }

    tt.throws(() => {
      const c = cycle(1)
      c.next()
    }, /must be an array/i)

    tt.end()
  })

  t.end()
}).catch(threw)

