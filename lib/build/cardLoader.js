"use strict";

exports.__esModule = true;
exports.default = _default;

var _loaderUtils = require("loader-utils");

function _default(source) {
  return `
    import 'webpack-marauder/webpack/polyfills'
    import appSNC from '@mfelibs/universal-framework'
    import '@mfelibs/universal-framework/src/libs/apis/closeWindow'
    import '@mfelibs/universal-framework/src/libs/apis/onRendered'
    import card from ${(0, _loaderUtils.stringifyRequest)(this, this.resourcePath)}

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
  `;
}