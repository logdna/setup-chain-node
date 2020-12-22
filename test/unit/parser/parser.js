'use strict'

const {test, threw} = require('tap')
const {Parser, Lexer} = require('../../../lib/parser/index.js')

test('last parser', async (t) => {
  const lexer = new Lexer()
  const parser = new Parser()
  t.beforeEach(async () => {
    parser.reset()
  })

  t.test('unparsable input', async (t) => {
    const {tokens} = lexer.tokenize('foobarbaz')
    parser.input = tokens
    parser.last()

    t.strictEqual(parser._errors.length, 1, 'number of parser errors')

    const [error] = parser._errors
    t.match(error, {
      name: /noviablealtexception/i
    , message: /^expecting: one of these possible token sequences/i
    , token: {
        image: 'foobarbaz'
      , tokenType: {
          name: 'identifier'
        , PATTERN: RegExp
        }
      }
    })
  })

  t.test('object lookup', async (t) => {
    const {tokens} = lexer.tokenize('#foobar.test')
    parser.input = tokens
    const cst = parser.last()

    t.match(cst, {
      name: 'last'
    , children: {
        lookup: [{
          name: 'lookup'
        , children: {
            hash: [
              {
                image: '#'
              , startOffset: 0
              , startLine: 1
              , startColumn: 1
              , tokenTypeIdx: 7
              , tokenType: {
                  name: 'hash'
                , PATTERN: RegExp
                }
              }
            ]
          , identifier: [
              {
                image: 'foobar'
              , startOffset: 1
              , startLine: 1
              , startColumn: 2
              , tokenTypeIdx: 8
              , tokenType: {
                  name: 'identifier'
                , PATTERN: RegExp
                }
              }
            , {
                image: 'test'
              , startOffset: 8
              , startLine: 1
              , startColumn: 9
              , tokenTypeIdx: 8
              , tokenType: {
                  name: 'identifier'
                , PATTERN: RegExp
                }
              }
            ]
          , dot: [
              {
                image: '.'
              , startOffset: 7
              , startLine: 1
              , startColumn: 8
              , tokenTypeIdx: 5
              , tokenType: {
                  name: 'dot'
                , PATTERN: '.'
                }
              }
            ]
          }
        }]
      }
    }, 'literal objectpath token')
  })

  t.test('function', async (t) => {
    t.test('no arguments', async (t) => {
      const {tokens} = lexer.tokenize('!whizbang')
      parser.input = tokens
      const cst = parser.last()

      t.match(cst, {
        name: 'last'
      , children: {
          fn: [{
            name: 'fn'
          , children: {
              bang: [
                {
                  image: '!'
                , startOffset: 0
                , startLine: 1
                , startColumn: 1
                , tokenTypeIdx: 3
                , tokenType: {
                    name: 'bang'
                  , PATTERN: RegExp
                  }
                }
              ]
            , identifier: [
                {
                  image: 'whizbang'
                , startOffset: 1
                , startLine: 1
                , startColumn: 2
                , tokenTypeIdx: 8
                , tokenType: {
                    name: 'identifier'
                  , PATTERN: RegExp
                  }
                }
              ]
            }
          }]
        }
      }, 'function parsed without arguments')
    })

    t.test('shorthand arguments arguments', async (t) => {
      const {tokens} = lexer.tokenize('!whizbang:1,"2,3"')
      parser.input = tokens
      const cst = parser.last()

      t.match(cst, {
        name: 'last'
      , children: {
          fn: [{
            name: 'fn'
          , children: {
              bang: [
                {
                  image: '!'
                , startOffset: 0
                , startLine: 1
                , startColumn: 1
                , tokenTypeIdx: 3
                , tokenType: {
                    name: 'bang'
                  , PATTERN: RegExp}
                }
              ]
            , identifier: [
                {
                  image: 'whizbang'
                , startOffset: 1
                , startLine: 1
                , startColumn: 2
                , tokenTypeIdx: 8
                , tokenType: {
                    name: 'identifier'
                  , PATTERN: RegExp
                  }
                }
              ]
            , shortarguments: [
                {
                  name: 'shortarguments'
                , children: {
                    colon: [
                      {
                        image: ':'
                      , startOffset: 9
                      , startLine: 1
                      , startColumn: 10
                      , tokenTypeIdx: 6
                      , tokenType: {
                          name: 'colon'
                        , PATTERN: ':'
                        }
                      }
                    ]
                  , arguments: [
                      {
                        name: 'arguments'
                      , children: {
                          arg: [
                            {
                              name: 'arg'
                            , children: {
                                identifier: [
                                  {
                                    image: '1'
                                  , startOffset: 10
                                  , startLine: 1
                                  , startColumn: 11
                                  , tokenTypeIdx: 8
                                  , tokenType: {
                                      name: 'identifier'
                                    , PATTERN: RegExp
                                    }
                                  }
                                ]
                              }
                            }
                          , {
                              name: 'arg'
                            , children: {
                                string: [
                                  {
                                    image: '"2,3"'
                                  , startOffset: 12
                                  , startLine: 1
                                  , startColumn: 13
                                  , tokenTypeIdx: 11
                                  , tokenType: {
                                      name: 'string'
                                    , PATTERN: RegExp
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        , comma: [
                            {
                              image: ','
                            , startOffset: 11
                            , startLine: 1
                            , startColumn: 12
                            , tokenTypeIdx: 4
                            , tokenType: {
                                name: 'comma'
                              , PATTERN: ','
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }]
        }
      }, 'expected CST for shorthand functions with arguments')
    })

    t.test('call arguments (grouped)', async (t) => {
      const {tokens} = lexer.tokenize('!whizbang(1 , 2)')
      parser.input = tokens
      const cst = parser.last()

      t.match(cst, {
        name: 'last'
      , children: {
          fn: [{
            name: 'fn'
          , children: {
              bang: [
                {
                  image: '!'
                , startOffset: 0
                , startLine: 1
                , startColumn: 1
                , tokenTypeIdx: 3
                , tokenType: {
                    name: 'bang'
                  , PATTERN: RegExp
                  }
                }
              ]
            , identifier: [
                {
                  image: 'whizbang'
                , startOffset: 1
                , startLine: 1
                , startColumn: 2
                , tokenTypeIdx: 8
                , tokenType: {
                    name: 'identifier'
                  , PATTERN: RegExp
                  }
                }
              ]
            , callarguments: [
                {
                  name: 'callarguments'
                , children: {
                    lparen: [
                      {
                        image: '('
                      , startOffset: 9
                      , startLine: 1
                      , startColumn: 10
                      , tokenTypeIdx: 9
                      , tokenType: {
                          name: 'lparen'
                        , PATTERN: '('
                        }
                      }
                    ]
                  , arguments: [
                      {
                        name: 'arguments'
                      , children: {
                          arg: [
                            {
                              name: 'arg'
                            , children: {
                                identifier: [
                                  {
                                    image: '1'
                                  , startOffset: 10
                                  , startLine: 1
                                  , startColumn: 11
                                  , tokenTypeIdx: 8
                                  , tokenType: {
                                      name: 'identifier'
                                    , PATTERN: RegExp
                                    }
                                  }
                                ]
                              }
                            }
                          , {
                              name: 'arg'
                            , children: {
                                identifier: [
                                  {
                                    image: '2'
                                  , startOffset: 14
                                  , startLine: 1
                                  , startColumn: 15
                                  , tokenTypeIdx: 8
                                  , tokenType: {
                                      name: 'identifier'
                                    , PATTERN: RegExp
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        , comma: [
                            {
                              image: ','
                            , startOffset: 12
                            , startLine: 1
                            , startColumn: 13
                            , tokenTypeIdx: 4
                            , tokenType: {
                                name: 'comma'
                              , PATTERN: ','
                              }
                            }
                          ]
                        }
                      }
                    ]
                  , rparen: [
                      {
                        image: ')'
                      , startOffset: 15
                      , startLine: 1
                      , startColumn: 16
                      , tokenTypeIdx: 10
                      , tokenType: {
                          name: 'rparen'
                        , PATTERN: ')'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }]
        }
      }, 'expected CST for functions with grouped call arguments')
    })

    t.test('nested call arguments (grouped)', async (t) => {
      const {tokens} = lexer.tokenize('!foo(1,!bar(1, 2))')
      parser.input = tokens
      const cst = parser.last()

      t.match(cst, {
        name: 'last'
      , children: {
          fn: [{
            name: 'fn'
          , children: {
              bang: [
                {
                  image: '!'
                , startOffset: 0
                , startLine: 1
                , startColumn: 1
                , tokenTypeIdx: 3
                , tokenType: {
                    name: 'bang'
                  , PATTERN: RegExp
                  }
                }
              ]
            , identifier: [
                {
                  image: 'foo'
                , startOffset: 1
                , startLine: 1
                , startColumn: 2
                , tokenTypeIdx: 8
                , tokenType: {
                    name: 'identifier'
                  , PATTERN: RegExp
                  }
                }
              ]
            , callarguments: [
                {
                  name: 'callarguments'
                , children: {
                    lparen: [
                      {
                        image: '('
                      , startOffset: 4
                      , startLine: 1
                      , startColumn: 5
                      , tokenTypeIdx: 9
                      , tokenType: {
                          name: 'lparen'
                        , PATTERN: '('
                        }
                      }
                    ]
                  , arguments: [
                      {
                        name: 'arguments'
                      , children: {
                          arg: [
                            {
                              name: 'arg'
                            , children: {
                                identifier: [
                                  {
                                    image: '1'
                                  , startOffset: 5
                                  , startLine: 1
                                  , startColumn: 6
                                  , tokenTypeIdx: 8
                                  , tokenType: {
                                      name: 'identifier'
                                    , PATTERN: RegExp
                                    }
                                  }
                                ]
                              }
                            }
                          , {
                              name: 'arg'
                            , children: {
                                fn: [
                                  {
                                    name: 'fn'
                                  , children: {
                                      bang: [
                                        {
                                          image: '!'
                                        , startOffset: 7
                                        , startLine: 1
                                        , startColumn: 8
                                        , tokenTypeIdx: 3
                                        , tokenType: {
                                            name: 'bang'
                                          , PATTERN: RegExp
                                          }
                                        }
                                      ]
                                    , identifier: [
                                        {
                                          image: 'bar'
                                        , startOffset: 8
                                        , startLine: 1
                                        , startColumn: 9
                                        , tokenTypeIdx: 8
                                        , tokenType: {
                                            name: 'identifier'
                                          , PATTERN: RegExp
                                          }
                                        }
                                      ]
                                    , callarguments: [
                                        {
                                          name: 'callarguments'
                                        , children: {
                                            lparen: [
                                              {
                                                image: '('
                                              , startOffset: 11
                                              , startLine: 1
                                              , startColumn: 12
                                              , tokenTypeIdx: 9
                                              , tokenType: {
                                                  name: 'lparen'
                                                , PATTERN: '('
                                                }
                                              }
                                            ]
                                          , arguments: [
                                              {
                                                name: 'arguments'
                                              , children: {
                                                  arg: [
                                                    {
                                                      name: 'arg'
                                                    , children: {
                                                        identifier: [
                                                          {
                                                            image: '1'
                                                          , startOffset: 12
                                                          , startLine: 1
                                                          , startColumn: 13
                                                          , tokenTypeIdx: 8
                                                          , tokenType: {
                                                              name: 'identifier'
                                                            , PATTERN: RegExp
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  , {
                                                      name: 'arg'
                                                    , children: {
                                                        identifier: [
                                                          {
                                                            image: '2'
                                                          , startOffset: 15
                                                          , startLine: 1
                                                          , startColumn: 16
                                                          , tokenTypeIdx: 8
                                                          , tokenType: {
                                                              name: 'identifier'
                                                            , PATTERN: RegExp
                                                            }
                                                          }
                                                        ]
                                                      }
                                                    }
                                                  ]
                                                , comma: [
                                                    {
                                                      image: ','
                                                    , startOffset: 13
                                                    , startLine: 1
                                                    , startColumn: 14
                                                    , tokenTypeIdx: 4
                                                    , tokenType: {
                                                        name: 'comma'
                                                      , PATTERN: ','
                                                      }
                                                    }
                                                  ]
                                                }
                                              }
                                            ]
                                          , rparen: [
                                              {
                                                image: ')'
                                              , startOffset: 16
                                              , startLine: 1
                                              , startColumn: 17
                                              , tokenTypeIdx: 10
                                              , tokenType: {
                                                  name: 'rparen'
                                                , PATTERN: ')'
                                                }
                                              }
                                            ]
                                          }
                                        }
                                      ]
                                    }
                                  }
                                ]
                              }
                            }
                          ]
                        , comma: [
                            {
                              image: ','
                            , startOffset: 6
                            , startLine: 1
                            , startColumn: 7
                            , tokenTypeIdx: 4
                            , tokenType: {
                                name: 'comma'
                              , PATTERN: ','
                              }
                            }
                          ]
                        }
                      }
                    ]
                  , rparen: [
                      {
                        image: ')'
                      , startOffset: 17
                      , startLine: 1
                      , startColumn: 18
                      , tokenTypeIdx: 10
                      , tokenType: {
                          name: 'rparen'
                        , PATTERN: ')'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }]
        }
      }, 'expected CST for functions with grouped call arguments')
    })

    t.test('(error) invalid function name', async (t) => {
      const {tokens} = lexer.tokenize('!!foo.bar:1')
      parser.input = tokens
      parser.last()

      t.strictEqual(parser._errors.length, 1, 'number of parser errors')
      const [error] = parser._errors

      t.match(
        error.name
      , /mismatchedtokenexception/i
      , 'error type'
      )

      t.match(
        error.message
      , 'Expecting token of type --> identifier <-- but found --> \'!\' <--'
      , 'error message'
      )

      t.match(error.token, {
        image: '!'
      }, 'expected token value')
    })
  })
}).catch(threw)
