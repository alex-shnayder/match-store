'use strict';

var expect = require('chai').expect;
var Store = require('../src/Store');
var Handler = require('../src/Handler');


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
      expect(store._handlers['~path']).to.be.instanceof(Array);
    });

    it('creates the specified path even if it is special', function() {
      var pathsToTest = ['name', 'toString', '`~!@#$%^&()\'".,/\\'];

      pathsToTest.forEach(function(path) {
        expect(store.getOrCreatePath.bind(store, path)).to.not.throw(Error);
        expect(store._paths.indexOf('~' + path)).to.be.above(-1);
        expect(store._handlers['~' + path]).to.be.instanceof(Array);
      });
    });

    it('returns the existing array if the specified path has already been used', function() {
      var array1 = store.getOrCreatePath('path');
      var array2 = store.getOrCreatePath('path');

      expect(array2).to.equal(array1);
    });
  });

  describe('#put()', function() {
    it('creates an array at the specified path and adds the handler to it', function() {
      var handler = new Handler(function() {});
      store.put('path', handler);

      expect(store._handlers['~path']).to.be.instanceof(Array);
      expect(store._handlers['~path'][0]).to.equal(handler);
    });

    it('adds the handler to the array at the specified path', function() {
      var handler1 = new Handler(function() {});
      var handler2 = new Handler(function() {});
      store.put('path', handler1);
      store.put('path', handler2);

      expect(store._handlers['~path'][1]).to.equal(handler2);
    });

    it('allows adding the same handler more than once', function() {
      var handler = new Handler(function() {});
      store.put('path1', handler);
      store.put('path1', handler);
      store.put('path2', handler);
      store.put('path2', handler);

      expect(store._handlers['~path1'][0]).to.equal(handler);
      expect(store._handlers['~path1'][1]).to.equal(handler);
      expect(store._handlers['~path2'][0]).to.equal(handler);
      expect(store._handlers['~path2'][1]).to.equal(handler);
    });
  });

  describe('#remove()', function() {
    it('removes the handler from the specified path and leaves the other handlers intact', function() {
      var handler1 = new Handler(function() {});
      var handler2 = new Handler(function() {});
      store.put('path1', handler1);
      store.put('path1', handler2);
      store.put('path2', handler1);
      store.remove('path1', handler2);

      expect(store._handlers['~path1'][0]).to.equal(handler1);
      expect(store._handlers['~path2'][0]).to.equal(handler1);
      expect(store._handlers['~path1'][1]).to.equal(undefined);
    });

    it('removes the array from the specified path if it\'s empty after removing the handler from it', function() {
      var handler = new Handler(function() {});
      store.put('path', handler);
      store.remove('path', handler);

      expect(store._handlers['~path']).to.equal(undefined);
    });

    it('removes the array from the specified path if the handler is not specified', function() {
      var handler = new Handler(function() {});
      store.put('path', handler);
      store.remove('path');

      expect(store._handlers['~path']).to.equal(undefined);
    });
  });

  describe('#find()', function() {
    it('returns an array of matching handlers', function() {
      var handler1 = new Handler(function() {});
      var handler2 = new Handler(function() {});
      var handler3 = new Handler(function() {});

      store.put('path1', handler1);
      store.put('path1', handler2);
      store.put('path2', handler3);

      var result1 = store.find('path1');
      var result2 = store.find('path2');

      expect(result1).to.be.instanceof(Array);
      expect(result2).to.be.instanceof(Array);
      expect(result1[0]).to.equal(handler1);
      expect(result1[1]).to.equal(handler2);
      expect(result2[0]).to.equal(handler3);
    });

    it('returns an empty array if no matching handlers found', function() {
      var handler = new Handler(function() {});
      store.put('path', handler);

      expect(store.find('non-existent-path')).to.be.instanceof(Array);
    });

    it('returns a new array every time', function() {
      var handler = new Handler(function() {});
      store.put('path', handler);

      var result1 = store.find('path');
      var result2 = store.find('path');

      expect(result1).to.not.equal(result2);
      expect(result1).to.not.equal(store._handlers['~path']);
      expect(result2).to.not.equal(store._handlers['~path']);
    });

    it('doesn\'t return inactive handlers', function() {
      var handler1 = new Handler(function() {});
      var handler2 = new Handler(function() {});

      handler1.active = false;
      store.put('path', handler1);
      store.put('path', handler2);

      var handlers = store.find('path');

      expect(handlers[0]).to.equal(handler2);
      expect(handlers[1]).to.equal(undefined);
    });

    it('removes inactive handlers from the internal store', function() {
      var handler1 = new Handler(function() {});
      var handler2 = new Handler(function() {});

      handler1.active = false;
      store.put('path', handler1);
      store.put('path', handler2);

      expect(store._handlers['~path']).to.include(handler1);
      expect(store._handlers['~path']).to.include(handler2);

      store.find('path');

      expect(store._handlers['~path']).to.not.include(handler1);
      expect(store._handlers['~path']).to.include(handler2);
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
                         '*.*.foo', 'foo.*.**', '**.*.foo', 'foo.*.*.bar', 'foo.**.**.bar', 'foo.*.bar.**'];

      pathsToTest.forEach(function(path) {
        expect(store.validatePath.bind(store, path.split('.'))).to.throw(Error);
      });
    });
  });
});
