import { stringifyRequest } from 'loader-utils';

import { loader } from 'webpack';

export default function(this: loader.LoaderContext, source: Buffer) {
  return `
    import 'webpack-marauder/webpack/polyfills'
    import appSNC from '@mfelibs/universal-framework'
    import '@mfelibs/universal-framework/src/libs/apis/closeWindow'
    import '@mfelibs/universal-framework/src/libs/apis/onRendered'
    import card from ${stringifyRequest(this, this.resourcePath)}

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
