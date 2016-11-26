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
	
	var doPathsMatch = __webpack_require__(1);
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


/***/ },
/* 1 */
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