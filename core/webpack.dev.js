const webpack = require('webpack')
const merge = require('webpack-merge')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { styleLoaders } = require('./tools')
const baseWebpack = require('./webpack.base')

function genPlugins () {
  const plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin()
  ]
  if (process.env.ANALYZER) {
    plugins.push(new BundleAnalyzerPlugin())
  }
  return plugins
}

module.exports = (env) => {
  env.NODE_ENV = 'development'
  env.DEV = 'true'
  return merge(baseWebpack(env), {
    mode: 'development',
    watch: true,
    module: { rules: styleLoaders({ sourceMap: false }) },
    devtool: '#cheap-module-eval-source-map',
    // devtool: '#cheap-module-source-map',
    plugins: genPlugins()
  })
}
