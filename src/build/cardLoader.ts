import { stringifyRequest } from 'loader-utils';

export default function(source: Buffer) {
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
      data.message = data.message || {}

      try {
        card(data, { closeModal: closeModal }, 'root').show()
        appSNC.onRendered()
      } catch(e) {
        console.error('[card error]', e)
      }
    })
  `
}
