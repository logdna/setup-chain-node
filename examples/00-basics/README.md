### Basic Usage

The primary use case for the setup chain is make generating real test data, easy, consistent
, and repeatable. Because of its generic nature, it can be used to accomplish much more than 
seeding data.

A `SetupChain` is a basic javascript class, which has no required parameters.
It exposes a set of function, called actions which queue work in an orderly manner.
The result of the execution is returned in a single object value commonly called `state`.


```javascript
const SetupChain = require('@logdna/setup-chain')
const chain = new SetupChain()
const state = await chain.action().execute()
```

### Seeding And Reusing Data

### Lookup Syntax


