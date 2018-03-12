const path = require('path')
const webpack = require('webpack')
const ChromeReloadPlugin = require('wcer')
const { cssLoaders, htmlPage } = require('./tools')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const GenerateLocaleJsonPlugin = require('../plugins/GenerateLocaleJsonPlugin')

let resolve = (dir) => path.join(__dirname, '..', 'src', dir)
module.exports = (env) => {
  Object.assign(process.env, env)
  return {
    entry: {
      tab: resolve('./tab'),
      options: resolve('./options'),
      content: resolve('./content'),
      background: resolve('./backend')
    },
    output: {
      path: path.join(__dirname, '..', 'build', (!env.FIREFOX) ? 'chrome' : 'firefox'),
      publicPath: '/',
      filename: 'js/[name].js',
      chunkFilename: 'js/[id].[name].js?[hash]',
      library: '[name]'
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src')
      }
    },
    module: {
      rules: [{
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [path.join(__dirname, '..', 'src'), path.join(__dirname, '..', 'test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true,
          loaders: {
            ...cssLoaders(),
            js: { loader: 'babel-loader' }
          },
          transformToRequire: {
            video: 'src',
            source: 'src',
            img: 'src',
            image: 'xlink:href'
          }
        }
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, '..', 'src'), path.join(__dirname, '..', 'test'), path.join(__dirname, '..', 'node_modules/vue-awesome')]
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      }, {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }]
    },
    plugins: [
      new CleanWebpackPlugin([path.join('..', 'build', (env.FIREFOX) ? 'firefox' : 'chrome') + '/*.*'], { allowExternal: true }),
      htmlPage('Counter for Messenger', 'app', ['vendor', 'element', 'chartjs', 'tab']),
      htmlPage('options', 'options', ['vendor', 'element', 'chartjs', 'options']),
      htmlPage('background', 'background', ['vendor', 'element', 'chartjs', 'background']),
      new webpack.DefinePlugin({
        chrome: (!env.FIREFOX) ? 'chrome' : 'browser',
        'process.env.FIREFOX': (env.FIREFOX) ? 'true' : 'false',
        'process.env.BETA': (env.BETA) ? 'true' : 'false'
      }),
      new CopyWebpackPlugin([{ from: path.join(__dirname, '..', 'static') }]),
      new ChromeReloadPlugin({
        port: (!env.FIREFOX) ? 9090 : 9091,
        manifest: path.join(__dirname, '..', 'src', 'manifest.js')
      }),
      new GenerateLocaleJsonPlugin({
        _locales: path.join(__dirname, '..', 'src', '_locales')
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: (m) => /node_modules/.test(m.context)
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'element',
        minChunks: (m) => m.context.indexOf(path.join('node_modules', 'element-ui')) > -1 ||
          m.context.indexOf(path.join('node_modules', 'chart.js')) > -1
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'chartjs',
        minChunks: (m) => m.context.indexOf(path.join('node_modules', 'chart.js')) > -1
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    performance: { hints: false }
  }
}
