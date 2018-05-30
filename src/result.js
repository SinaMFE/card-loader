import fs from 'fs-extra';
import path from 'path';

const webRuntime = fs.readFileSync(path.join(__dirname, './template/web.runtime.js'));

function wap(filePath) {
  return `import card from ${filePath};

    ${webRuntime};

    export default {
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
        param.path = modalPath

        if(onlinePath.indexOf('http') > -1) {
          param.onlinePath = onlinePath
        }

        appSNC.showWVModal(param);
      }
    }`;
}

export default { wap, app }
