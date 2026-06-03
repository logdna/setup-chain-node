# Setup-chain Quick Reference

## Additional Documentation

- [Action development](./create-action.md)
- [Usage patterns](./SKILL.md)
- [Examples](./examples)


| Action                               | Usage                                      | Returns                         |
|--------------------------------------|--------------------------------------------|---------------------------------|
| `set(key, value)`                    | `chain.set('foo', 'bar')`                  | stores value in state           |
| `set({key: value})`                  | `chain.set('foo', 'bar')`                  | stores multiple values in state |
| `map(collection, fn, label)`         | `chain.map([1,2,3], n=>n*2, 'doubled')`    | transformed array               |
| `repeat(times, action, opts, label)` | `chain.repeat(5, 'hello', {}, 'res')`      | array of results                |
| `serial(times, action, opts, label)` | `chain.serial(3, 'delay', {}, 'res')`      | sequential results              |
| `sort(collection, fn, label)`        | `chain.sort('#arr', (a,b)=>b-a, 'sorted')` | sorted array                    |
| `sleep({ms})`                        | `chain.sleep({ms:1000})`                   | waits 1000ms                    |

## Lookup Syntax

| Syntax | Example | Description |
|--------|---------|-------------|
| `#foo` | `chain.lookup('#foo')` | state property |
| `#foo.bar` | `chain.lookup('#user.name')` | nested property |
| `#arr.0` | `chain.lookup('#arr.0')` | array index (dot notation) |
| `['#foo', '#bar']` | `chain.lookup(['#foo','bar'])` | array lookup |
| `!fn:arg1,arg2` | `chain.lookup('!random:5')` | function call |
| `!template:"{{#foo}}"` | `chain.$template('Hello {{#name}}')` | interpolated string |

## Creating Actions

**Important**: Only manually push tasks when action signature **deviates** from standard `(opts, label)` pattern.

### Auto-exposed (simple) - Standard signature
```javascript
const actions = {
  hello: async (opts) => opts.name || 'World'
}

class MyChain extends SetupChain {
  constructor(state) {
    super(state, actions)
  }
}

new MyChain().hello({name: 'Alice'}, 'result').execute()
// NO .tasks.push needed!
```

### Custom Signature - Only when needed
```javascript
printNames(first, last, label) {
  this.tasks.push(['printNames', label, first, last])  // Only if signature differs
  return this
}
```

### State-Dependent with Validation
```javascript
const actions = {
  person: async (opts) => {
    const defaults = {
      first: 'bobby'
    , last: 'fischer'
    , full: '!template:"{{#this.first}} {{#this.last}}"'
    }
    const result = this.lookup({...defaults, ...opts})

    assert.ok(result.first, 'First name is required')
    assert.ok(result.last, 'Last name is required')
    assert.equal(typeof result.first, 'string', 'First name must be a string')
    assert.equal(typeof result.last, 'string', 'Last name must be a string')

    return result
  }
}
```

## Custom Functions

```javascript
class MyChain extends SetupChain {
  $max(...args) {
    return Math.max(...this.lookup(args))
  }
}

chain.lookup('!max:1,2,3')  // '3'
```

## Best Practices

1. Use labels explicitly to avoid collisions
2. Use templates in action defaults for reusability
3. Keep actions simple, use `this.lookup()` for composition
4. Chain operations for readability
5. Reuse state across chains for persistence
