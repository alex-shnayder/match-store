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
