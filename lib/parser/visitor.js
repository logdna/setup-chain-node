'use strict'

const {string, array} = require('@logdna/stdlib')
const Parser = require('./parser.js')
const Visitor = (new Parser).getBaseCstVisitorConstructor()

const TYPES = new Map([
  ['identifier', 'literal']
, ['string', 'literal']
])

class LookupVisitor extends Visitor {
  constructor() {
    super()
    this.validateVisitor()
  }

  last(ctx) {
    return root(this.dispatch(ctx))
  }

  dispatch(ctx) {
    const node = ctx.fn || ctx.lookup
    return this.visit(node)
  }

  lookup(ctx) {
    const identifiers = ctx.identifier
    return {
      type: 'lookup'
    , value: ctx.identifier.map((node) => {
        return node.image
      }).join('.')
    , position: position(ctx.hash[0], identifiers[identifiers.length - 1])
    }
  }

  arg(ctx) {
    const value = getArg(ctx)
    if (value) return this.scalar(value)
    return this.dispatch(ctx)
  }

  wrapLiteral(value) {
    return {
      type: 'literal'
    , value
    }
  }

  scalar(node) {
    const name = node.tokenType.name
    const value = name === 'string'
      ? node.image.replace(/^["']|['"]$/g, '')
      : node.image

    const type = TYPES.get(name)

    return {
      type: type
    , value: string.typecast(value)
    , position: position(node)
    }
  }

  // unwrap function args
  shortarguments(ctx) {
    return this.visit(ctx.arguments)
  }

  // unwrap function args
  callarguments(ctx) {
    return this.visit(ctx.arguments)
  }

  arguments(ctx) {
    const visit = this.visit.bind(this)
    return array.toArray(ctx.arg).map(visit)
  }

  fn(ctx) {
    const args = (ctx.callarguments || ctx.shortarguments)
    return {
      type: 'function'
    , value: ctx.identifier[0].image
    , position: position(ctx.bang[0], ctx.identifier[0])
    , children: array.toArray(this.visit(args))
    }
  }
}

module.exports = LookupVisitor

function getArg(ctx) {
  if (ctx.string) return ctx.string[0]
  if (ctx.identifier) return ctx.identifier[0]
}

function position(start, end) {
  const term = end || start
  return {
    start: {
      offset: start.startOffset
    , line: start.startLine
    , column: start.startColumn
    }
  , end: {
      offset: term.startOffset + term.image.length
    , line: start.startLine
    , column: term.startColumn + term.image.length
    }
  }
}

function root(node) {
  return {
    type: 'root'
  , children: array.toArray(node)
  }
}
