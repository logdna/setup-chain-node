'use strict'

const {test, threw} = require('tap')

const object = require('../../../lib/lang/object/index.js')

test('Exports as expected', async (t) => {
  const entries = Object.entries(object)
  t.equal(entries.length, 2, 'function count')
  t.match(object, {
    getProperty: Function
  , hasOwnProperty: Function
  }, 'function names')
})

test('object#hasOwnProperty', async (t) => {
  const state = {x : 1}
  t.ok(object.hasOwnProperty(state, 'x'), 'top level property')
  t.notOk(object.hasOwnProperty(state, 'toString'), 'property from property chain')
})

test('object#getPropery', async (t) => {
  const gp = object.getProperty
  const input = {
    l1: {
      l1p1: 2
      , l1p2: {
        l3p1: 4
        , l3p2: null
      }
    }
  }

  t.equal(gp(input), undefined, 'default string')
  t.equal(gp(input, 'l1.l1p2.l3p1'), 4, 'default separator')
  t.equal(gp(input, 'l1-l1p2-l3p1', '-'), 4, 'custom separator')
  t.equal(gp(input, 'l1.l1p2.l3p2.l4p1'), null, 'props beyond null values')
  t.equal(gp(input, 'l1.l1p2.nope'), undefined, 'no match')
}).catch(threw)
