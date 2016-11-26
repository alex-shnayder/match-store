(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["wildcard-store"] = factory();
	else
		root["wildcard-store"] = factory();
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
	var doPathsMatch = __webpack_require__(2);
	
	
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	
	function Record(value, uses) {
	  if (!value) {
	    throw new Error('Can\'t create a record without a value');
	  }
	
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	
	module.exports = function doPathsMatch(path1, path2) {
	  if (path1[0] === '**' && path2[path2.length] === '**' ||
	      path2[0] === '**' && path1[path1.length] === '**') {
	    return true;
	  }
	
	  var minLength = Math.min(path1.length, path2.length);
	
	  if (!doPathBeginningsMatch(path1, path2, minLength)) {
	    return false;
	  }
	
	  var reversedPath1 = new Array(minLength);
	  var reversedPath2 = new Array(minLength);
	
	  for (var i = 0; i < minLength; i++) {
	    reversedPath1[i] = path1[path1.length - i - 1];
	    reversedPath2[i] = path2[path2.length - i - 1];
	  }
	
	  if (!doPathBeginningsMatch(reversedPath1, reversedPath2, minLength)) {
	    return false;
	  }
	
	  return true;
	};
	
	
	function doPathBeginningsMatch(path1, path2, minLength) {
	  for (var i = 0; i < minLength; i++) {
	    if (path1[i] === '**' || path2[i] === '**') {
	      return true;
	    }
	
	    if (path1[i] !== path2[i] && path1[i] !== '*' && path2[i] !== '*') {
	      return false;
	    }
	  }
	
	  return (minLength === path1.length && minLength === path2.length);
	}


/***/ }
/******/ ])
});
;
//# sourceMappingURL=wildcard-store.js.map