'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.raw = undefined;
exports.default = loader;

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const Memoryfs = require('memory-fs');

const appDirectory = fs.realpathSync(process.cwd());

const isApp = process.env.jsbridgeBuildType == 'app';
const isWap =
  process.env.jsbridgeBuildType == 'wap' ||
  process.env.jsbridgeBuildType == 'web';

const cardModuleMap = {};

let cardModuleId = 0;

const cardDistRootPath = 'card';

function loader(content) {
  const self = this;
  const callback = this.async();
  const cardName = getCardNameFromManifest(this);
  const filePath = this.resource;
  let out = '';
  let promise;

  if (!(cardName in cardModuleMap)) {
    cardModuleMap[cardName] = cardModuleId;
    // cardModuleId++;
  } else if (process.env.NODE_ENV == 'production') {
    throw new Error('[card-loader] 命名重复，已有模块命名为' + cardName);
  }

  if (isWap) {
    const jsRuntime = fs.readFileSync(path.join(__dirname, './web.runtime.js'));

    out += `var _a = require("${filePath}").default;`;
    out += jsRuntime;
    out += `module.exports = {
      show(param) {

        if (!param || typeof param !== "object") {
          throw new Error("参数不存在或非对象！")
        }

        var data = param.data
        if (!data || typeof data !== "object") {
          data = {}
        }
        var display = param.display
        if (!display || typeof display !== "object") {
          display = {};
          display.opacity = 0;
          display.backgroundColor = "black";
        }
        addLayer(display.backgroundColor, display.opacity)

        _a(data, {
          closeModal: function(cb) {
            cb && cb()
            removeLayer()
          }
        }, rootId).show();
      }
    };`;

    promise = Promise.resolve();
  }

  if (isApp) {
    const rootDir = appDirectory;
    promise = BundleCardAssets(filePath, cardModuleId++, cardName)
      .then(({ cardModuleId, cardName }) => {
        const staticBuildFilePath = path.resolve(
          rootDir,
          `build/card/${cardModuleId}/index/static/`
        );

        const htmlContent = require('./htmlTemplate');

        const destCardRootPath = 'modal';

        const destCardValidDir = path.join(destCardRootPath, cardName);

        const htmlDir = path.join(destCardValidDir, 'index.html');

        self.emitFile(htmlDir, htmlContent);

        const staticFileArr = glob.sync(
          path.join(staticBuildFilePath, '**/*.*')
        );

        const fileRelaPathArr = staticFileArr.map(filePath => {
          return filePath.split(staticBuildFilePath)[1];
        });

        const readFilePromiseArr = staticFileArr.map(filePath => {
          return new Promise((resolve, reject) => {
            fs.readFile(filePath).then(value => {
              resolve(value);
            });
          });
        });

        const fileEmitPms = Promise.all(readFilePromiseArr).then(
          (files, index) => {
            files.forEach((content, index) => {
              const destPath = path.join(
                destCardValidDir,
                'static',
                fileRelaPathArr[index]
              );

              this.emitFile(destPath, content);
            });
          }
        );

        const modalPath = `modal/${cardName}/index.html`;

        out = `
          var appSNC = require("@mfelibs/universal-framework").default;

          var showWVModal = require("@mfelibs/client-jsbridge/src/sdk/appApis/showWVModal").default;

          appSNC.mountApi("appApis", {
            showWVModal
          });

          var onlinePath = location.origin + '/' + '${modalPath}'

          if(process.env.PUBLIC_URL.indexOf('http') > -1) {
            // @FIXME remove end slash
            onlinePath = process.env.PUBLIC_URL + '/${modalPath}'
          }

          module.exports = {
            show: function(param) {
              if (!param || typeof param !== "object") {
                throw new Error("show方法参数不存在或非对象！")
              }
              param.path = "modal/${cardName}/index.html"

              if(onlinePath.indexOf('http') > -1) {
                param.onlinePath = onlinePath
              }

              appSNC.showWVModal(param);
            }
          }`;

        return fileEmitPms.then(() => {
          return {
            rootDir,
            cardModuleId
          };
        });
      })
      .then(removeDir);
  }

  if (promise) {
    promise.then(() => {
      callback(null, out);
    });
  } else {
    return '';
  }
}

function BundleCardAssets(filePath, cardModuleId, cardName) {
  cardModuleId = cardModuleId.toString();

  const webpack = require('webpack');
  const getWebpackConfig = require('./webpackConfig.js');
  const tempSrcPath = path.resolve(
    appDirectory,
    path.join('build/card/', cardModuleId)
  );
  const tempSrcFilePath = path.resolve(tempSrcPath, 'index.js');
  let webpackConfig = getWebpackConfig({
    entry: 'index'
  });

  if (!fs.existsSync(tempSrcPath)) {
    fs.mkdirpSync(tempSrcPath);
    // fs.mkdirSync(tempSrcFilePath);
  }

  const code = `
    var _a = require("${filePath}").default;
    var appSNC = require("@mfelibs/universal-framework").default;
    require("@mfelibs/universal-framework/src/libs/apis/closeWindow");
    require("@mfelibs/universal-framework/src/libs/apis/onRendered");

    function closeModal() {
      appSNC.closeWindow()
    }

    appSNC.ready(function(data) {
      _a(data, {closeModal: closeModal}, "root").show()
      appSNC.onRendered();
    })

    appSNC.onRendered();
    `;

  // 创建临时文件
  fs.writeFileSync(tempSrcFilePath, code);

  // webpackConfig.entry = tempSrcFilePath;

  const webpackEntry = [];
  webpackEntry.push(
    path.resolve('./node_modules/webpack-marauder/webpack/polyfills.js')
  );
  webpackEntry.push(tempSrcFilePath);

  webpackConfig.entry.index = webpackEntry;

  webpackConfig.output.path = path.resolve(
    appDirectory,
    path.join('build/card/', cardModuleId),
    'index'
  );

  const compiler = webpack(webpackConfig);
  // compiler.outputFileSystem = new Memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      resolve({
        cardModuleId,
        cardName
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

function removeDir({ rootDir, cardModuleId }) {
  const tempDir = path.resolve(rootDir, path.join('build/card/', cardModuleId));

  // const distDir = path.resolve(rootDir, "dist" + cardModuleId);

  if (fs.existsSync(tempDir)) {
    return Promise.all([fs.emptyDir(tempDir)]).then(() => {
      fs.rmdirSync(tempDir);
    });
  }
}

var raw = (exports.raw = false);
