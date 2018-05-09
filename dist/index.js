"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.raw = undefined;
exports.default = loader;

const fs = require("fs-extra");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());

const isApp = process.env.jsbridgeBuildType == "app";
const isWap =
  process.env.jsbridgeBuildType == "wap" ||
  process.env.jsbridgeBuildType == "web";

const cardModuleMap = {};

let cardModuleId = 0;

const cardDistRootPath = "card";

function loader(content) {
  const self = this;
  const callback = this.async();

  let out = "";

  let promise;

  const cardName = getCardNameFromManifest(this);

  const filePath = this.resource;

  if (!(cardName in cardModuleMap)) {
    cardModuleMap[cardName] = cardModuleId;
    // cardModuleId++;
  } else if (process.env.NODE_ENV == "production") {
    throw new Error("[card-loader] 命名重复，已有模块命名为" + cardName)
  }

  if (isWap) {

    const jsRuntime = fs.readFileSync(path.join(__dirname, "./web.runtime.js"));

    out += `var _a = require("${filePath}").default;`;
    out += jsRuntime;
    out += `module.exports = {
      show(param) {

        if (!param || typeof data !== "object") {
          throw new Error("参数不存在或非对象！")
        }

        let data = param.data
        if (!data || typeof data !== "object") {
          data = {}
        }
        const display = param.display
        if (!display || typeof display !== "object") {
          display = {};
          display.opacity = 0;
          display.backgroundColor = "black";
        }
        addLayer(display.backgroundColor, display.opacity)

        _a(data, {
          closeModal(cb) {
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
      .then(({
        cardModuleId,
        cardName
      }) => {

        const jsFilePath = path.resolve(
          rootDir,
          `dist${cardModuleId}/index/static/js/main.min.js`
        );

        const cssFilePath = path.resolve(
          rootDir,
          `dist${cardModuleId}/index/static/css/main.min.css`
        );

        const jsContent = fs.readFileSync(jsFilePath);

        let cssContent = undefined;

        try {
          cssContent = fs.readFileSync(cssFilePath);
        } catch (err) {}
        // const cssContent =

        const htmlContent = require("./htmlTemplate");

        const cardDistRootPath = "modal";

        const cardDir = path.join(cardDistRootPath, cardName);

        const htmlDir = path.join(cardDir, "index.html");

        self.emitFile(htmlDir, htmlContent);

        const jsDir = path.join(cardDir, "static/index.min.js");

        self.emitFile(jsDir, jsContent);

        if (cssContent) {
          const cssDir = path.join(cardDir, "static/index.min.css");

          self.emitFile(cssDir, cssContent);
        }

        out = `
          var appSNC = require("@mfelibs/universal-framework").default

          console.log(appSNC);
          module.exports = {
            show: function(param) {
              console.log("__card loader log__")
              let fParam = {}
              Object.assign(fParam, {
                path: "modal/${cardName}/index.html"
              }, param);
              appSNC.showWVModal(fParam);
            }
          }`;

        return {
          rootDir,
          cardModuleId
        };
      })
      .then(removeDir);
  }

  if (promise) {
    promise.then(() => {
      callback(null, out);
    });
  } else {
    return "";
  }
}

function BundleCardAssets(filePath, cardModuleId, cardName) {
  const webpack = require("webpack");

  const getWebpackConfig = require("./webpackConfig.js");

  let webpackConfig = getWebpackConfig({
    entry: "index"
  });

  const tempSrcPath = path.resolve(appDirectory, "temp" + cardModuleId);
  const tempSrcFilePath = path.resolve(tempSrcPath, "index.js");
  if (!fs.existsSync(tempSrcPath)) {
    fs.mkdirSync(tempSrcPath);
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

    appSNC.ready((data) => {
      _a(data, {closeModal}, "root").show()
      appSNC.onRendered();
    })
    `;

  fs.writeFileSync(
    tempSrcFilePath,
    code
  );

  webpackConfig.entry = tempSrcFilePath;

  webpackConfig.output.path = path.resolve(
    appDirectory,
    "dist" + cardModuleId,
    "index"
  );

  const compiler = webpack(webpackConfig);

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
  var manifestPath = path.join(loaderContext.context, "manifest.json");
  if (fs.existsSync(manifestPath) != true) {
    throw new Error("[card-loader] 没有找到card对应的manifest.json，在card入口文件同目录建立manifest.json文件");
  }
  let loaderName = "";
  try {
    const manifest = require(manifestPath);
    loaderName = manifest.name; //打包的时候输出目录用
  } catch (ex) {
    throw new Error("[card-loader] card对应manifest识别失败！");
  }

  if (loaderName === "") {
    throw new Error("[card-loader] manifest name字段不得为空！");
  }

  return loaderName;
}

function removeDir({
  rootDir,
  cardModuleId
}) {
  const tempDir = path.resolve(rootDir, "temp" + cardModuleId);

  const distDir = path.resolve(rootDir, "dist" + cardModuleId);

  if (fs.existsSync(tempDir)) {
    return Promise.all([fs.emptyDir(tempDir), fs.emptyDir(distDir)]).then(
      () => {
        fs.rmdirSync(tempDir);
        fs.rmdirSync(distDir);
      }
    );
  }
}

var raw = (exports.raw = false);