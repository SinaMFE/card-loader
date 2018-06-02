"use strict";

exports.__esModule = true;
exports.default = void 0;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const webRuntime = _fsExtra.default.readFileSync(_path.default.join(__dirname, './template/web.runtime.js'));

function wap(filePath) {
  return `import card from ${filePath};

    ${webRuntime};

    export default {
      show(param) {
        if (!param || typeof param !== 'object') {
          throw new Error('参数不存在或非对象！')
        }

        var data = param.data || {}
        var display = param.display
        if (!display || typeof display !== 'object') {
          display = {
            opacity: 0,
            backgroundColor: '#000'
          }
        }
        addLayer(display.backgroundColor, display.opacity)

        card(data, {
          closeModal: function(cb) {
            cb && cb()
            removeLayer()
          }
        }, rootId).show()
      }
    };`;
}

function app(cardName) {
  return `
    import appSNC from '@mfelibs/universal-framework';
    import showWVModal from '@mfelibs/client-jsbridge/src/sdk/appApis/showWVModal';

    appSNC.mountApi('appApis', {
      showWVModal
    });

    var modalPath = 'modal/${cardName}/index.html'
    var onlinePath = location.origin + '/' + modalPath

    if(process.env.PUBLIC_URL.indexOf('http') > -1) {
      // @FIXME remove end slash
      onlinePath = process.env.PUBLIC_URL + modalPath
    }

    export default {
      show: function(param) {
        if (!param || typeof param !== 'object') {
          throw new Error("show方法参数不存在或非对象！")
        }

        // displayTime 必须为 String，兼容安卓
        if(param.display && typeof param.display.displayTime === 'number') {
          param.display.displayTime += ''
        }

        param.path = modalPath

        // debug 调试用
        if(onlinePath.indexOf('http') > -1) {
          param.onlinePath = onlinePath
        }

        appSNC.showWVModal(param);
      }
    }`;
}

var _default = {
  wap,
  app
};
exports.default = _default;