'use strict'

const {test, threw} = require('tap')
const {Parser, Lexer, Visitor} = require('../../../lib/parser/index.js')

const parser = new Parser()
const visitor = new Visitor()
const lexer = new Lexer()

function parse(str) {
  if (!str) return null
  const res = lexer.tokenize(str)
  parser.input = res.tokens

  const cst = parser.last()
  const errors = parser._errors

  if (errors.length) throw errors[0]

  parser.reset()
  return visitor.visit(cst)
}

test('last visitor', async (t) => {
  t.test('lookup values', async (t) => {
    t.test('top level lookup', async (t) => {
      t.deepEqual(parse('#foo'), {
        type: 'root'
      , children: [{
          type: 'lookup'
        , value: 'foo'
        , position: {
            start: {column: 1, offset: 0, line: 1}
          , end: {column: 5, offset: 4, line: 1}
          }
        }]
      })
    })

    t.test('nested lookup value', async (t) => {
      t.deepEqual(parse('#foo.baz'), {
        type: 'root'
      , children: [{
          type: 'lookup'
        , value: 'foo.baz'
        , position: {
            start: {column: 1, offset: 0, line: 1}
          , end: {column: 9, offset: 8, line: 1}
          }
        }]
      })
    })
  })

  t.test('function call', async (t) => {
    t.test('no arguments', async (t) => {
      t.deepEqual(parse('!whizbang'), {
        type: 'root'
      , children: [{
          type: 'function'
        , value: 'whizbang'
        , position: {
            start: {column: 1, offset: 0, line: 1}
          , end: {column: 10, offset: 9, line: 1}
          }
        , children: []
        }]
      })
    })

    t.test('shorthand arguments', async (t) => {
      t.match(parse('!whizbang:1 , "two,three"'), {
        type: 'root'
      , children: [{
          type: 'function'
        , value: 'whizbang'
        , position: {
            start: {column: 1, offset: 0, line: 1}
          , end: {column: 10, offset: 9, line: 1}
          }
        , children: [{
            type: 'literal'
          , value: 1
          , position: {
              start: {column: Number, offset: Number, line: Number}
            , end: {column: Number, offset: Number, line: Number}
            }
          }, {
            type: 'literal'
          , value: 'two,three'
          , position: {
              start: {column: Number, offset: Number, line: Number}
            , end: {column: Number, offset: Number, line: Number}
            }
          }]
        }]
      })
    })

    t.test('nested call arguments', async (t) => {
      t.match(parse('!foo(!bar(!baz:2,#a.b))'), {
        type: 'root'
      , children: [{
          type: 'function'
        , value: 'foo'
        , position: {
            start: {column: Number, offset: Number, line: Number}
          , end: {column: Number, offset: Number, line: Number}
          }
        , children: [{
            type: 'function'
          , value: 'bar'
          , position: {
              start: {column: Number, offset: Number, line: Number}
            , end: {column: Number, offset: Number, line: Number}
            }
          , children: [{
              type: 'function'
            , value: 'baz'
            , position: {
                start: {column: Number, offset: Number, line: Number}
              , end: {column: Number, offset: Number, line: Number}
              }
            , children: [{
                type: 'literal'
              , value: 2
              , position: {
                  start: {column: Number, offset: Number, line: Number}
                , end: {column: Number, offset: Number, line: Number}
                }
              }, {
                type: 'lookup'
              , value: 'a.b'
              , position: {
                  start: {column: Number, offset: Number, line: Number}
                , end: {column: Number, offset: Number, line: Number}
                }
              }]
            }]
          }]
        }]
      })
    })
  })
}).catch(threw)
