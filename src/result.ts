import { transform } from '@babel/core';
import { readFileSync } from 'fs-extra';
import { join } from 'path';

const babelOpt = {
  babelrc: false,
  presets: [
    [
      require('@babel/preset-env').default,
      {
        useBuiltIns: false,
        // Do not transform modules to CJS
        modules: false,
        // Exclude transforms that make all code slower
        exclude: ['transform-typeof-symbol']
      }
    ]
  ]
};

function transES5(code) {
  return transform(code, babelOpt).code;
}

function wap(filePath: string, opts?: any): string {
  const webRuntime = readFileSync(join(__dirname, './template/web.runtime.js'));

  return transES5(
    `import card from ${filePath};

    ${webRuntime};

    export default {
      show(options) {
        if (!options || typeof options !== 'object') {
          throw new Error('参数不存在或非对象！')
        }

        const display = options.display || {
          opacity: 0,
          backgroundColor: '#000'
        }

        addLayer(display.backgroundColor, display.opacity)

        card({ message: options.message }, {
          closeModal(cb) {
            typeof cb == 'function' && cb()

            removeLayer()
          }
        }, rootId).show()
      }
    };`
  );
}

function app(cardName: string, opts: any = {}): string {
  return transES5(
    `if(!window.__SNC__) throw new Error('请优先引入 app snc')

    const appSNC = window.__SNC__.instance

    if(!appSNC.showWVModal) {
      const cardApi = {
        showWVModal(ctx) {
          ctx.showWVModal = ctx.definedMethod('hb.core.showWVModal', {
            path: '',
            display: {
              backgroundColor: '#000000',
              opacity: 0
            }
          });
        }
      }

      // 兼容 mountApi 参数差异
      appSNC.mountApi(cardApi, cardApi)
    }

    const modalPath = 'modal/${cardName}/index.html'
    let onlinePath = location.origin + '/' + modalPath

    if(process.env.PUBLIC_URL.indexOf('http') > -1) {
      // @FIXME remove end slash
      onlinePath = process.env.PUBLIC_URL + modalPath
    }

    export default {
      show(options) {
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
    }`
  );
}

export default { wap, app };
