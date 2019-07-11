import { getOptions, stringifyRequest } from 'loader-utils';
import { transES5 } from './util';

import { loader } from 'webpack';

export default function(this: loader.LoaderContext, source: Buffer) {
  const options = getOptions(this) || {};

  // loader 自身返回的代码需要确保为 es5
  return transES5(`
    import '@mara/x/webpack/polyfills'
    import card from ${stringifyRequest(this, this.resourcePath)}
    import * as SNC from 'card-loader/lib/microSNC'

    const closeModal = () => {
      SNC.closeWindow()
    }

    SNC.ready(data => {
      data = data || {}
      console.log('[CARD_READY]', data)
      data.message = data.message || {}

      try {
        card(data, { closeModal: closeModal }, '#root').show()
        SNC.onRendered()
        console.log('[CARD_RENDER]')
      } catch(e) {
        // dev 模式在控制台保留错误信息
        if(location.origin.indexOf('http') > -1) {
          SNC.onRendered()
          // @TODO 无内容渲染时，给出关闭点击区域
        }

        console.error('[CARD_SHOW]', e)
      }
    })
  `);
}
