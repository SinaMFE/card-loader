'use strict';

import webpack = require('webpack');
import { resolve } from 'path';
import merge = require('webpack-merge');
import TerserPlugin = require('terser-webpack-plugin');
import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
import safePostCssParser = require('postcss-safe-parser');
import { banner } from '@mara/x/lib/utils';
import config = require('@mara/x/config');

const shouldUseSourceMap = config.build.sourceMap;
const isProd = process.env.NODE_ENV === 'production';

/**
 * 生成生产配置
 * @param  {String} options.entry 页面名称
 * @param  {String} options.cmd   当前命令
 * @return {Object}               webpack 配置对象
 */
export default function(context: object, resource: string, opts: any) {
  const baseWebpackConfig = require('@mara/x/webpack/webpack.base.conf')(
    context
  );
  const entry = `${resolve(__dirname, './cardWrapper.js')}?sdk=${
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
      publicPath: config.assetsPublicPath,
      filename: config.hash.main
        ? 'static/js/[name].[chunkhash:8].js'
        : 'static/js/[name].min.js',
      chunkFilename: config.hash.chunk
        ? 'static/js/[name].[chunkhash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      pathinfo: !isProd
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending futher investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2
            },
            mangle: {
              safari10: true
            },
            output: {
              ecma: 5,
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
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: shouldUseSourceMap
              ? {
                  // `inline: false` forces the sourcemap to be output into a
                  // separate file
                  inline: false,
                  // `annotation: true` appends the sourceMappingURL to the end of
                  // the css file, helping the browser find the sourcemap
                  annotation: true
                }
              : false
          },
          canPrint: false // 不显示通知
        })
      ],
      // Keep the runtime chunk seperated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      // set false until https://github.com/webpack/webpack/issues/6598 be resolved
      runtimeChunk: false
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: config.hash.main
          ? 'static/css/[name].[contenthash:8].css'
          : 'static/css/[name].min.css',
        chunkFilename: config.hash.chunk
          ? 'static/css/[name].[contenthash:8].chunk.css'
          : 'static/css/[name].chunk.css'
      }),
      new webpack.BannerPlugin({
        banner: banner(), // 其值为字符串，将作为注释存在
        entryOnly: true // 如果值为 true，将只在入口 chunks 文件中添加
      })
    ].filter(Boolean)
  });

  return webpackConfig;
}
