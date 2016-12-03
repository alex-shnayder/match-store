# match-store

A simple JavaScript storage that puts values into arrays at a specified key and uses a matching function to retrieve them. Most suitable for event emitters when used with [wildcard-match](https://github.com/alex-shnayder/wildcard-match).


## Installation

`npm install --save match-store`


## Usage

```javascript
let Store = require('match-store');

// Settings are optional
let store = new Store({
  prefix: '~', // key prefix for the internal storage to avoid clashes
  match: function areOfSameLength(a, b) { // this function is used to match the keys when retrieving values
    return a.length === b.length;
  }
});


store.put('one.two.three', 'foo');
store.put('four.five.six', 'bar', 1);
store.put('seven', 'baz');

store.get('thirteenchars'); // ['foo', 'bar'] because the matching function only checks the length
store.get('same---length'); // ['foo'] because 'bar' had a limit of 1 retrieval
```


## API

### `put(key, value, [uses])`

Saves the value to the internal storage at the specified key. The third parameter limits the number of times the value can be retrieved.

### `get(key)`

Returns an array of values with matching keys. Uses the `match` function provided in the settings to match the keys. If no function is set, checks the keys for equality.

### `del(key, [value])`

Removes values whose keys *exactly* match the provided one. If a value is provided, deletes only records that are equal to it.


## License

[MIT](LICENSE)
