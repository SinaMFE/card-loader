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
  }

  if (isWap) {
    out += `var _a = require("${filePath}");`;
    out += `module.exports = _a;`;

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
    var img = new Image()
    img.src = 'https://__bridge_loaded__'
  
    var _a = require("${filePath}");
    var appSNC = require("@mfelibs/universal-framework").default;
    require("@mfelibs/universal-framework/src/libs/apis/closeWindow");

    var wintip = require("wintip");

    function closeModal() {
      appSNC.closeWindow()
    }

    wintip("modal load")

    // appSNC.ready((data) => {

      wintip("trigger ::: ready")
      _a.card({}, {closeModal}, "root").show()
    // })
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
    throw "没有找到card对应的manifest.json，card入口文件平级建立manifest.json文件";
  }
  let loaderName = "";
  try {
    const manifest = require(manifestPath);
    loaderName = manifest.name; //打包的时候输出目录用
  } catch (ex) {
    throw "card对应manifest识别失败！";
  }

  if (loaderName === "") {
    throw "card name不得为空！"
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