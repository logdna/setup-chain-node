'use strict'

const casual = require('casual')

module.exports = function name(opts) {
  const config = this.lookup(opts)
  const name = config.name || casual.full_name

  // simulating async work
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(name)
    })
  })
}
