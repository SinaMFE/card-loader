import { readFileSync } from 'fs-extra';
import { join } from 'path';

const webRuntime = readFileSync(join(__dirname, './template/web.runtime.js'));

function wap(filePath: string): string {
  return `import card from ${filePath};

    ${webRuntime};

    export default {
      show(options) {
        if (!options || typeof options !== 'object') {
          throw new Error('参数不存在或非对象！')
        }

        var data = options.data || {}
        var display = options.display
        if (!display || typeof display !== 'object') {
          display = {
            opacity: 0,
            backgroundColor: '#000'
          }
        }
        addLayer(display.backgroundColor, display.opacity)

        data = {message: param.message}

        card(data, {
          closeModal: function(cb) {
            if (cb && typeof cb == "function") {
              cb && cb()
            }
            removeLayer()
          }
        }, rootId).show()
      }
    };`;
}

function app(cardName: string): string {
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
      show: function(options) {
        if (!options || typeof options !== 'object') {
          throw new Error('show 方法参数不存在或非对象！')
        }

        // displayTime 必须为 String，兼容安卓
        if(options.display && typeof options.display.displayTime === 'number') {
          options.display.displayTime += ''
        }

        options.path = modalPath

        // debug 调试用，在线链接
        if(onlinePath.indexOf('http') > -1) {
          options.onlinePath = onlinePath
        }

        return appSNC.showWVModal(options)
      }
    }`;
}

export default { wap, app };
