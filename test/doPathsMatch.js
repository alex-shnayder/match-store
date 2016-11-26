'use strict';

var expect = require('chai').expect;
var doPathsMatch = require('../src/doPathsMatch');


var shouldMatch = [
  ['one', 'one'],
  ['one', '*'],
  ['*', '*'],
  ['one.two', 'one.two'],
  ['one.two', 'one.*'],
  ['one.*', 'one.two'],
  ['one.*', '*.two'],
  ['one.**', '**.two'],
  ['one.two.**', '**.three.four'],
  ['one.two.*', '**.three'],
  ['*.one.two.*', 'three.**.four'],
  ['one.two.three', '**.three'],
  ['one.**', 'one.two.three']
];

var shouldNotMatch = [
  ['one', 'two'],
  ['one.two', '*'],
  ['one.two.**', 'three'],
  ['one.two.**', 'one.two'],
  ['one.*', '*.two.three'],
  ['one.two.*', '*.three.four'],
  ['one.*', '**.two.three'],
  ['one.two.*', '**.three.four']
];


describe('doPathsMatch', function() {
  shouldMatch.forEach(function(paths) {
    it('matches "' + paths[0] + '" and "' + paths[1] + '"', function() {
      var path1 = paths[0].split('.');
      var path2 = paths[1].split('.');
      var result1 = doPathsMatch(path1, path2);
      var result2 = doPathsMatch(path2, path1);

      expect(result1).to.equal(true);
      expect(result2).to.equal(true);
    });
  });

  shouldNotMatch.forEach(function(paths) {
    it('doesn\'t match "' + paths[0] + '" and "' + paths[1] + '"', function() {
      var path1 = paths[0].split('.');
      var path2 = paths[1].split('.');
      var result = doPathsMatch(path1, path2);

      expect(result).to.equal(false);
    });
  });
});
