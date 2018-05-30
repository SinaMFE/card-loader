'use strict';

import fs from 'fs-extra';
import path from 'path';
import { getOptions, stringifyRequest } from 'loader-utils';
import build from './build';
import loaderResult from './result';
import htmlContent from './template/html';

const isWap =
  process.env.jsbridgeBuildType === 'wap' ||
  process.env.jsbridgeBuildType === 'web';

const cardNamePool = [];

function loader(source) {
  const callback = this.async();
  const options = getOptions(this);
  const cardName = getCardNameFromManifest(this);
  const resourceStr = stringifyRequest(this, this.resourcePath);

  if (cardNamePool.includes(cardName)) {
    throw new Error('[card-loader] 命名重复，已有模块命名为 ' + cardName);
  } else {
    cardNamePool.push(cardName);
  }

  if (isWap) return callback(null, loaderResult.wap(resourceStr));

  build(this.resource)
    .then(stats => {
      emitFile(this, cardName, stats.compilation.assets);

      callback(null, loaderResult.app(cardName));
    }).catch(e => {
      throw new Error(e);
    });
}

function emitFile(ctx, cardName, assets) {
  const dist = path.posix.join('modal', cardName);

  ctx.emitFile(`${dist}/index.html`, htmlContent);
  Object.keys(assets).forEach(asset => {
    ctx.emitFile(`${dist}/${asset}`, assets[asset].source());
  })
}

function getCardNameFromManifest(loaderContext) {
  var manifestPath = path.join(loaderContext.context, 'manifest.json');
  let loaderName = '';

  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      '[card-loader] 未找到 card 对应的 manifest.json，请在 card 入口文件同目录建立 manifest.json 文件'
    );
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
}

// 兼容 Windows 平台
function posixFormat(pathString) {
  if (!pathString || typeof pathString !== 'string') {
    throw new Error('请传递 card 入口文件');
  }

  return pathString.split(path.sep).join(path.posix.sep);
}

export default loader;
