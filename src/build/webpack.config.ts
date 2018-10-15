'use strict';

import webpack = require('webpack');
import { resolve } from 'path';
import merge = require('webpack-merge');
import UglifyJsPlugin = require('uglifyjs-webpack-plugin');
import ExtractTextPlugin = require('extract-text-webpack-plugin');
import OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
import DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
import { banner } from 'webpack-marauder/libs/utils';
import config = require('webpack-marauder/config');

const maraConf = require(config.paths.marauder);
const shouldUseSourceMap = !!maraConf.sourceMap;
const isProd = process.env.NODE_ENV === 'production';
// 压缩配置
const compress = Object.assign(config.compress, maraConf.compress);

/**
 * 生成生产配置
 * @param  {String} options.entry 页面名称
 * @param  {String} options.cmd   当前命令
 * @return {Object}               webpack 配置对象
 */
export default function(resource: string, opts: any) {
  const baseWebpackConfig = require('webpack-marauder/webpack/webpack.base.conf')(
    'index'
  );
  const entry = `${resolve(__dirname, './cardLoader.js')}?sdk=${
    opts.sdk
  }!${resource}`;

  // https://github.com/survivejs/webpack-merge
  const webpackConfig = merge(baseWebpackConfig, {
    // 在第一个错误出错时抛出，而不是无视错误
    bail: isProd,
    entry,
    devtool: isProd
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : 'cheap-module-source-map',
    watch: false,
    output: {
      publicPath: config.build.assetsPublicPath,
      filename: maraConf.hash
        ? 'static/js/[name].[chunkhash:8].min.js'
        : 'static/js/[name].min.js',
      chunkFilename: maraConf.chunkHash
        ? 'static/js/[name].[chunkhash:8].async.js'
        : 'static/js/[name].async.js',
      pathinfo: !isProd
    },
    plugins: [
      new webpack.DefinePlugin(
        isProd ? config.build.env.stringified : config.dev.env.stringified
      ),
      // 使作作用域提升(scope hoisting)
      // https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
      isProd && new webpack.optimize.ModuleConcatenationPlugin(),
      // Minify the code.
      isProd &&
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
      isProd &&
        new ExtractTextPlugin({
          filename: maraConf.hash
            ? 'static/css/[name].[contenthash:8].css'
            : 'static/css/[name].min.css'
        }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      isProd &&
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
      new DuplicatePackageCheckerPlugin({
        // show details
        verbose: true,
        showHelp: false,
        // throwt error
        emitError: isProd,
        // check major version
        strict: true
      }),
      new webpack.BannerPlugin({
        banner: banner(), // 其值为字符串，将作为注释存在
        entryOnly: true // 如果值为 true，将只在入口 chunks 文件中添加
      })
    ].filter(Boolean)
  });

  // webpackConfig.plugins.push(new CardPlugin());

  // 重要：确保 zip plugin 在插件列表末尾

  return webpackConfig;
}
