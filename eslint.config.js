'use strict'

const {defineConfig} = require('eslint/config')
const logdna = require('eslint-config-logdna')

module.exports = defineConfig([
  {
    'extends': [logdna]
  , 'ignores': ['skills/**']
  , 'languageOptions': {
      ecmaVersion: 2022
    , sourceType: 'script'
    , globals: {
        fetch: 'readonly'
      }
    }
  , 'rules': {
      'sensible/check-require': [2, 'always', {
        root: __dirname
      }]
    }
  }
])
