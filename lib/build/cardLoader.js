"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var loader_utils_1 = require("loader-utils");
function default_1(ource) {
    return "\n    import 'webpack-marauder/webpack/polyfills'\n    import appSNC from '@mfelibs/universal-framework'\n    import '@mfelibs/universal-framework/src/libs/apis/closeWindow'\n    import '@mfelibs/universal-framework/src/libs/apis/onRendered'\n    import card from " + loader_utils_1.stringifyRequest(this, this.resourcePath) + "\n\n    function closeModal() {\n      appSNC.closeWindow()\n    }\n\n    appSNC.ready(function(data) {\n      data.message = data.message || {}\n\n      try {\n        card(data, { closeModal: closeModal }, 'root').show()\n        appSNC.onRendered()\n      } catch(e) {\n        console.error('[card error]', e)\n      }\n    })\n  ";
}
exports.default = default_1;
