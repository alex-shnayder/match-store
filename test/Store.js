'use strict';

// These tests were written for an old version that was bound to Promitter.
// Now they are somewhat unreliable and need to be updated

var expect = require('chai').expect;
var Store = require('../src/Store');


describe('Store', function() {
  var store;

  beforeEach(function() {
    store = new Store();
  });

  describe('constructor', function() {
    it('creates an instance of itself', function() {
      expect(store).to.be.instanceof(Store);
    });
  });

  describe('#getOrCreatePath()', function() {
    it('creates the specified path if it doesn\'t exist yet', function() {
      store.getOrCreatePath('path');

      expect(store._paths.indexOf('~path')).to.be.above(-1);
      expect(store._records['~path']).to.be.instanceof(Array);
    });

    it('creates the specified path even if it is special', function() {
      var pathsToTest = ['name', 'toString', '`~!@#$%^&()\'".,/\\'];

      pathsToTest.forEach(function(path) {
        expect(store.getOrCreatePath.bind(store, path)).to.not.throw(Error);
        expect(store._paths.indexOf('~' + path)).to.be.above(-1);
        expect(store._records['~' + path]).to.be.instanceof(Array);
      });
    });

    it('returns the existing array if the specified path has already been used', function() {
      var array1 = store.getOrCreatePath('path');
      var array2 = store.getOrCreatePath('path');

      expect(array2).to.equal(array1);
    });
  });

  describe('#set()', function() {
    it('creates an array at the specified path and adds a record with the value to it', function() {
      var value = function() {};
      store.set('path', value);

      expect(store._records['~path']).to.be.instanceof(Array);
      expect(store._records['~path'][0].is(value)).to.be.true;
    });

    it('adds a record with the value to the array at the specified path', function() {
      var value1 = function() {};
      var value2 = function() {};
      store.set('path', value1);
      store.set('path', value2);

      expect(store._records['~path'][1].value).to.equal(value2);
    });

    it('allows adding the same value more than once', function() {
      var value = function() {};
      store.set('path1', value);
      store.set('path1', value);
      store.set('path2', value);
      store.set('path2', value);

      expect(store._records['~path1'][0].value).to.equal(value);
      expect(store._records['~path1'][1].value).to.equal(value);
      expect(store._records['~path2'][0].value).to.equal(value);
      expect(store._records['~path2'][1].value).to.equal(value);
    });
  });

  describe('#del()', function() {
    it('removes the value from the specified path and leaves the other records intact', function() {
      var value1 = function() {};
      var value2 = function() {};
      store.set('path1', value1);
      store.set('path1', value2);
      store.set('path2', value1);
      store.del('path1', value2);

      expect(store._records['~path1'][0].value).to.equal(value1);
      expect(store._records['~path2'][0].value).to.equal(value1);
      expect(store._records['~path1'][1]).to.equal(undefined);
    });

    it('removes the array from the specified path if it\'s empty after removing the record from it', function() {
      var value = function() {};
      store.set('path', value);
      store.del('path', value);

      expect(store._records['~path']).to.equal(undefined);
    });

    it('removes the array from the specified path if the record is not specified', function() {
      var value = function() {};
      store.set('path', value);
      store.del('path');

      expect(store._records['~path']).to.equal(undefined);
    });
  });

  describe('#get()', function() {
    it('returns an array of matching records', function() {
      var value1 = function() {};
      var value2 = function() {};
      var value3 = function() {};

      store.set('path1', value1);
      store.set('path1', value2);
      store.set('path2', value3);

      var result1 = store.get('path1');
      var result2 = store.get('path2');

      expect(result1).to.be.instanceof(Array);
      expect(result2).to.be.instanceof(Array);
      expect(result1[0]).to.equal(value1);
      expect(result1[1]).to.equal(value2);
      expect(result2[0]).to.equal(value3);
    });

    it('returns an empty array if no matching records found', function() {
      var value = function() {};
      store.set('path', value);

      expect(store.get('non-existent-path')).to.be.instanceof(Array);
    });

    it('returns a new array every time', function() {
      var value = function() {};
      store.set('path', value);

      var result1 = store.get('path');
      var result2 = store.get('path');

      expect(result1).to.not.equal(result2);
      expect(result1).to.not.equal(store._records['~path']);
      expect(result2).to.not.equal(store._records['~path']);
    });

    it('doesn\'t return inactive records', function() {
      var value1 = function() {};
      var value2 = function() {};

      store.set('path', value1, 1);
      store.set('path', value2);

      store.get('path');
      var records = store.get('path');

      expect(records[0]).to.equal(value2);
      expect(records[1]).to.equal(undefined);
    });

    it('removes inactive records from the internal store', function() {
      var value1 = function() {};
      var value2 = function() {};

      store.set('path', value1, 1);
      store.set('path', value2);

      var storedValues = store._records['~path'].map(function(item) {
        return item.value;
      });

      expect(storedValues).to.include(value1);
      expect(storedValues).to.include(value2);

      store.get('path');

      storedValues = store._records['~path'].map(function(item) {
        return item.value;
      });

      expect(storedValues).to.not.include(value1);
      expect(storedValues).to.include(value2);
    });
  });

  describe('#validatePath()', function() {
    it('throws an error if any of the fragments of the specified path are empty or consist only of whitespace', function() {
      var pathsToTest = ['', ' ', '.', '. ', ' .', ' . ', 'foo.', 'foo. ', '.foo', ' .foo'];

      pathsToTest.forEach(function(path) {
        expect(store.validatePath.bind(store, path.split('.'))).to.throw(Error);
      });
    });

    it('throws an error if there is more than one wildcard in the specified path', function() {
      var pathsToTest = ['*.*', '*.*.*', '*.**', '**.*', '**.**', '**.**.**', 'foo.*.*',
                         '*.*.foo', 'foo.*.**', '**.*.foo', 'foo.*.*.bar', 'foo.**.**.bar', 'foo.*.bar.**']; // eslint-disable-line

      pathsToTest.forEach(function(path) {
        expect(store.validatePath.bind(store, path.split('.'))).to.throw(Error);
      });
    });
  });
});
