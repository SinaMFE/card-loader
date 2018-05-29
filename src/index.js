'use strict';

import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import MemoryFS from 'memory-fs';
import webpack from 'webpack';
import getWebpackConfig from './webpackConfig.js';

const mfs = new MemoryFS();
const appDirectory = fs.realpathSync(process.cwd());

const isApp = process.env.jsbridgeBuildType == 'app';
const isWap =
  process.env.jsbridgeBuildType == 'wap' ||
  process.env.jsbridgeBuildType == 'web';

const cardModuleMap = {};

let cardModuleId = 0;

const cardDistRootPath = 'card';

function loader(source) {
  const self = this;
  const callback = this.async();
  const cardName = getCardNameFromManifest(this);
  const filePath = platformPath2posixPath(this.resourcePath);
  let result = '';
  let promise;

  if (!(cardName in cardModuleMap)) {
    cardModuleMap[cardName] = cardModuleId;
    // cardModuleId++;
  } else if (process.env.NODE_ENV == 'production') {
    throw new Error('[card-loader] 命名重复，已有模块命名为' + cardName);
  }

  if (isWap) {
    const jsRuntime = fs.readFileSync(path.join(__dirname, './web.runtime.js'));

    result += `import card from '${filePath}';`;
    result += jsRuntime;
    result += `export default {
      show(param) {
        if (!param || typeof param !== 'object') {
          throw new Error('参数不存在或非对象！')
        }

        var data = param.data
        if (!data || typeof data !== 'object') {
          data = {}
        }
        var display = param.display
        if (!display || typeof display !== 'object') {
          display = {};
          display.opacity = 0;
          display.backgroundColor = 'black';
        }
        addLayer(display.backgroundColor, display.opacity)

        card(data, {
          closeModal: function(cb) {
            cb && cb()
            removeLayer()
          }
        }, rootId).show();
      }
    };`;

    promise = Promise.resolve();
  } else if (isApp) {
    const rootDir = appDirectory;
    promise = BundleCardAssets(filePath, cardModuleId++, cardName)
      .then(({ cardModuleId, cardName, stats }) => {
        const htmlContent = require('./htmlTemplate');
        const destCardValidDir = path.posix.join('modal', cardName);
        const htmlDir = path.posix.join(destCardValidDir, 'index.html');

        self.emitFile(htmlDir, htmlContent);

        Object.keys(stats.compilation.assets).forEach(asset => {
          this.emitFile(`${destCardValidDir}/${asset}`, stats.compilation.assets[asset].source());
        })

        const modalPath = `modal/${cardName}/index.html`;

        result = `
          import appSNC from '@mfelibs/universal-framework';
          import showWVModal from '@mfelibs/client-jsbridge/src/sdk/appApis/showWVModal';

          appSNC.mountApi('appApis', {
            showWVModal
          });

          var onlinePath = location.origin + '/' + '${modalPath}'

          if(process.env.PUBLIC_URL.indexOf('http') > -1) {
            // @FIXME remove end slash
            onlinePath = process.env.PUBLIC_URL + '/${modalPath}'
          }

          export default {
            show: function(param) {
              if (!param || typeof param !== 'object') {
                throw new Error("show方法参数不存在或非对象！")
              }
              param.path = 'modal/${cardName}/index.html'

              if(onlinePath.indexOf('http') > -1) {
                param.onlinePath = onlinePath
              }

              appSNC.showWVModal(param);
            }
          }`;
      })
      // .then(clean);
  } else {
    throw new Error('[card-loader] 请指定 globalEnv.jsbridgeBuildType');
  }

  promise
    .then(() => {
      callback(null, result);
    })
    .catch(e => {
      throw new Error(e);
    });
}

function BundleCardAssets(filePath, cardModuleId, cardName) {
  cardModuleId = cardModuleId.toString();
  // const tempSrcFilePath = `/__card__/${cardModuleId}/tmp.js`
  let webpackConfig = getWebpackConfig({
    entry: 'index'
  });
  // 除了模块化以外使用 es5 编写
  const code = `
    import card from '${filePath}';
    import appSNC from '@mfelibs/universal-framework';
    import '@mfelibs/universal-framework/src/libs/apis/closeWindow';
    import '@mfelibs/universal-framework/src/libs/apis/onRendered';

    function closeModal() {
      appSNC.closeWindow()
    }

    appSNC.ready(function(data) {
      card(data, {closeModal: closeModal}, "root").show()
      appSNC.onRendered();
    })
    `;

  const tempSrcPath = path.resolve(
    appDirectory,
    path.join('build/card/', cardModuleId)
  );

  if (!fs.existsSync(tempSrcPath)) {
    fs.mkdirpSync(tempSrcPath);
  }

  const tempSrcFilePath = path.resolve(tempSrcPath, 'index.js');

  // 创建临时文件
  fs.writeFileSync(tempSrcFilePath, code);

  webpackConfig.entry.index = [
    path.resolve('./node_modules/webpack-marauder/webpack/polyfills.js'),
    tempSrcFilePath
  ];

  webpackConfig.output.path = path.resolve(
    appDirectory,
    path.join('build/card/', cardModuleId)
  );

  const compiler = webpack(webpackConfig);
  // 使用内存文件系统，构建后通过 stats 获取结果
  compiler.outputFileSystem = mfs;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);

      resolve({
        cardModuleId,
        cardName,
        stats
      });
    });
  });
}

function getCardNameFromManifest(loaderContext) {
  var manifestPath = path.join(loaderContext.context, 'manifest.json');
  let loaderName = '';

  if (fs.existsSync(manifestPath) != true) {
    throw new Error(
      '[card-loader] 没有找到card对应的manifest.json，在card入口文件同目录建立manifest.json文件'
    );
  }

  try {
    const manifest = require(manifestPath);
    loaderName = manifest.name; //打包的时候输出目录用
  } catch (ex) {
    throw new Error('[card-loader] card对应manifest识别失败！');
  }

  if (loaderName === '') {
    throw new Error('[card-loader] manifest name字段不得为空！');
  }

  return loaderName;
}

function clean({ rootDir, cardModuleId }) {
  const tempDir = path.resolve(rootDir, path.join('build/card/', cardModuleId));

  const distDir = path.resolve(rootDir, 'dist' + cardModuleId);

  if (fs.existsSync(tempDir)) {
    return Promise.all([fs.emptyDir(tempDir)]).then(() => {
      fs.rmdirSync(tempDir);
    });
  }
}

function platformPath2posixPath(pathString) {
  if (typeof pathString !== 'string') {
    throw new Error('传递参数非字符串');
  }

  return pathString.split(path.sep).join(path.posix.sep);
}

export default loader;
