(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["match-store"] = factory();
	else
		root["match-store"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Record = __webpack_require__(1);
	
	
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	
	function Record(value, uses) {
	  this.active = true;
	  this.uses = uses || Infinity;
	  this.value = value;
	}
	
	module.exports = Record;
	Record.prototype.constructor = Record;
	
	
	Record.prototype.is = function is(record) {
	  return (record === this || record === this.value);
	};
	
	Record.prototype.use = function use() {
	  if (!this.active || this.uses < 1) {
	    throw new Error('Can\'t use an inactive record');
	  }
	
	  this.uses--;
	  this.active = (this.uses >= 1);
	
	  return this.value;
	};


/***/ }
/******/ ])
});
;
//# sourceMappingURL=match-store.js.map