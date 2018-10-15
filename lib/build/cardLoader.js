"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = require("loader-utils");
function default_1(source) {
    const options = loader_utils_1.getOptions(this) || {};
    const SNC = `
    import SDK from '@mfelibs/universal-framework'
    import '@mfelibs/universal-framework/src/libs/apis/closeWindow'
    import '@mfelibs/universal-framework/src/libs/apis/onRendered'
   `;
    const BiuSdk = `import SDK from '@mfelibs/biubiu-sdk'`;
    return `
    import 'webpack-marauder/webpack/polyfills'
    ${options.sdk == 'biubiu' ? BiuSdk : SNC}
    import card from ${loader_utils_1.stringifyRequest(this, this.resourcePath)}

    function closeModal() {
      SDK.closeWindow()
    }

    SDK.ready(function(data) {
      console.log('[CARD_READY]', data)
      data.message = data.message || {}

      try {
        card(data, { closeModal: closeModal }, '#root').show()
        SDK.onRendered()
        console.log('[CARD_RENDER]')
      } catch(e) {
        // dev 模式在控制台保留错误信息
        if(location.origin.indexOf('http') > -1) {
          SDK.onRendered()
          // @TODO 无内容渲染时，给出关闭点击区域
        }

        console.error('[CARD_SHOW]', e)
      }
    })
  `;
}
exports.default = default_1;
