"use strict";

exports.__esModule = true;
exports.default = _default;

var _loaderUtils = require("loader-utils");

function _default(source) {
  return `
    import 'webpack-marauder/webpack/polyfills'
    import card from ${(0, _loaderUtils.stringifyRequest)(this, this.resourcePath)}
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
  `;
}