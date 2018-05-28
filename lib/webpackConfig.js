'use strict';

const fs = require('fs');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

const config = require('webpack-marauder/config');
const {
  banner,
  rootPath,
  getChunks,
  isObject
} = require('webpack-marauder/libs/utils');

const maraConf = require(config.paths.marauder);
const shouldUseSourceMap = !!maraConf.sourceMap;
// 压缩配置
const compress = Object.assign(config.compress, maraConf.compress);

/**
 * 生成生产配置
 * @param  {String} options.entry 页面名称
 * @param  {String} options.cmd   当前命令
 * @return {Object}               webpack 配置对象
 */
module.exports = function({ entry, cmd }) {
  const distPageDir = `${config.paths.dist}/${entry}`;
  const baseWebpackConfig = require('webpack-marauder/webpack/webpack.base.conf')(
    entry
  );
  const hasHtml = fs.existsSync(`${config.paths.page}/${entry}/index.html`);
  const chunksEntry = getChunks(`src/view/${entry}/index.*.js`);

  // https://github.com/survivejs/webpack-merge
  const webpackConfig = merge(baseWebpackConfig, {
    // 在第一个错误出错时抛出，而不是无视错误
    bail: true,
    devtool: shouldUseSourceMap ? 'source-map' : false,
    entry: chunksEntry,
    watch: false,
    output: {
      path: distPageDir,
      publicPath: config.build.assetsPublicPath,
      filename: maraConf.hash
        ? 'static/js/[name].[chunkhash:8].min.js'
        : 'static/js/[name].min.js',
      chunkFilename: maraConf.chunkHash
        ? 'static/js/[name].[chunkhash:8].async.js'
        : 'static/js/[name].async.js'
    },
    plugins: [
      new webpack.DefinePlugin(config.build.env.stringified),
      // 使作作用域提升(scope hoisting)
      // https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
      new webpack.optimize.ModuleConcatenationPlugin(),
      // Minify the code.
      new UglifyJsPlugin({
        uglifyOptions: {
          // 强制使用 es5 压缩输出，避免 es6 优化导致兼容性问题
          ecma: 5,
          compress: {
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            drop_console: compress.drop_console
          },
          mangle: {
            safari10: true
          },
          output: {
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true
          }
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: shouldUseSourceMap
      }),
      // new webpack.ProvidePlugin({
      //   $: 'zepto',
      //   Zepto: 'zepto',
      //   'window.Zepto': 'zepto',
      //   'window.$': 'zepto'
      // }),
      new ExtractTextPlugin({
        filename: maraConf.hash
          ? 'static/css/[name].[contenthash:8].css'
          : 'static/css/[name].min.css'
      }),

      new OptimizeCssAssetsPlugin({
        // cssnano 中自带 autoprefixer，在压缩时会根据配置去除无用前缀
        // 为保持统一，将其禁用，在 4.0 版本后将会默认禁用
        // safe: true 禁止计算 z-index
        cssProcessorOptions: Object.assign(
          { autoprefixer: false, safe: true },
          shouldUseSourceMap
            ? {
                map: { inline: false }
              }
            : {}
        ),
        canPrint: false // 不显示通知
      }),
      // 【争议】：lib 模式禁用依赖分析?
      // 确保在 copy Files 之前
      new DuplicatePackageCheckerPlugin({
        // show details
        verbose: true,
        showHelp: false,
        // throwt error
        emitError: true,
        // check major version
        strict: true
      })
    ].filter(Boolean)
  });

  // webpackConfig.plugins.push(new CardPlugin());

  // 重要：确保 zip plugin 在插件列表末尾

  return webpackConfig;
};
