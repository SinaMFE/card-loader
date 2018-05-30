'use strict';

exports.__esModule = true;
exports.default = void 0;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _loaderUtils = require("loader-utils");

var _build = _interopRequireDefault(require("./build"));

var _result = _interopRequireDefault(require("./result"));

var _html = _interopRequireDefault(require("./template/html"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isWap = process.env.jsbridgeBuildType === 'wap' || process.env.jsbridgeBuildType === 'web';
const cardNamePool = [];

function loader(source) {
  const callback = this.async();
  const options = (0, _loaderUtils.getOptions)(this);
  const cardName = getCardNameFromManifest(this);
  const resourceStr = (0, _loaderUtils.stringifyRequest)(this, this.resourcePath);

  if (cardNamePool.includes(cardName)) {
    throw new Error('[card-loader] 命名重复，已有模块命名为 ' + cardName);
  } else {
    cardNamePool.push(cardName);
  }

  if (isWap) return callback(null, _result.default.wap(resourceStr));
  (0, _build.default)(this.resource).then(stats => {
    emitFile(this, cardName, stats.compilation.assets);
    callback(null, _result.default.app(cardName));
  }).catch(e => {
    throw new Error(e);
  });
}

function emitFile(ctx, cardName, assets) {
  const dist = _path.default.posix.join('modal', cardName);

  ctx.emitFile(`${dist}/index.html`, _html.default);
  Object.keys(assets).forEach(asset => {
    ctx.emitFile(`${dist}/${asset}`, assets[asset].source());
  });
}

function getCardNameFromManifest(loaderContext) {
  var manifestPath = _path.default.join(loaderContext.context, 'manifest.json');

  let loaderName = '';

  if (!_fsExtra.default.existsSync(manifestPath)) {
    throw new Error('[card-loader] 未找到 card 对应的 manifest.json，请在 card 入口文件同目录建立 manifest.json 文件');
  }

  try {
    loaderName = require(manifestPath).name;
  } catch (e) {
    throw new Error('[card-loader] card 对应 manifest 识别失败！');
  }

  if (!loaderName) {
    throw new Error('[card-loader] 请在 manifest.json 中指定 name 字段');
  }

  return loaderName;
} // 兼容 Windows 平台


function posixFormat(pathString) {
  if (!pathString || typeof pathString !== 'string') {
    throw new Error('请传递 card 入口文件');
  }

  return pathString.split(_path.default.sep).join(_path.default.posix.sep);
}

var _default = loader;
exports.default = _default;