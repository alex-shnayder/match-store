'use strict';

var webpack = require('webpack');

module.exports = [{
  entry: {
    'match-store': './src/Store.js',
    'match-store.min': './src/Store.js'
  },
  output: {
    path: './dist',
    filename: '[name].js',
    library: 'match-store',
    libraryTarget: 'umd',
    devtoolModuleFilenameTemplate: 'match-store/[resource-path]'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
    })
  ],
  node: {
    process: false,
    setImmediate: false
  },
  devtool: 'source-map'
}];
