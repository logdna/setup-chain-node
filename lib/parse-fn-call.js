'use strict'

const array = require('./lang/array/index.js')
const string = require('./lang/string/index.js')

const ARGS_SEPARATOR = ':'
const CSV_ARGS_EXP = /(?:\s*,\s*)(?=(?:[^"']|"[^'"]*")*$)/

module.exports = parseFnCall

function parseFnCall(lookup) {
  const sepIdx = lookup.indexOf(ARGS_SEPARATOR)
  const [fn, rawArgs] = [
    lookup.substring(0, sepIdx)
  , lookup.substring(sepIdx + 1)
  ].filter(Boolean)

  let args = []
  if (rawArgs && rawArgs.length) {
    args = array.toArray(rawArgs, CSV_ARGS_EXP).map((arg) => {
      return string.typecast(arg.replace(/^["']|['"]$/g, ''))
    })
  }

  return {fn, args}
}
