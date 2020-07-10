'use strict'

module.exports = function(value) {
  if (value === 'null' || value === null) return null
  if (value === 'undefined' || value === undefined) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === '' || isNaN(value)) return value
  if (isFinite(value)) return parseFloat(value)
  return value
}
