const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const { styleLoaders } = require('./tools')

module.exports = (env) => {
  env.NODE_ENV = 'production'
  return merge(baseWebpack(env), {
    mode: 'production',
    module: { rules: styleLoaders({ extract: true, sourceMap: true }) },
    devtool: '#cheap-module-source-map',
    plugins: [
      new OptimizeCSSPlugin({ cssProcessorOptions: { safe: true } }),
      new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
      new webpack.HashedModuleIdsPlugin(),
      new ZipPlugin({
        path: '../..',
        filename: (env.FIREFOX) ? 'release-firefox.zip' : 'release-chrome.zip'
      })
    ]
  })
}
