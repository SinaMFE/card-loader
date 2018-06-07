"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webpack_1 = require("webpack");
var memory_fs_1 = require("memory-fs");
var webpack_config_1 = require("./webpack.config");
function default_1(resource) {
    var webpackConfig = webpack_config_1.default(resource);
    var compiler = webpack_1.default(webpackConfig);
    // 使用内存文件系统，构建后通过 stats 获取结果
    compiler.outputFileSystem = new memory_fs_1.default();
    return new Promise(function (resolve, reject) {
        compiler.run(function (err, stats) {
            if (err)
                return reject(err);
            resolve(stats);
        });
    });
}
exports.default = default_1;
