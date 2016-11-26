'use strict';

var webpack = require('webpack');

module.exports = [{
  entry: {
    'wildcard-store': './src/Store.js',
    'wildcard-store.min': './src/Store.js'
  },
  output: {
    path: './dist',
    filename: '[name].js',
    library: 'wildcard-store',
    libraryTarget: 'umd',
    devtoolModuleFilenameTemplate: 'wildcard-store/[resource-path]'
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
