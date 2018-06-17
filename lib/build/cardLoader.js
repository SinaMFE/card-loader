"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = require("loader-utils");
function default_1(source) {
    return `
    import 'webpack-marauder/webpack/polyfills'
    import appSNC from '@mfelibs/universal-framework'
    import '@mfelibs/universal-framework/src/libs/apis/closeWindow'
    import '@mfelibs/universal-framework/src/libs/apis/onRendered'
    import card from ${loader_utils_1.stringifyRequest(this, this.resourcePath)}

    function closeModal() {
      appSNC.closeWindow()
    }

    appSNC.ready(function(data) {
      console.log('[CARD_READY]', data)
      data.message = data.message || {}

      try {
        card(data, { closeModal: closeModal }, 'root').show()
        appSNC.onRendered()
        console.log('[CARD_RENDER]')
      } catch(e) {
        // dev 模式在控制台保留错误信息
        if(location.origin.indexOf('http') > -1) {
          appSNC.onRendered()
          // @TODO 无内容渲染时，给出关闭点击区域
        }

        console.error('[CARD_SHOW]', e)
      }
    })
  `;
}
exports.default = default_1;
