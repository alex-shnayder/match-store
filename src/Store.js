'use strict';

var doPathsMatch = require('./doPathsMatch');
var prefix = '~';


function Store(delimiter) {
  this._handlers = {};
  this._paths = [];
  this._delimiter = delimiter || '.';
}

module.exports = Store;
Store.prototype.constructor = Store;


Store.prototype.find = function find(pattern) {
  var paths = this._paths;
  var matchedHandlers = [];
  var patternArr = pattern.split(this._delimiter);
  var path, pathArr, pathHandlers;

  this.validatePath(patternArr);

  for (var i = 0; i < paths.length; i++) {
    path = paths[i];
    pathArr = path.substr(prefix.length).split(this._delimiter);

    if (path === pattern || doPathsMatch(patternArr, pathArr)) {
      pathHandlers = this._handlers[path];

      for (var j = 0; j < pathHandlers.length; j++) {
        if (pathHandlers[j].active) {
          matchedHandlers.push(pathHandlers[j]);
        } else {
          pathHandlers.splice(j, 1);
          j--;
        }
      }

      if (pathHandlers.length === 0) {
        this.remove(path.substr(1));
      }
    }
  }

  return matchedHandlers;
};


Store.prototype.put = function put(path, handler) {
  this.getOrCreatePath(path).push(handler);
};


Store.prototype.remove = function remove(path, handler) {
  path = prefix + path;

  var pathHandlers = this._handlers[path];
  var keyIndex;

  if (!pathHandlers) {
    return;
  }

  if (handler) {
    for (var i = 0; i < pathHandlers.length; i++) {
      if (pathHandlers[i].is(handler)) {
        pathHandlers[i].active = false;
        pathHandlers.splice(i, 1);
        i--;
      }
    }
  }

  if (!handler || pathHandlers.length === 0) {
    this._handlers[path] = undefined;
    keyIndex = this._paths.indexOf(path);

    if (keyIndex !== -1) {
      this._paths.splice(keyIndex, 1);
    }
  }
};


Store.prototype.getOrCreatePath = function getOrCreatePath(path) {
  var pathArr = path.split(this._delimiter);

  this.validatePath(pathArr);

  path = prefix + path;
  var handlers = this._handlers[path];

  if (!handlers) {
    this._paths.push(path);
    handlers = this._handlers[path] = [];
  }

  return handlers;
};


Store.prototype.validatePath = function validatePath(pathArr) {
  var numberOfWildcards = 0;

  for (var i = 0; i < pathArr.length; i++) {
    if (pathArr[i].length === 0 || pathArr[i].search(/^\s*$/) !== -1) {
      throw new Error('Path cannot contain empty or whitespace-only fragments');
    }

    if (pathArr[i] === '*' || pathArr[i] === '**') {
      numberOfWildcards++;

      if (numberOfWildcards > 1) {
        throw new Error('Path cannot contain more than one wildcard');
      }
    }
  }
};
