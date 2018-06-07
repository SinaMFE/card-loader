"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var webRuntime = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, './template/web.runtime.js'));
function wap(filePath) {
    return "import card from " + filePath + ";\n\n    " + webRuntime + ";\n\n    export default {\n      show(param) {\n        if (!param || typeof param !== 'object') {\n          throw new Error('\u53C2\u6570\u4E0D\u5B58\u5728\u6216\u975E\u5BF9\u8C61\uFF01')\n        }\n\n        var data = param.data || {}\n        var display = param.display\n        if (!display || typeof display !== 'object') {\n          display = {\n            opacity: 0,\n            backgroundColor: '#000'\n          }\n        }\n        addLayer(display.backgroundColor, display.opacity)\n\n        card(data, {\n          closeModal: function(cb) {\n            cb && cb()\n            removeLayer()\n          }\n        }, rootId).show()\n      }\n    };";
}
function app(cardName) {
    return "\n    import appSNC from '@mfelibs/universal-framework';\n    import showWVModal from '@mfelibs/client-jsbridge/src/sdk/appApis/showWVModal';\n\n    appSNC.mountApi('appApis', {\n      showWVModal\n    });\n\n    var modalPath = 'modal/" + cardName + "/index.html'\n    var onlinePath = location.origin + '/' + modalPath\n\n    if(process.env.PUBLIC_URL.indexOf('http') > -1) {\n      // @FIXME remove end slash\n      onlinePath = process.env.PUBLIC_URL + modalPath\n    }\n\n    export default {\n      show: function(param) {\n        if (!param || typeof param !== 'object') {\n          throw new Error(\"show\u65B9\u6CD5\u53C2\u6570\u4E0D\u5B58\u5728\u6216\u975E\u5BF9\u8C61\uFF01\")\n        }\n\n        // displayTime \u5FC5\u987B\u4E3A String\uFF0C\u517C\u5BB9\u5B89\u5353\n        if(param.display && typeof param.display.displayTime === 'number') {\n          param.display.displayTime += ''\n        }\n\n        param.path = modalPath\n\n        // debug \u8C03\u8BD5\u7528\n        if(onlinePath.indexOf('http') > -1) {\n          param.onlinePath = onlinePath\n        }\n\n        appSNC.showWVModal(param);\n      }\n    }";
}
exports.default = { wap: wap, app: app };
