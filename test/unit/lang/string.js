'use strict'

const {test, threw} = require('tap')
const string = require('../../../lib/lang/string/index.js')

test('string#typecast', async (t) => {
  t.strictEqual(string.typecast('foo'), 'foo', 'string literal')
  t.strictEqual(string.typecast('true'), true, 'boolean value')
  t.strictEqual(string.typecast('false'), false, 'boolean value')
  t.strictEqual(string.typecast('123'), 123, 'integer value')
  t.strictEqual(string.typecast('123.45'), 123.45, 'float string value')
  t.strictEqual(string.typecast(123.45), 123.45, 'float literal value')
  t.strictEqual(string.typecast('null'), null, 'null string value')
  t.strictEqual(string.typecast(null), null, 'null literal')
  t.strictEqual(string.typecast('undefined'), undefined, 'undefined string value')
  t.strictEqual(string.typecast(undefined), undefined, 'undefined string value')
  t.deepEqual(string.typecast({}), {}, 'non string value')
  t.deepEqual(string.typecast(''), '', 'empty string value')
  t.deepEqual(string.typecast(Infinity), Infinity, 'Infinity returns input')

}).catch(threw)
