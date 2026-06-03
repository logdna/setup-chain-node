# Adding Helper Functions

## Overview

Helper functions are synchronous methods defined on a chain class that extend the capabilities of the `lookup` system. They are called when the `lookup` function encounters a value starting with `!`.

## Creating a Helper Function

1. **Define the method on your chain class**
   - **Prefix**: Method name MUST start with `$` (e.g., `$slugify`)
   - **Naming**: Keep names short, single-word, and lowercase (`$<verb>`)
   - **Synchronous**: Functions MUST be synchronous; they cannot be `async` by design. Use [Actions](./create-action.md) for async operations.
   - **Arguments**: They can accept any number of arguments.

   ```javascript
   class MyChain extends SetupChain {
     $slugify(text) {
       return text.toLowerCase().replace(/\s+/g, '-');
     }
   }
   ```

2. **Use the function via `lookup`**
   - Call the function by using the `!` prefix in lookup strings or objects.
   - The `$` prefix is removed when calling via lookup (e.g., `$slugify` is called as `!slugify`).

## Usage Patterns

### Basic Call
Pass arguments directly after the function name, separated by commas.
```javascript
chain.lookup('!slugify:"Hello World"') 
// returns: "hello-world"
```

### Nested & Complex Lookups
Functions can accept other lookup values (state properties or other functions) as arguments.

- **Using State Properties**:
  ```javascript
  await chain.set('title', 'My Page').execute();
  chain.lookup('!slugify:#title') 
  // returns: "my-page"
  ```

- **Array of Lookups**:
  ```javascript
  await chain.set(('one', 'ONE').set('two', 'TWO').execute()
  chain.lookup(['!lower:#one', '!lower:#two'])
  // returns ['one', 'two']
  ```

- **Deeply Nested Functions**:
  ```javascript
  var chain = new MyChain({bar: 'Hello World})
  chain.lookup({one: '!lower(!slugify(#bar))' })
  // returns {one: 'hello-world'}
  ```

- **Inside Action Options**:
  You can pass function calls as values in action options; they will be resolved by the action's `this.lookup()` call.
  ```javascript
  await chain.set({title: 'Hello World'}).myAction({ slug: '!slugify(#title)' }).execute()
  // returns {slug: 'hello-world'}
  ```

## Summary Checklist
- [ ] Method starts with `$`
- [ ] Method is synchronous
- [ ] Name is short, lowercase, single-word
- [ ] Called using `!` in `lookup`
