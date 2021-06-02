import { loader, Stats } from 'webpack';
import { existsSync, readJsonSync } from 'fs-extra';
import * as path from 'path';
import { getOptions, stringifyRequest } from 'loader-utils';
import build from './build';
import loaderResult from './output';

const isDev = process.env.NODE_ENV === 'development';
const isWap =
  process.env.jsbridgeBuildType === 'wap' ||
  process.env.jsbridgeBuildType === 'web';

const cardNamePool = {};

function emitFile(
  ctx: loader.LoaderContext,
  cardName: string,
  assets: Map<string, string>
) {
  const dist = path.posix.join('modal', cardName);

  assets.forEach((content, name) => {
    ctx.emitFile(`${dist}/${name}`, content, undefined);
  });
}

function getCardNameFromManifest(loaderContext: loader.LoaderContext): string {
  const manifestPath = path.join(loaderContext.context, 'manifest.json');
  let loaderName = '';

  if (!existsSync(manifestPath)) {
    throw new Error(
      '[card-loader] 未找到 card 对应的 manifest.json，请在 card 入口文件创建 manifest.json 文件'
    );
  }

  // 在读取 manifest 内容之前将其加入依赖
  // 在 dev 模式报错时修改文件得以重新编译
  loaderContext.dependency(manifestPath);

  try {
    loaderName = readJsonSync(manifestPath).name;
  } catch (e) {
    throw new Error('[card-loader] card manifest.json 解析失败！');
  }

  if (!loaderName) {
    throw new Error('[card-loader] 请在 manifest.json 中指定 name 字段');
  }

  checkCardName(loaderName, loaderContext.resourcePath);

  return loaderName;
}

function checkCardName(cardName: string, path: string) {
  if (
    cardNamePool[path] != cardName &&
    Object.values(cardNamePool).includes(cardName)
  ) {
    throw new Error(
      `[card-loader] ${cardName} 命名重复，请检查 card manifest 配置`
    );
  }

  cardNamePool[path] = cardName;
}

// function Scheme(this:any) {
//   this.a = []
// }

interface Scheme {
  wait_list: Array<any>
  count: number
  limit: number
}
class Scheme {
  constructor(limit: number = 2) {
    this.wait_list = []
    this.count = 0
    this.limit = limit
  }

  add = async (func: any) => {
    if (this.count >= this.limit) {
      await new Promise(resolve => {
        this.wait_list.push(resolve)
        console.log('this.wait_list: ', this.wait_list);
      })
    }

    this.count++
    console.log('this.count: ', this.count);
    await func()
    this.count--
    this.wait_list.length && this.wait_list.shift()()
    console.log('this.wait_list: ', this.wait_list);
  }
}

const scheme = new Scheme()

export default function (this: loader.LoaderContext, source: string): void {
  const callback: any = this.async();
  const options = getOptions(this) || {};
  const resourceStr = stringifyRequest(this, this.resourcePath);

  if (isWap) return callback(null, loaderResult.wap(resourceStr));

  let cardName = '';

  try {
    cardName = getCardNameFromManifest(this);
  } catch (e) {
    return callback([e.message]);
  }

  var main = () => {
    return build(this.resource, source, options)
      .then(({ assets }) => {
        emitFile(this, cardName, assets);
        callback(null, loaderResult.app(cardName, options));
      })
      .catch(e => {
        callback(e);
      });
  }

  scheme.add(main)
}