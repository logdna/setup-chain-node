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

const COLON = createToken({
  name: 'colon'
, pattern: ':'
})

const HASH = createToken({
  name: 'hash'
, pattern: /#/
})

const OBJPATH = createToken({
  name: 'objectpath'
, pattern: /\w+(?:\.\w+)*/
})

const IDENTIFIER = createToken({
  name: 'identifier'
, pattern: /\w+/
, longer_alt: OBJPATH
})

const LPAREN = createToken({
  name: 'lparen'
, pattern: '('
})

const NUMBER = createToken({
  name: 'number'
, pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
, longer_alt: IDENTIFIER
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
, HASH
, BANG
, LPAREN
, RPAREN
, COMMA
, COLON
, NUMBER
, STRING
, IDENTIFIER
, OBJPATH
}
