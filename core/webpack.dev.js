const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { styleLoaders } = require('./tools')

function genPlugins (isFirefox) {
  const plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
    new FriendlyErrorsPlugin()
  ]
  if (process.env.ANALYZER) {
    plugins.push(new BundleAnalyzerPlugin())
  }
  return plugins
}

module.exports = (env) =>
  merge(baseWebpack(env), {
    watch: true,
    module: { rules: styleLoaders({ sourceMap: false }) },
    devtool: 'cheap-module-source-map',
    plugins: genPlugins(env.FIREFOX)
  })
