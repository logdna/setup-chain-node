## logdna-test-setup-chain

<!-- vim-markdown-toc GFM -->

* [Program Flow](#program-flow)
    * [Auto-Exposing Action Handlers](#auto-exposing-action-handlers)
    * [Custom Action Signatures](#custom-action-signatures)
    * [Required Task Format](#required-task-format)
* [API](#api)
  * [`set(<String>|<Object>, <Any>)`](#setstringobject-any)
    * [Parmeters](#parmeters)
  * [`lookup(<String>|<Object>|<Array>)`](#lookupstringobjectarray)
    * [Parameters](#parameters)
  * [`map(<Array>|<String>, <Function>, <String>)`](#maparraystring-function-string)
    * [Parameters](#parameters-1)
  * [`sort(<Array>|<String>, <Function>, <String>)`](#sortarraystring-function-string)
    * [Parameters](#parameters-2)
  * [`repeat(<Number>, <String>, <Object>, <String>)`](#repeatnumber-string-object-string)
    * [Parameters](#parameters-3)
  * [`execute()`](#execute)
  * [`sleep(<Object>)`](#sleepobject)
    * [Parameters](#parameters-4)
  * [`reset()`](#reset)
  * [Creating a chain](#creating-a-chain)
  * [LAST](#last)
    * [Interfaces](#interfaces)
      * [`Node`](#node)
      * [`Point`](#point)
      * [`Position`](#position)

<!-- vim-markdown-toc -->

This is a base class for implementing seed and resource data for test suites.  Integration tests that rely on
other data to exist prior to testing new features can use this package to easily generate
such things.  For example, to test a new User property, one must first create an Organization, then
add a User to belong to that Organization.  Using this package simplifies the code needed to do those
kinds of repetitive tasks in the test suite.

```bash
$ npm install @answerbook/logdna-test-setup-chain [--save-dev]
```

# Program Flow

The `SetupChain` can be given `action` functions which will ultimately be executed by `async/await`
in the order they are given.  Action functions are through builder functions (usually with the same name),
placing a task onto a queue in the order specified, but they are not run until [.execute()](#execute) is called.  This
requires a handler function added to the `SetupChain` for each action to expose it.  This can
be done automatically (see below), or defined in the sub-class by the developer.

### Auto-Exposing Action Handlers

The `SetupChain` can automatically create `SetupChain.prototype[action]` as a builder function
to create the task on the queue.  To take advantage of this, the developer's action function **must**
use a signature of `async function(opts)`, and pass all options in that single object parameter.
If using this style, all action function definitions can be passed to the `SetupChain`
upon instantiation, and it will create these builder functions automatically.

### Custom Action Signatures

Occasionally, a developer may want a different action signature to provide a better style.
For example, the built-in action for `repeat` uses `.repeat(times, action, action_options, label)`
for its signature.  To do this, the developer must expose the action handler themselves
within their sub-class, and as long as the task is created with the [expected format](#required-task-format), that's
all that will be needed.  Remember to always `return this` at the end of any custom
action handler to maintain chainability.

### Required Task Format

When tasks go onto the queue, they **must** have the format of `[key, label, ...rest]`.
So, if a custom action signature is being used for an action named `myAction`, then
the action handler can accept parameters in whatever format, as long as they get pushed
onto the task queue with the format that `execute` expects.

```javascript
myCustomAction(firstParam, secondParam, label) {
  this.tasks.push(['myCustomAction', label, firstParam, secondParam])
  return this
}

```

# API

`new SetupChain([Object], [Object])`

Instantiates a new chain instance. If passed an object, it will be used as the initial
internal state.  This is stored in `chain.state`, and is an object that holds the results
of all the action calls.  As the second parameter, the object of action functions
can be passed.

```javascript
const chain = new SetupChain({
  b: {
    c: 2
  , d: {
      e: 3
    }
  }
})

await chain.execute()
{
  b: {
    c: 2
  , d: {
      e: 3
    }
  }
}
```

## `set(<String>|<Object>, <Any>)`

### Parmeters

* **key** [String][]|[Object][]: The name of the key to set in the final output
* **value** `Any`(_optional_): The value to be saved in `setupChain.state` and also returned
  by `execute`. If the first parameter is an object, this parameter will be ignored.
  Each of the key / value pairs will be used as function arguments

Manually sets a value that will be saved in the final output and persisted across
executions.

```javascript
const chain = new SetupChain()

chain.set('foo', 1)
await chain.execute()

> {foo: 1}
```

```javascript
const chain = new SetupChain()

chain.set({
  foo: 1
, 'a.b': '#foo'
, bar: '!random'
})
await chain.execute()

> {foo: 1, bar: 'af4b31', a: {b: 1}}
```

## `lookup(<String>|<Object>|<Array>)`

### Parameters

* **input** `Any`: The string path or object to lookup

Resolves lookup value. This function is generally used by actions to resolve values
from the chain as it is executes.

* If the input is a string, and starts with a `#` symbol it is considered to be a lookup path and will
  return the requested value from internal state if found.
* If the input is a string, and starts with a `!` symbol it is considered a function call and will call
  any registered actions from the chain instance and store the result in internal state.
* If the input is an object, each key in the object will be resolved following the above rules
* If the input is an array, each item in the array will be resolved following the above rules

## `map(<Array>|<String>, <Function>, <String>)`

### Parameters

* **collection** [Array][]: An array/collection of data to apply the map function to.  A string can be
  given in order to use `lookup`, e.g. `'#myUsers'`
* **iterator** [Function][]: This is the iterator function that will receive each collection item.  It can
  be an `async` or regular function that accepts `item`.  *Currently this does not support callbacks*
* **label** [String][]: Optional label in which to store the result.

Takes a collection (array, or `#lookup` value), and applies an iterator function to each item.
The return value from the iterator will be the final result.  Results are stored in an array,
keyed by `label`, and order is maintained.

## `sort(<Array>|<String>, <Function>, <String>)`

### Parameters

* **collection** [Array][]: An array/collection of data to apply the sort function to.  A string can be
  given in order to use `lookup`, e.g. `'#myCollection'`
* **comparator** [Function][]: This is the the comparator function ultimately used by Javascript's
  `Array.prototype.sort` function.  The input array *will not be mutated*.
* **label** [String][]: Optional label in which to store the result.

Takes a collection (array, or `#lookup`) and applies a [sort function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
to each item.  Although this uses Javascript's `sort` function under the hood (which mutates),
calling `setupChain.sort` will NOT mutate the input.  This is done for consistency since
the `lookup` result will sometimes provide a new array, and sometimes not.

## `repeat(<Number>, <String>, <Object>, <String>)`

### Parameters

* **times** [Number][]: The number of times to repeat the given action name
* **name** [String][]: The name of the action to execute.  This **must** already exist
  on the chain as a valid action.
* **opts** [Object][]: Any options that the named action requires.  Currently, this
  only supports actions with an `(opts)` signature.  Custom signatures are not yet
  supported.
* **label** [String][]: Optional label in which to store the result.

## `execute()`

Executes each task added sequentially and collects the results into a single object.
The results for `execute` are returned. The internal state will be Persisted.

**returns**: [Object][]

```javascript
await new SetupChain()
  .foo()
  .bar()
  .insertDBRecord({}, 'record')
  .execute()

{
  foo: 'bar'
, bar: 'foo'
, record: { id: 1 }
}
```

## `sleep(<Object>)`

### Parameters

* **opts** [Object][]: configuration options
  * **ms** [Number][]: The number of milliseconds to wait before continuing

This is a builder function for the `sleep` action.
It will Waits for a specified number of milliseconds before returning.

**returns**: SetupChain

## `reset()`

Manually clears internal state and any pending tasks

**returns**: SetupChain

## Creating a chain

The base class is intended to give a starting point for creating targeted setup chains
for tests in your specific projects. The only requirement is setting local `actions`
property in the constructor which is an `Object` holding name / asnyc function parings

The base class provides a set default actions which you can choose to include. Each
action will be exposed via a builder function that queues a task.

```javascript
const SetupChain = require('@answerbook/logdna-test-setup-chain')

const actions = require('../actions')
class MyChain extends SetupChain {
  constructor(state) {
    super(state, actions)
  }
}
```

## LAST

![last](./asset/last.png)

**L**ookup **A**bstract **S**yntax **T**ree

`last` is a specification for representing the [lookup](#lookupstringobjectarray)
input format as an abstract syntax tree. It implements the [unist][] spec.

![syntax diagram](./asset/syntax.png)

### Interfaces

#### `Node`

Represents the base stucture of all AST nodes

```idl
interface Node {
  type: string
  position: Position?
}
```

#### `Point`

Represents one place in a source file.

* `column`: (1-indexed integer) represents a column in the source input
* `offset`: (0-indexed integer) represents a character in the source input
* `line`: (1-indexed integer) represents the line in the source input

```idl
interface Point {
  line: number >= 1
  column: number >= 1
  offset: number >= 0?
}
```

#### `Position`

Position represents the location of a node in a source file.

* `start`: Represents the place of the first character of the parsed source region
* `end`: Represents the place of the first character after the parsed source region

 ```idl
interface Position {
  start: Point
  end: Point
}
```

### Nodes

#### `Root`

The entry point of a last([unist][]) syntax tree. It has no parents

#### `Literal`

Represents a node containing a fully resolved literal value.
This may be a `number`, `boolean`, `string`, `null` or `undefined` value.
As far as the parser is concerned, no further processing is required.

```idl
interface Literal <: Node {
  value: string
}
```

#### `Function`

Represents a function call where `children` represent the positional arguments

```idl
interface Function <: Node {
  value: string
  children: [Node]
}
```

```gfm
!foo:1
```

Yields:

```javascript
{
  type: 'root'
, children: [{
    type: 'function'
  , value: 'foo'
  , children: [
      {type: 'literal', value: 1}
    ]
  }]
}
```


```gfm
!foo(1, bar(2))
```

Yields:

```javascript
{
  type: 'root'
, children: [{
    type: 'function'
  , value: 'foo'
  , children: [
      {type: 'literal', value: 1}
    , {
        type: 'function'
      , value: 'bar'
      , children: [
          {type: 'literal', value: 2}
        ]
      }
    ]
  }]
}
```
#### `Lookup`

```idl
interface Function <: Node {
  value: string
}
```

```gfm
 #foo.bar
```

Yields:

```javascript
{
  type: 'root'
, children: [{
    type: 'lookup'
  , value: 'foo.bar'
  }]
}
```

## Usage

In your test suites you can use a chain instance to perform a series of async tasks
while storing the result in a single object. Actions can do anything from returning
random data, inserting records into a data store, to sending log entries to a remote parser.


```javascript
const state = await new MyChain().execute() // noop
console.log(state)
> {}
```

## Actions

An action is simply an async function that performs some action and optionally returns
some value. Every action function is called in the context of the Chain instance.

### Adding a new action

```javascript
const actions = {
  name: async (opts) => {
    return opts.name || randomName()
  }

  greet: async (opts) => {
    const defaults = {
      greeting: 'hello'
    , names: []
    }

    const config = this.lookup({
      ...defaults
    , ...opts
    })

    return config.names.map((name) => {
      return `${config.greeting} ${name}`
    })
  }
}

class MyChain extends SetupChain {
  constructor(state) {
    super(state, actions)
  }
}
```

The result of previous function calls in the chain can be passed as arguments into another.
The values of previous results can be accessed using the `#` symbol followed by the name
of the key. Simple Object path notation is supported

```javascript
const state = await new MyChain()
  .name({name: 'greg'}, 'name_1')
  .name({name: 'fred'}, 'name_2')
  .greet({
    greeting: 'Goodbye'
  , names: ['#name_1', '#name_2']
  }, 'greeting_1')
  .execute()

console.log(state)

{
  name_1: 'greg'
  name_2: 'fred'
, greeting_1: ['Goodbye greg', 'Goodbye fred']
}

```

## Functions

The `lookup` function has the ability to execute functions when simple object path lookups aren't sufficient.
The syntax for function execution is as follows. Simple arguments can be passed.
If arguments are passed, numeric and boolean values will be casted to the
appropriate type. Everything else will be handled as a string. String arguments
must be quoted with either single or double quotes if the string contains a comma.
Functions may also be used as arguments, but must use the more conventional call `()`
syntax to ensure arguments are passed appropriately.

```
!<name>:arg,arg,arg
!<name>:"one,two",three
!<name>("one,two", !random:1, !foo("bar", "baz"), #nested.key)
```

### `random(<Number>)`
Generates a random HEX string. It accepts an optional single argument that specifies 
the number of random bytes to generate.

```javascript
chain.lookup('!random:2') // 3830
chain.lookup('!random:10') // eddbdf576eac2ded313d
```

### `template(<String>)`
Returns a string with replacement patterns from the chain. Templates are rendered in the
same sequence as other operations on the chain. Only the data from actions prior to the
template function will be available for replacement. 

Templates supports a basic bracket syntax for replacements:

```javascript
chain.set('name', 'World')
chain.set('foo', {bar: "baz"})
chain.lookup('!template:"Hello {{#name}}"') // Hello World
chain.lookup('!template:"Hello {{#name}} - {{#foo.bar}}"') // Hello World - baz
chain.lookup('!template:"Hello, my name is {{#name}}"') // Hello, my name is World
```

### Exposing a new function

Any instance method that is prefixed with `$` is available as an executable function through a `lookup`

```javascript
class MyChain extends SetupChain {
  constructor(state) {
    super(state)
  }

  $max(...args) {
    return Math.max(...args)
  }
}
new MyChain().lookup('!max:2,10,5,3') // 10
```

[Object]: https://mdn.io/object
[String]: https://mdn.io/string
[Array]: https://mdn.io/array
[Number]: https://mdn.io/number
[Function]: https://mdn.io/function
[unist]: https://github.com/syntax-tree/unist
