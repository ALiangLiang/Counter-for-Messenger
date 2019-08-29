const path = require('path')
const webpack = require('webpack')
const ChromeReloadPlugin = require('wcer')
const { htmlPage } = require('./tools')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const GenerateLocaleJsonPlugin = require('../plugins/GenerateLocaleJsonPlugin')

const rootDir = path.resolve(__dirname, '..')

const resolve = (dir) => path.join(rootDir, 'src', dir)

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
      path: path.join(rootDir, 'build', (!env.FIREFOX) ? 'chrome' : 'firefox'),
      publicPath: '/',
      filename: 'js/[name].js',
      chunkFilename: 'js/[id].[name].js?[hash]',
      library: '[name]'
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': resolve('')
      },
      extensions: ['.js', '.vue', '.json']
    },
    optimization: {
      // Coz mozilla(firefox) addon store cannot accept single file bigger than 4mb, separate it.
      splitChunks: {
        chunks: 'initial',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            priority: -20,
            reuseExistingChunk: false
          },
          element: {
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            chunks: 'initial',
            priority: -10
          },
          chartjs: {
            test: /[\\/]node_modules[\\/]chart\.js[\\/]/,
            chunks: 'initial',
            priority: 0
          }
        }
      }
    },
    module: {
      rules: [{
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [path.join(rootDir, 'src')],
        options: { formatter: require('eslint-friendly-formatter') }
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: true,
          loaders: {
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
        include: [
          path.join(rootDir, 'src'),
          path.join(rootDir, 'node_modules', 'vue-awesome'),
          path.join(rootDir, 'node_modules', 'element-ui', 'src/utils/popup/popup-manager.js'),
          path.join(rootDir, 'node_modules', 'element-ui', 'src/utils/popup/index.js'),
          path.join(rootDir, 'node_modules', 'element-ui', 'src/utils/merge.js'),
          path.join(rootDir, 'node_modules', 'element-ui', 'src/utils/scrollbar-width.js'),
          path.join(rootDir, 'node_modules', 'element-ui', 'src/utils/vue-popper.js'),
          path.join(rootDir, 'node_modules', 'element-ui', 'src/utils/clickoutside.js')
        ]
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
      // new CleanWebpackPlugin({ root: path.join(rootDir, 'build', (env.FIREFOX) ? 'firefox' : 'chrome') }),
      new webpack.DefinePlugin({
        chrome: (!env.FIREFOX) ? 'chrome' : 'browser',
        'process.env.NODE_ENV': `"${env.NODE_ENV}"`,
        'process.env.CHROME': !!env.CHROME,
        'process.env.FIREFOX': !!env.FIREFOX,
        'process.env.BETA': !!env.BETA,
        'process.env.ALPHA': !!env.ALPHA,
        'process.env.DEV': (env.NODE_ENV === 'development')
      }),
      new VueLoaderPlugin(),
      htmlPage('Counter for Messenger', 'app', ['vendors~background~tab', 'vendors~options~tab', 'vendors~tab', 'chartjs~tab', 'chartjs', 'tab']),
      htmlPage('options', 'options', ['vendors~options~tab', 'vendors~options', 'options']),
      htmlPage('background', 'background', ['vendors~background~tab', 'background']),
      new CopyWebpackPlugin([{ from: path.join(rootDir, 'static') }]),
      new ChromeReloadPlugin({
        port: (!env.FIREFOX) ? 9090 : 9091,
        manifest: path.join(rootDir, 'src', 'manifest.js')
      }),
      new GenerateLocaleJsonPlugin({
        _locales: path.join(rootDir, 'src', '_locales')
      }),
      // never use locales of moment.js, so don't include it.
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    performance: { hints: false }
  }
}
