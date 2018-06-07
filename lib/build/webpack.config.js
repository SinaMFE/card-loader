'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var webpack_1 = require("webpack");
var path_1 = require("path");
var webpack_merge_1 = require("webpack-merge");
var uglifyjs_webpack_plugin_1 = require("uglifyjs-webpack-plugin");
var extract_text_webpack_plugin_1 = require("extract-text-webpack-plugin");
var optimize_css_assets_webpack_plugin_1 = require("optimize-css-assets-webpack-plugin");
var duplicate_package_checker_webpack_plugin_1 = require("duplicate-package-checker-webpack-plugin");
var config_1 = require("webpack-marauder/config");
var utils_1 = require("webpack-marauder/libs/utils");
var maraConf = require(config_1.default.paths.marauder);
var shouldUseSourceMap = !!maraConf.sourceMap;
var isProd = process.env.NODE_ENV === 'production';
// 压缩配置
var compress = Object.assign(config_1.default.compress, maraConf.compress);
/**
 * 生成生产配置
 * @param  {String} options.entry 页面名称
 * @param  {String} options.cmd   当前命令
 * @return {Object}               webpack 配置对象
 */
function default_1(resource) {
    var baseWebpackConfig = require('webpack-marauder/webpack/webpack.base.conf')('index');
    var entry = path_1.default.resolve(__dirname, './cardLoader.js') + "!" + resource;
    // https://github.com/survivejs/webpack-merge
    var webpackConfig = webpack_merge_1.default(baseWebpackConfig, {
        // 在第一个错误出错时抛出，而不是无视错误
        bail: isProd,
        entry: entry,
        devtool: isProd ? shouldUseSourceMap ? 'source-map' : false : 'cheap-module-source-map',
        watch: false,
        output: {
            publicPath: config_1.default.build.assetsPublicPath,
            filename: maraConf.hash
                ? 'static/js/[name].[chunkhash:8].min.js'
                : 'static/js/[name].min.js',
            chunkFilename: maraConf.chunkHash
                ? 'static/js/[name].[chunkhash:8].async.js'
                : 'static/js/[name].async.js',
            pathinfo: !isProd
        },
        plugins: [
            new webpack_1.default.DefinePlugin(isProd ? config_1.default.build.env.stringified : config_1.default.dev.env.stringified),
            // 使作作用域提升(scope hoisting)
            // https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f
            isProd && new webpack_1.default.optimize.ModuleConcatenationPlugin(),
            // Minify the code.
            isProd && new uglifyjs_webpack_plugin_1.default({
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
            isProd && new extract_text_webpack_plugin_1.default({
                filename: maraConf.hash
                    ? 'static/css/[name].[contenthash:8].css'
                    : 'static/css/[name].min.css'
            }),
            new webpack_1.default.IgnorePlugin(/^\.\/locale$/, /moment$/),
            isProd && new optimize_css_assets_webpack_plugin_1.default({
                // cssnano 中自带 autoprefixer，在压缩时会根据配置去除无用前缀
                // 为保持统一，将其禁用，在 4.0 版本后将会默认禁用
                // safe: true 禁止计算 z-index
                cssProcessorOptions: Object.assign({ autoprefixer: false, safe: true }, shouldUseSourceMap
                    ? {
                        map: { inline: false }
                    }
                    : {}),
                canPrint: false // 不显示通知
            }),
            new duplicate_package_checker_webpack_plugin_1.default({
                // show details
                verbose: true,
                showHelp: false,
                // throwt error
                emitError: isProd,
                // check major version
                strict: true
            }),
            new webpack_1.default.BannerPlugin({
                banner: utils_1.banner(),
                entryOnly: true // 如果值为 true，将只在入口 chunks 文件中添加
            }),
        ].filter(Boolean)
    });
    // webpackConfig.plugins.push(new CardPlugin());
    // 重要：确保 zip plugin 在插件列表末尾
    return webpackConfig;
}
exports.default = default_1;
