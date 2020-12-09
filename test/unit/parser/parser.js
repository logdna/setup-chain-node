'use strict'

const {test, threw} = require('tap')
const {Parser, Lexer} = require('../../../lib/parser/index.js')

test('last parser', async (t) => {
  const lexer = new Lexer()
  const parser = new Parser()
  t.beforeEach(async () => {
    parser.reset()
  })

  t.test('string literal', async (t) => {
    t.test('double quoted string', async (t) => {
      const {tokens} = lexer.tokenize('"double quote"')
      parser.input = tokens
      const cst = parser.last()

      t.match(cst, {
        name: 'last'
      , children: {
          string: [{
            image: '"double quote"'
          , startOffset: 0
          , startLine: 1
          , startColumn: 1
          , tokenTypeIdx: Number
          , tokenType: {
              name: 'string'
            , PATTERN: RegExp
            }
          }]
        }
      }, 'double quoted string token')
    })

    t.test('single quoted string', async (t) => {
      const {tokens} = lexer.tokenize("'single quote'")
      parser.input = tokens
      const cst = parser.last()

      t.match(cst, {
        name: 'last'
      , children: {
          string: [{
            image: "'single quote'"
          , startOffset: 0
          , startLine: 1
          , startColumn: 1
          , tokenTypeIdx: Number
          , tokenType: {
              name: 'string'
            , PATTERN: RegExp
            }
          }]
        }
      }, 'single quoted string token')
    })
  })

  t.test('identifier', async (t) => {
    const {tokens} = lexer.tokenize('foobar')
    parser.input = tokens
    const cst = parser.last()

    t.match(cst, {
      name: 'last'
    , children: {
        identifier: [{
          image: 'foobar'
        , startOffset: 0
        , startLine: 1
        , startColumn: 1
        , tokenTypeIdx: Number
        , tokenType: {
            name: 'identifier'
          , PATTERN: RegExp
          }
        }]
      }
    }, 'literal identifier token')
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
            hash: [{
              image: '#'
            , startOffset: 0
            , startLine: 1
            , startColumn: 1
            , tokenTypeIdx: Number
            , tokenType: {
                name: 'hash'
              , PATTERN: /#/
              }
            }]
          , objectpath: [{
              image: 'foobar.test'
            , startOffset: 1
            , startLine: 1
            , startColumn: 2
            , tokenTypeIdx: Number
            , tokenType: {
                name: 'objectpath'
              , PATTERN: RegExp
              }
            }]
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
              bang: [{
                image: '!'
              , startOffset: 0
              , startLine: 1
              , startColumn: 1
              , tokenTypeIdx: Number
              , tokenType: {
                  name: 'bang'
                , PATTERN: /!/
                }
              }]
            , identifier: [{
                image: 'whizbang'
              , startOffset: 1
              , startLine: 1
              , startColumn: 2
              , tokenTypeIdx: Number
              , tokenType: {
                  name: 'identifier'
                , PATTERN: RegExp
                }
              }]
            , callarguments: null
            , shortarguments: null
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
              bang: [{
                image: '!'
              , startOffset: 0
              , startLine: 1
              , startColumn: 1
              , tokenTypeIdx: Number
              , tokenType: {
                  name: 'bang'
                , PATTERN: /!/
                }
              }]
            , identifier: [{
                image: 'whizbang'
              , startOffset: 1
              , startLine: 1
              , startColumn: 2
              , tokenTypeIdx: Number
              , tokenType: {
                  name: 'identifier'
                , PATTERN: RegExp
                }
              }]
            , callarguments: null
            , shortarguments: [{
                name: 'shortarguments'
              , children: {
                  colon: [{
                    image: ':'
                  }]
                , arguments: [{
                    name: 'arguments'
                  , children: {
                      arg: [{
                        name: 'arg'
                      , children: {
                          number: [{
                            image: '1'
                          }]
                        }
                      }, {
                        name: 'arg'
                      , children: {
                          string: [{
                            image: '"2,3"'
                          }]
                        }
                      }]
                    }
                  }]
                }
              }]
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
              bang: [{
                image: '!'
              , tokenType: {
                  name: 'bang'
                , PATTERN: /!/
                }
              }]
            , identifier: [{
                image: 'whizbang'
              , tokenType: {
                  name: 'identifier'
                , PATTERN: RegExp
                }
              }]
            , shortarguments: null
            , callarguments: [{
                name: 'callarguments'
              , children: {
                  arguments: [{
                    name: 'arguments'
                  , children: {
                      arg: [{
                        name: 'arg'
                      , children: {
                          number: [{
                            image: '1'
                          }]
                        }
                      }, {
                        name: 'arg'
                      , children: {
                          number: [{
                            image: '2'
                          }]
                        }
                      }]
                    }
                  }]
                }
              }]
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
              bang: [{
                image: '!'
              , tokenType: {
                  name: 'bang'
                , PATTERN: /!/
                }
              }]
            , identifier: [{
                image: 'foo'
              , tokenType: {
                  name: 'identifier'
                , PATTERN: RegExp
                }
              }]
            , shortarguments: null
            , callarguments: [{
                name: 'callarguments'
              , children: {
                  arguments: [{
                    name: 'arguments'
                  , children: {
                      arg: [{
                        name: 'arg'
                      , children: {
                          number: [{
                            image: '1'
                          }]
                        }
                      }, {
                        name: 'arg'
                      , children: {
                          fn: [{
                            name: 'fn'
                          , children: {
                              bang: [{
                                image: '!'
                              , tokenType: {
                                  name: 'bang'
                                , PATTERN: /!/
                                }
                              }]
                            , identifier: [{
                                image: 'bar'
                              , tokenType: {
                                  name: 'identifier'
                                }
                              }]
                            , callarguments: [{
                                name: 'callarguments'
                              , children: {
                                  arguments: [{
                                    name: 'arguments'
                                  , children: {
                                      arg: [{
                                        name: 'arg'
                                      , children: {
                                          number: [{
                                            image: '1'
                                          , tokenType: {
                                              name: 'number'
                                            }
                                          }]
                                        }
                                      }, {
                                        name: 'arg'
                                      , children: {
                                          number: [{
                                            image: '2'
                                          , tokenType: {
                                              name: 'number'
                                            , PATTERN: RegExp
                                            }
                                          }]
                                        }
                                      }]
                                    }
                                  }]
                                }
                              }]
                            }
                          }]
                        }
                      }]
                    }
                  }]
                }
              }]
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
