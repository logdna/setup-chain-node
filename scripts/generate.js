#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const chevrotain = require('chevrotain')
const Parser = require('../lib/parser/parser.js')

const parser = new Parser()
const OUTPUT_PATH = path.join(__dirname, '..', 'last.html')
const serialized = parser.getSerializedGastProductions()
const html = chevrotain.createSyntaxDiagramsCode(serialized)

fs.writeFileSync(OUTPUT_PATH, html)
