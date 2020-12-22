'use strict'

const {createToken, Lexer} = require('chevrotain')

const BANG = createToken({
  name: 'bang'
, pattern: /!/
})

const COMMA = createToken({
  name: 'comma'
, pattern: ','
})

const DOT = createToken({
  name: 'dot'
, pattern: '.'
})

const COLON = createToken({
  name: 'colon'
, pattern: ':'
})

const HASH = createToken({
  name: 'hash'
, pattern: /#/
})


const IDENTIFIER = createToken({
  name: 'identifier'
, pattern: /\w+/
})

const LPAREN = createToken({
  name: 'lparen'
, pattern: '('
})

const RPAREN = createToken({
  name: 'rparen'
, pattern: ')'
})

const STRING = createToken({
  name: 'string'
, pattern: /["'](:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*["']/
})

const WHITE_SPACE = createToken({
  name: 'whitespace'
, pattern: /\s+/
, group: Lexer.SKIPPED
})

BANG.LABEL = '!'
HASH.LABEL = '#'
COMMA.LABEL = ','
COLON.LABEL = ':'
LPAREN.LABEL = '('
RPAREN.LABEL = ')'

// Order matters
module.exports = {
  WHITE_SPACE
, DOT
, HASH
, BANG
, LPAREN
, RPAREN
, COMMA
, COLON
, STRING
, IDENTIFIER
}
