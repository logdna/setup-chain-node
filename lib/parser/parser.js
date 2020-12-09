'use strict'

const {CstParser} = require('chevrotain')
const tokens = require('./tokens.js')

const {
  COMMA
, COLON
, BANG
, LPAREN
, RPAREN
, HASH
, IDENTIFIER
, OBJPATH
, STRING
, NUMBER
} = tokens

class LookupParser extends CstParser {
  constructor(opts = {}) {
    super(Object.values(tokens), {
      recoveryEnabled: false
    , skipValidations: false
    , traceInitPerf: false
    , ...opts
    })

    // Entry Point rule
    this.RULE('last', () => {
      this.OR([ // one of...
        {ALT: () => {
          // #foo.bar
          this.SUBRULE(this.lookup)
        }}
      , {ALT: () => {
          // !foo:bar,#baz.biz,!bar:1,2,3
          this.SUBRULE(this.fn)
        }}
      , {ALT: () => {
          // literal value
          this.CONSUME(STRING)
        }}
      , {ALT: () => {
          // literal value
          this.CONSUME(IDENTIFIER)
        }}
      ])
    })

    this.RULE('lookup', () => {
      this.CONSUME(HASH)
      this.OR([
        {ALT: () => {
          this.CONSUME(OBJPATH)
        }}
      , {ALT: () => {
          this.CONSUME(IDENTIFIER)
        }}
      ])
    })

    this.RULE('fn', () => {
      this.CONSUME(BANG)
      this.CONSUME(IDENTIFIER)
      this.OPTION({
        GATE: () => {
          const token = this.LA(1).tokenType
          return (token === COLON || token === LPAREN)
        }
      , DEF: () => {
          this.OR([
            {ALT: () => {
              this.SUBRULE(this.shortarguments)
            }}
          , {ALT: () => {
              this.SUBRULE(this.callarguments)
            }}
          ])
        }
      })
    })

    this.RULE('shortarguments', () => {
      this.CONSUME(COLON)
      this.SUBRULE(this.arguments)
    })

    this.RULE('callarguments', () => {
      this.CONSUME(LPAREN)
      this.SUBRULE(this.arguments)
      this.CONSUME(RPAREN)
    })

    this.RULE('arguments', () => {
      this.MANY_SEP({
        SEP: COMMA
      , DEF: () => {
          this.SUBRULE(this.arg)
        }
      })
    })

    this.RULE('arg', () => {
      this.OR([
        {ALT: () => {
          this.CONSUME(STRING)
        }}
      , {ALT: () => {
          this.CONSUME(NUMBER)
        }}
      , {ALT: () => {
          this.CONSUME(IDENTIFIER)
        }}
      , {ALT: () => {
          this.SUBRULE(this.fn)
        }}
      , {ALT: () => {
          this.SUBRULE(this.lookup)
        }}
      ])
    })

    // important. call after all rules
    this.performSelfAnalysis()
  }
}

module.exports = LookupParser
