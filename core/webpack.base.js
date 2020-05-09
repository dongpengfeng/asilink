const path = require('path')
const webpack = require('webpack')
const { cssLoaders, htmlPage } = require('./tools')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ChromeReloadPlugin = require('wcer')

module.exports = {
  context: path.resolve(__dirname, "../src"),
  entry: {
    background: './background',
    content: './content',
    popup: './popup',
    options: './options',
  },
  output: {
    path: path.join(__dirname, '..', 'build'),
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].[name].js?[hash]',
    // chunkFilename: 'js/[name].js',
    library: '[name]'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', 'scss'],
    modules: [path.resolve(__dirname, "../src"), path.resolve('node_modules')],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, "../src"),
      '@service': 'service',
      '../@styles': 'styles',
      '@store': 'store',
      '@components': 'components',
      '@classes': 'classes',
      '@api': 'api',
      '@static': path.resolve(__dirname, "../static"),
      '@utils': 'utils',
      '@views': 'views'
    }
  },
  module: {
    rules: [
      /*      {
              test: /\.(js|vue)$/,
              loader: 'eslint-loader',
              enforce: 'pre',
              include: [path.join(__dirname, '..', 'src'), path.join(__dirname, '..', 'test')],
              options: {
                formatter: require('eslint-friendly-formatter')
              }
            },*/
      {
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
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [path.join(__dirname, '..', 'src'), path.join(__dirname, '..', 'test')],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  plugins: [
    htmlPage('popup', 'popup', ['manifest', 'vendor', 'popup']),
    htmlPage('options', 'options', ['options', 'vendor']),
    htmlPage('background', 'background', ['manifest', 'vendor', 'background']),
    htmlPage('home', 'app', ['tab']),
    htmlPage('panel', 'panel', ['panel']),
    htmlPage('devtools', 'devtools', ['devtools']),

    new CopyWebpackPlugin([{ from: path.join(__dirname, '..', 'static') }]),
    new CopyWebpackPlugin([{ from: path.join(__dirname, '..', 'build.pem'),to: path.join(__dirname, '..', 'build/key.pem')}]),
    // new CopyWebpackPlugin([{ from: path.join(__dirname, '..', 'public') }, {
    //   from: path.resolve(__dirname, '../src/manifest.json')
    // }])
    // new ChromeReloadPlugin({
    //   port: 9090,
    //   manifest: path.join(__dirname, '..', 'src', 'manifest.js')
    // })
  ],
  performance: { hints: false },
  node: {
    setImmediate: false,
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
