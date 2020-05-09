/*const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const { styleLoaders } = require('./tools');

module.exports = (env, arg) => {
  return merge(baseWebpack, {
    watch: true,
    module: {
      rules: styleLoaders({ sourceMap: false })
    },
    devtool: 'inline-source-map',
    plugins: [

      // new ChromeExtensionReloader({
      //   port: 9090,
      //   reloadPage: true,
      //   entries: {
      //     contentScript: 'content',
      //     background: 'background'
      //   }
      // }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': "'development'"
      }),
      new FriendlyErrorsPlugin()
    ],
    devServer: {
      port: 9090,
      hot: true
    }
  })
}*/
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const {styleLoaders} = require('./tools')
const ChromeReloadPlugin = require('wcer')
module.exports = merge(baseWebpack, {
  watch: true,
  module: {
    rules: styleLoaders({ sourceMap: false })
  },
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new ChromeReloadPlugin({
      port: 9090,
      manifest: path.join(__dirname, '..', 'src', 'manifest.js')
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new FriendlyErrorsPlugin()
  ]
})