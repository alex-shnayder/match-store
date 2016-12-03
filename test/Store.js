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

  describe('#put()', function() {
    it('creates the specified key if it doesn\'t exist yet', function() {
      store.put('path');

      expect(store.keys.indexOf('~path')).to.be.above(-1);
      expect(store.records['~path']).to.be.instanceof(Array);
    });

    it('creates the specified key even if it is special', function() {
      var pathsToTest = ['name', 'toString', '`~!@#$%^&()\'".,/\\'];

      pathsToTest.forEach(function(path) {
        expect(store.put.bind(store, path)).to.not.throw(Error);
        expect(store.keys.indexOf('~' + path)).to.be.above(-1);
        expect(store.records['~' + path]).to.be.instanceof(Array);
      });
    });

    it('creates an array at the specified key and adds a record with the value to it', function() {
      var value = function() {};
      store.put('path', value);

      expect(store.records['~path']).to.be.instanceof(Array);
      expect(store.records['~path'][0].is(value)).to.be.true;
    });

    it('adds a record with the value to the array at the specified key', function() {
      var value1 = function() {};
      var value2 = function() {};
      store.put('path', value1);
      store.put('path', value2);

      expect(store.records['~path'][1].value).to.equal(value2);
    });

    it('allows adding the same value more than once', function() {
      var value = function() {};
      store.put('path1', value);
      store.put('path1', value);
      store.put('path2', value);
      store.put('path2', value);

      expect(store.records['~path1'][0].value).to.equal(value);
      expect(store.records['~path1'][1].value).to.equal(value);
      expect(store.records['~path2'][0].value).to.equal(value);
      expect(store.records['~path2'][1].value).to.equal(value);
    });

    it('uses the custom prefix if provided', function() {
      var store = new Store({
        prefix: '__'
      });
      store.put('one.two.three', 123);

      expect(store.records['__one.two.three']).to.be.instanceof(Array);
    });
  });

  describe('#del()', function() {
    it('removes the value from the specified path and leaves the other records intact', function() {
      var value1 = function() {};
      var value2 = function() {};
      store.put('path1', value1);
      store.put('path1', value2);
      store.put('path2', value1);
      store.del('path1', value2);

      expect(store.records['~path1'][0].value).to.equal(value1);
      expect(store.records['~path2'][0].value).to.equal(value1);
      expect(store.records['~path1'][1]).to.equal(undefined);
    });

    it('removes the array from the specified path if it\'s empty after removing the record from it', function() {
      var value = function() {};
      store.put('path', value);
      store.del('path', value);

      expect(store.records['~path']).to.equal(undefined);
    });

    it('removes the array from the specified path if the record is not specified', function() {
      var value = function() {};
      store.put('path', value);
      store.del('path');

      expect(store.records['~path']).to.equal(undefined);
    });
  });

  describe('#get()', function() {
    it('returns an array of matching records', function() {
      var value1 = function() {};
      var value2 = function() {};
      var value3 = function() {};

      store.put('path1', value1);
      store.put('path1', value2);
      store.put('path2', value3);

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
      store.put('path', value);

      expect(store.get('non-existent-path')).to.be.instanceof(Array);
    });

    it('returns a new array every time', function() {
      var value = function() {};
      store.put('path', value);

      var result1 = store.get('path');
      var result2 = store.get('path');

      expect(result1).to.not.equal(result2);
      expect(result1).to.not.equal(store.records['~path']);
      expect(result2).to.not.equal(store.records['~path']);
    });

    it('doesn\'t return inactive records', function() {
      var value1 = function() {};
      var value2 = function() {};

      store.put('path', value1, 1);
      store.put('path', value2);

      store.get('path');
      var records = store.get('path');

      expect(records[0]).to.equal(value2);
      expect(records[1]).to.equal(undefined);
    });

    it('removes inactive records from the internal store', function() {
      var value1 = function() {};
      var value2 = function() {};

      store.put('path', value1, 1);
      store.put('path', value2);

      var storedValues = store.records['~path'].map(function(item) {
        return item.value;
      });

      expect(storedValues).to.include(value1);
      expect(storedValues).to.include(value2);

      store.get('path');

      storedValues = store.records['~path'].map(function(item) {
        return item.value;
      });

      expect(storedValues).to.not.include(value1);
      expect(storedValues).to.include(value2);
    });

    it('uses the custom matching function if provided', function() {
      var store = new Store({
        match: function doKeysHaveSameLength(a, b) {
          return a.length === b.length;
        }
      });

      var value1 = {};
      var value2 = {};

      store.put('one.two.three', value1);
      store.put('one.two', value2);

      var result1 = store.get('three.two.one');
      var result2 = store.get('two.one');

      expect(result1[0]).to.equal(value1);
      expect(result2[0]).to.equal(value2);
    });
  });
});
