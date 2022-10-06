'use strict'

const SetupChain = require('../../index.js')

{
  /**
   * Any value that doesn't utilize a function or lookup
   * entrypoint is treated as a "literal" value
   **/
  const chain = new SetupChain()
  const ast = chain.parse(new Date().toISOString())
  console.dir(ast, {depth: 100})
}

{
  /**
   * Any value starting with "#" will generate
   * a "lookup" tree for finding values
   **/
  const chain = new SetupChain()
  const ast = chain.parse('#foo.bar')
  console.dir(ast, {depth: 100})
}

{
  /**
   * `this` will generate a "ref" node
   * whose children carry the parent object context
   **/
  const chain = new SetupChain()
  const ast = chain.parse('#this.foobar')
  console.dir(ast, {depth: 100})
}

{
  /**
   * Any value starting with a "!" will generate
   * a "function" node with zero or more children.
   **/
  const chain = new SetupChain()
  const ast = chain.parse('!test')
  console.dir(ast, {depth: 100})
}

{
  /**
   * Children nodes of a function can be any node type
   * and are interpreted as function arguments.
   * Argument values are resolved and passed to the
   * parent function
   **/
  const chain = new SetupChain()
  const ast = chain.parse('!test:1,2')
  console.dir(ast, {depth: 100})
}

{
  /**
   * Function arguments can also be "lookup", or
   * "function" values. The nesting can be arbitrary
   * and nested to any degree
   **/
  const chain = new SetupChain()
  const ast = chain.parse(`
    !foo(
      "test"
    , #foo.baz
    , !test(1, #this.whizbang)
    )
  `)
  console.dir(ast, {depth: 100})
}
