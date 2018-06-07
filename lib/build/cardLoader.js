import { stringifyRequest } from 'loader-utils';
export default function (source) {
    return "\n    import 'webpack-marauder/webpack/polyfills'\n    import appSNC from '@mfelibs/universal-framework'\n    import '@mfelibs/universal-framework/src/libs/apis/closeWindow'\n    import '@mfelibs/universal-framework/src/libs/apis/onRendered'\n    import card from " + stringifyRequest(this, this.resourcePath) + "\n\n    function closeModal() {\n      appSNC.closeWindow()\n    }\n\n    appSNC.ready(function(data) {\n      data.message = data.message || {}\n\n      try {\n        card(data, { closeModal: closeModal }, 'root').show()\n        appSNC.onRendered()\n      } catch(e) {\n        console.error('[card error]', e)\n      }\n    })\n  ";
}
