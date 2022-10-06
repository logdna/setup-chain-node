'use strict'

const SetupChain = require('../../index.js')
/**
 * The set function allows you to explicitly inject values
 * Evaluation of the input to set os delayed until `execute`
 * is called
 **/
{
  const chain = new SetupChain()

  chain
    .set('hello', 'world')
    .set('goodbye', 'world')
    .execute()
    .then(console.log)
}
