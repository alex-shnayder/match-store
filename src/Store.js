'use strict';

var Record = require('./Record');


var DEFAULT_SETTINGS = {
  prefix: '~',
  match: function areKeysEqual(a, b) {
    return a === b;
  }
};


function Store(settings) {
  this.records = {};
  this.keys = [];
  this.settings = settings || {};
}

module.exports = Store;
Store.prototype.constructor = Store;


Store.prototype.get = function get(pattern) {
  var prefix = this.settings.prefix || DEFAULT_SETTINGS.prefix;
  var doKeysMatch = this.settings.match || DEFAULT_SETTINGS.match;
  var keys = this.keys;
  var matchedValues = [];
  var fullKey, key, keyRecords, record;

  for (var i = 0; i < keys.length; i++) {
    fullKey = keys[i];
    key = fullKey.substr(prefix.length);

    if (doKeysMatch(key, pattern)) {
      keyRecords = this.records[fullKey];

      for (var j = 0; j < keyRecords.length; j++) {
        record = keyRecords[j];

        if (record.active) {
          matchedValues.push(record.use());
        }

        if (!record.active) {
          keyRecords.splice(j, 1);
          j--;
        }
      }

      if (keyRecords.length === 0) {
        this.del(key.substr(1));
      }
    }
  }

  return matchedValues;
};


Store.prototype.put = function put(key, value, uses) {
  var record = new Record(value, uses);
  getOrCreateKey.call(this, key).push(record);
};


Store.prototype.del = function del(key, value) {
  var prefix = this.settings.prefix || DEFAULT_SETTINGS.prefix;
  key = prefix + key;

  var keyRecords = this.records[key];
  var keyIndex;

  if (!keyRecords) {
    return;
  }

  if (arguments.length === 2) {
    for (var i = 0; i < keyRecords.length; i++) {
      if (keyRecords[i].is(value)) {
        keyRecords[i].active = false;
        keyRecords.splice(i, 1);
        i--;
      }
    }
  }

  if (arguments.length === 1 || keyRecords.length === 0) {
    this.records[key] = undefined;
    keyIndex = this.keys.indexOf(key);

    if (keyIndex !== -1) {
      this.keys.splice(keyIndex, 1);
    }
  }
};


function getOrCreateKey(key) {
  var prefix = this.settings.prefix || DEFAULT_SETTINGS.prefix;
  key = prefix + key;
  var records = this.records[key];

  if (!records) {
    this.keys.push(key);
    records = this.records[key] = [];
  }

  return records;
}
