# wildcard-store

A JavaScript store with glob-like patterns best suitable for event emitters. Supports one- and two-star wildcards both in keys and when finding records.


## Installation

`npm install --save wildcard-store`


## API

### `set(key, value, [uses])`

Saves the value to the internal storage. The third parameter limits the number of times the value can be retrieved.

### `get(pattern)`

Returns an array of values whose kes matches the provided pattern.

### `del(key, [value])`

Removes values whose key *exactly* matches the provided one. If a value is provided, deletes only records that are equal to it.


## Usage

```javascript
let Store = require('wildcard-store');

// Settings are optional
let store = new Store({
  delimeter: '.', // namespace delimiter
  prefix: '~' // key prefix for the internal storage
});


store.set('app.user.created', 'foo');
store.set('app.model.created', 'bar', 1);

store.get('app.user.created') // ['foo']
store.get('app.**'); // ['foo', 'bar'] because ** matches any number of namespaces
store.get('app.*'); // [] because * matches strictly one level of namespaces
store.get('orm.model.created'); // [] because 'bar' has already depleted its limit
```
