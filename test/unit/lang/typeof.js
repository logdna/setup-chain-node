'use strict'

const {test, threw} = require('tap')
const Moment = require('moment')
const luxon = require('luxon')
const typeOf = require('../../../lib/lang/type-of.js')

class FooBar {
  get [Symbol.toStringTag]() {
    return 'FooBar'
  }
}

test('typeOf', (t) => {
  t.type(typeOf, 'function', 'typeOf is a function')
  const cases = [
    {
      value: ''
    , expected: 'string'
    }
  , {
      value: new Date()
    , expected: 'date'
    }
  , {
      value: null
    , expected: 'null'
    }
  , {
      value: undefined
    , expected: 'undefined'
    }
  , {
      value: 1.1
    , expected: 'number'
    }
  , {
      value: /\w+/
    , expected: 'regexp'
    }
  , {
      value: new FooBar()
    , expected: 'foobar'
    }
  , {
      value: new Set()
    , expected: 'set'
    }
  , {
      value: [1, 2]
    , expected: 'array'
    }
  , {
      value: {}
    , expected: 'object'
    }
  , {
      value: true
    , expected: 'boolean'
    }
  , {
      value: () => {}
    , expected: 'function'
    }
  , {
      value: Moment()
    , expected: 'moment'
    , message: 'typeOf(Moment()) === moment'
    }
  , {
      value: luxon.DateTime.now()
    , expected: 'luxondatetime'
    , message: 'typeOf(luxon.DateTime.now()) === luxondatetime'
    }
  , {
      value: luxon.Duration.fromMillis(Date.now())
    , expected: 'luxonduration'
    , message: 'typeOf(new luxon.Duration()) == luxonduration'
    }
  , {
      value: new luxon.Interval({start: luxon.DateTime.now()})
    , expected: 'luxoninterval'
    , message: 'typeOf(new luxon.Interval()) === luxoninterval'
    }
  ]

  for (const current of cases) {
    t.equal(
      typeOf(current.value)
    , current.expected
    , current.message || `typeOf(${current.value}) == ${current.expected}`
    )
  }
  t.end()
}).catch(threw)

