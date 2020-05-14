# logdna-test-setup-chain

![Test Suite](https://github.com/answerbook/logdna-test-setup-chain/workflows/Test%20Suite/badge.svg)

Base class for implement seed and resource data for test suites

```bash
$ npm install @answerbook/logdna-test-setup-chain
```

## API

`new SetupChain([Object])`

Instantiates a new chain instance. If passed an object, it will be used as the initial
internal state

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

### `set(<String>, <String>)`

**params**
* key [String][]: The name of the key to set in the final output
* value `Any`: The value to include in the final output

Manually sets a value that will be included in the final output and persisted across
executions

```javascript

const chain = new SetupChain()

chain.set('foo', 1)
await chain.execute()

> {foo: 1}
```

### `lookup(<String>|<Object>|<Array>)`

**params**
* input: The string path or object to lookup

Resolves lookup value. This function is generally used by actions to resolve values
from the chain as it is executes.

* If the input starts with a `#` symbol it is considered to be a lookup path and will
  return the requested value from internal state if found.
* If the input starts with a `!` symbol it is considered a function call and will call
  any registered from the chain instance of store the result in internal state..
* If the input is an object, each key in the object will be resolved following the above rules
* If the input is an array, each item in the array will be resolved following the above rules

### `execute`

Executes each task added sequentially and collects the results into a single object.

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

### `sleep(<Object>)`

This is a builder function for the `sleep` action.
It will Waits for a specified number of milliseconds before returning.

**params**
* opts [Object][]: configuration options
  * ms [Number][]: The number of milliseconds to wait before continuing

**returns**: SetupChain

## Creating a chain

The base class is intended to give a starting point for creating targeted setup chains
for tests in your specific projects. The only requirement is setting local `actions`
property in the constructor which is an `Object` holding name / asnyc function parings

The base class provides a set default actions which you can choose to include. Each
action should be exposed via a builder function that queues a task.

```javascript
const SetupChain = require('@answerbook/logdna-test-setup-chain')

const actions = require('../actions')
class MyChain extends SetupChain {
  constructor(state) {
    super(state)

    // Set actions
    this.actions = {
      ...this.actions
    , ...actions
    }
  }

}
```

## Usage

In your test suites you can use a chain instance to perform a series of async tasks
while storing the result in a single object. Actions can do anything from returning
random data, inserting records into a datastore, to sending log entries to a remote parser.


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
    super(state)

    // Set actions
    this.actions = {
      ...this.actions
    , ...actions
    }
  }

  // expose builder functions
  greet(opts, label) {
    this.tasks.push({
      key: 'greet'
    , opts
    , label
    })
    return this
  }

  name(opts, label) {
    this.tasks.push({
      key: 'name'
    , opts
    , label
    })
    return this
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
, greeting: ['Goodbye greg', 'Goodbye fred']
}

```

## Functions

The `lookup` function has a limited ability to exeute simple functions when simple
object path lookups aren't sufficient. The syntax for function execution is as follows.
Simple arguments can be passed. If arguments are passed, numberic and boolean values will
be cast to the appropriate type. Everything else will be handled as a string

```
!<name>:arg,arg,arg
```

The base chain class ships with a single function `random` that will generate a random HEX string.
It accepts an optional single argument that specifies the numbe rof random bytes to generate

```javascript
chain.lookup('!random:2') // 3830
chain.lookup('!random:10') // eddbdf576eac2ded313d
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
