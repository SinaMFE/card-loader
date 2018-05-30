import { stringifyRequest } from 'loader-utils';

export default function(source) {
  return `
    import 'webpack-marauder/webpack/polyfills'
    import card from ${stringifyRequest(this, this.resourcePath)}
    import appSNC from '@mfelibs/universal-framework'
    import '@mfelibs/universal-framework/src/libs/apis/closeWindow'
    import '@mfelibs/universal-framework/src/libs/apis/onRendered'

    function closeModal() {
      appSNC.closeWindow()
    }

    appSNC.ready(function(data) {
      card(data, {closeModal: closeModal}, "root").show()
      appSNC.onRendered()
    })
  `
}
