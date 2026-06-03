---
name: setup-chain
description: create new actions, functions or workflows for logdna/setup-chain
license: MIT
metadata:
  author: Mezmo Inc,.
---

# Setup-chain Agent

Adds new actions and functions to logdna setup-chain

## Prerequisites

1. Confirm `node` executable is installed on the host
2. Make sure there is a package.json in the current working directory
3. package.json should have `@logdna/setup-chain` in dependencies or devDependencies

If any of the above are not met, explain what is missing. Do not proceed with custom action creation.

## Creating a Custom Action

Follow these steps to create and wire up a custom action:

1. **Define the action function** in an actions object
   - **Requirement**: Actions MUST be `async` functions or return a `Promise`
   ```javascript
   const actions = {
     myAction: async (opts) => {
       return opts.value || 'default'
     }
   }
   ```

2. **Create or extend SetupChain class**
   ```javascript
   class MyChain extends SetupChain {
     constructor(state) {
       super(state, actions)
     }
   }
   ```

3. **Use the action** in your chain
   ```javascript
   await new MyChain().myAction({value: 'test'}, 'result').execute()
   // state: {result: 'test'}
   ```

4. **Validate** your implementation works as expected

## Custom Signatures (Advanced)

Only manually push `this.tasks` when action signature deviates from `(opts, label)`:

```javascript
class MyChain extends SetupChain {
  constructor(state) {
    super(state, yourActions)
  }

  customAction(arg1, arg2, label) {
    this.tasks.push(['customAction', label, arg1, arg2])
    return this
  }
}
```

See `create-action.md` for detailed patterns and examples.

## Usage & Workflow

SetupChain implements chain-of-responsibility pattern. Actions are available as top level functions on a chain instance.
Chain actions, execute, and results are stored in state.

```javascript
const chain = new MyChain()

const state = await chain
  .set('user', 'alice')
  .map('#user', n => n * 2, 'doubled')
  .execute()

// state: {user: 'alice', doubled: [2, 4, 6]}
```

Best practices:
- Use labels explicitly to avoid state key collisions
- Chain actions for readability: `.action1().action2().execute()`
- Reuse state across instances for persistence: `new SetupChain(state2)`
- Group Long action chains by use case with comments

```javascript
const chain = new MyChain()

// test scenerio 1
chain
  .account({}, 'account_one')
  .user({account: '#account_one'}, 'user_one')

// test scenerio 1
chain
  .account({}, 'account_two')
  .user({account: '#account_two'}, 'user_two')

const state = await chain.execute()
```

## Additional Resources

- [Detailed action patterns](./references/create-action.md)
- [Adding helper functions](./references/create-function.md)
- [Quick reference](./references/QUICKREF.md)
- [Code examples](./references/examples/)
