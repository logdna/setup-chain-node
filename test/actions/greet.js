'use strict'

const assert = require('assert')
const defaults = {
  greeting: null
, names: ['world']
}

const greeting_error = 'SetupChain.greet requires a greeting and must be a string'

module.exports = async function greet(opts) {
  const config = this.lookup({
    ...defaults
  , ...opts
  })

  assert.ok(config.greeting, greeting_error)

  return config.names.map((name) => {
    return `${config.greeting} ${name}`
  })
}
