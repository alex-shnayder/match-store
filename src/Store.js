'use strict';

var Record = require('./Record');
var doPathsMatch = require('./doPathsMatch');


var DEFAULT_SETTINGS = {
  delimeter: '.',
  prefix: '~'
};


function Store(settings) {
  this._records = {};
  this._paths = [];
  this._settings = settings || {};
}

module.exports = Store;
Store.prototype.constructor = Store;


Store.prototype.get = function get(pattern) {
  var delimeter = this._settings.delimeter || DEFAULT_SETTINGS.delimeter;
  var prefix = this._settings.prefix || DEFAULT_SETTINGS.prefix;
  var paths = this._paths;
  var matchedValues = [];
  var patternArr = pattern.split(delimeter);
  var path, pathArr, pathRecords, record;

  this.validatePath(patternArr);

  for (var i = 0; i < paths.length; i++) {
    path = paths[i];
    pathArr = path.substr(prefix.length).split(delimeter);

    if (path === pattern || doPathsMatch(patternArr, pathArr)) {
      pathRecords = this._records[path];

      for (var j = 0; j < pathRecords.length; j++) {
        record = pathRecords[j];

        if (record.active) {
          matchedValues.push(record.use());
        }

        if (!record.active) {
          pathRecords.splice(j, 1);
          j--;
        }
      }

      if (pathRecords.length === 0) {
        this.del(path.substr(1));
      }
    }
  }

  return matchedValues;
};


Store.prototype.set = function set(path, value, uses) {
  var record = new Record(value, uses);
  this.getOrCreatePath(path).push(record);
};


Store.prototype.del = function del(path, value) {
  var prefix = this._settings.prefix || DEFAULT_SETTINGS.prefix;
  path = prefix + path;

  var pathRecords = this._records[path];
  var keyIndex;

  if (!pathRecords) {
    return;
  }

  if (arguments.length === 2) {
    for (var i = 0; i < pathRecords.length; i++) {
      if (pathRecords[i].is(value)) {
        pathRecords[i].active = false;
        pathRecords.splice(i, 1);
        i--;
      }
    }
  }

  if (arguments.length === 1 || pathRecords.length === 0) {
    this._records[path] = undefined;
    keyIndex = this._paths.indexOf(path);

    if (keyIndex !== -1) {
      this._paths.splice(keyIndex, 1);
    }
  }
};


Store.prototype.getOrCreatePath = function getOrCreatePath(path) {
  var delimeter = this._settings.delimeter || DEFAULT_SETTINGS.delimeter;
  var prefix = this._settings.prefix || DEFAULT_SETTINGS.prefix;
  var pathArr = path.split(delimeter);

  this.validatePath(pathArr);

  path = prefix + path;
  var records = this._records[path];

  if (!records) {
    this._paths.push(path);
    records = this._records[path] = [];
  }

  return records;
};


Store.prototype.validatePath = function validatePath(pathArr) {
  var numberOfWildcards = 0;

  for (var i = 0; i < pathArr.length; i++) {
    if (pathArr[i].length === 0 || pathArr[i].search(/^\s*$/) !== -1) {
      throw new Error('Path must not contain empty or whitespace-only fragments');
    }

    if (pathArr[i] === '*' || pathArr[i] === '**') {
      numberOfWildcards++;

      if (numberOfWildcards > 1) {
        throw new Error('Path must not contain more than one wildcard');
      }
    }
  }
};
