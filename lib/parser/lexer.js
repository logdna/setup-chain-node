'use strict'

const {Lexer} = require('chevrotain')
const tokens = require('./tokens.js')

class LookupLexer extends Lexer {
  constructor(opts = {}) {
    super(Object.values(tokens), {
      positionTracking: 'onlyStart'
    , ensureOptimizations: true
    , ...opts
    })
  }
}

module.exports = LookupLexer
