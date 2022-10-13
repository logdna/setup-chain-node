'use strict'

function randInt(min, max) {
  return Math.random() * (max - min) + min
}

module.exports = function delay(opts) {
  return new Promise((resolve) => {
    const delay = randInt(1, 500)
    setTimeout(() => {
      resolve(this.lookup(opts.value))
    }, delay)
  })
}
