"use strict";

exports.__esModule = true;
exports.default = _default;

var _webpack = _interopRequireDefault(require("webpack"));

var _memoryFs = _interopRequireDefault(require("memory-fs"));

var _webpack2 = _interopRequireDefault(require("./webpack.config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(resource) {
  const webpackConfig = (0, _webpack2.default)(resource);
  const compiler = (0, _webpack.default)(webpackConfig); // 使用内存文件系统，构建后通过 stats 获取结果

  compiler.outputFileSystem = new _memoryFs.default();
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}