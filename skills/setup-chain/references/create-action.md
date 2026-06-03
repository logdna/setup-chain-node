# Creating Custom Actions


## Steps to Create and Wire a Custom Action

1. **Define your action function**
   - **Requirement**: Actions MUST be `async` functions or return a `Promise`
   - Accept single `opts` object
   - Return the result directly
   ```javascript
   const actions = {
     hello: async (opts) => opts.name || 'World'
   }
   ```

2. **Create SetupChain class**
   - Pass actions object to constructor
   ```javascript
   class MyChain extends SetupChain {
     constructor(state) {
       super(state, actions)
     }
   }
   ```

3. **Call action with label**
   ```javascript
   await new MyChain().hello({name: 'Alice'}, 'result').execute()
   ```
   - Label is key in state for this action's result

4. **Test your implementation**

## Custom Signature (Use Only When Needed)

1. Define action function manually
2. Override with custom method signature
3. Manually push task with correct format
4. Return `this` for chaining

```javascript
const actions = {
  printNames: async (opts) => [opts.first, opts.last].join(', ')
}

class MyChain extends SetupChain {
  constructor(state) {
    super(state, actions)
  }

  printNames(first, last, label) {
    this.tasks.push(['printNames', label, first, last])
    return this
  }
}
```

## Pattern: State-Dependent with Defaults

1. Define defaults with template placeholders
2. Use `this.lookup()` to merge defaults and opts
3. Use `#this` to reference action's result context
4. Use `assert` module to validate values after lookup resolution

```javascript
const actions = {
  person: async (opts) => {
    const defaults = {
      first: 'bobby'
    , last: 'fischer'
    , full: '!template:"{{#this.first}} {{#this.last}}"'
    }
    const result = this.lookup({...defaults, ...opts})

    // Validate required fields exist
    assert.ok(result.first, 'First name is required')
    assert.ok(result.last, 'Last name is required')

    // Validate types
    assert.equal(typeof result.first, 'string', 'First name must be a string')
    assert.equal(typeof result.last, 'string', 'Last name must be a string')

    return result
  }
}
```

5. **Validate** after executing with various inputs
