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

  const filePath = this.resource;

  if (!(filePath in cardModuleMap)) {
    cardModuleMap[filePath] = cardModuleId;
    // cardModuleId++;
  }

  if (isWap) {
    out += `var _a = require("${filePath}");`;
    out += `module.exports = _a;`;

    promise = Promise.resolve();
  }

  if (isApp) {
    const rootDir = appDirectory;
    promise = BundleCardAssets(filePath, cardModuleId++)
      .then(({
        cardModuleId
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

        const cardDir = path.join(cardDistRootPath, `card_${cardModuleId}`);

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
              let fParam = {}
              Object.assign(fParam, {
                path: "modal/card_${cardModuleId}/index.html"
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

function BundleCardAssets(filePath, cardModuleId) {
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

  fs.writeFileSync(
    tempSrcFilePath,
    `var _a = require("${filePath}");_a.show()`
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
        cardModuleId
      });
    });
  });
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