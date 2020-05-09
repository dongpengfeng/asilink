/*const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const {styleLoaders} = require('./tools')

module.exports = (env, argv) => {
  return merge(baseWebpack, {
    devtool: 'cheap-module-eval-source-map',
    module: {
      rules: styleLoaders({ extract: true, sourceMap: true })
    },
    plugins: [
      new CleanWebpackPlugin(['build/*.*']),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': env.ForTest ? '"development"' : '"production"'
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      }),
      new ExtractTextPlugin({
        filename: 'css/[name].[contenthash].css'
      }),
      new webpack.HashedModuleIdsPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          return (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(
              path.join(__dirname, '../node_modules')
            ) === 0
          )
        },
        chunks: ['popup', 'options']
      })
    ]

  })
}
*/


const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { styleLoaders } = require('./tools')
const ConcatPlugin = require('webpack-concat-plugin');
const manifest = require('../src/manifest');

//var Crx = require("crx-webpack-plugin");
//console.log(manifest)



module.exports = merge(baseWebpack, {
  devtool: '#cheap-module-eval-source-map',
  module: {
    rules: styleLoaders({ extract: true, sourceMap: true })
  },
  plugins: [
    new CleanWebpackPlugin(['build/*.*']),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new ExtractTextPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: [
        'popup',
        'options'
      ],
      minChunks: function(module) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    function() {
      this.plugin('done', function() {
        //write manifest.js to json
        fs.writeFileSync(path.join(__dirname, '../build/manifest.json'), JSON.stringify(manifest));

        // const crx = new ChromeExtension({
        //   privateKey: fs.readFileSync('./build.pem')
        // });
        // crx.load('./build')
        //   .then(crx => crx.pack())
        //   .then(crxBuffer => {
        //     fs.writeFileSync('./crx/asimlink.crx', crxBuffer);
        //   });
      })
    }
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'background',
    //   chunks: ['vendor']
    // })
    // new ConcatPlugin({
    //   // examples
    //   uglify: false,
    //   sourceMap: false,
    //   name: 'background',
    //   outputPath: 'js/',
    //   fileName: '[name].js',
    //   filesToConcat: ['js/background.js'],
    //   attributes: {
    //     async: true
    //   }
    // })
  ]
})
