"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var traverse_1 = require("@babel/traverse");
var parser_1 = require("@babel/parser");
function default_1(code) {
    var ast = parser_1.parse(code);
    var deps = [];
    traverse_1.default(ast, {
        enter: function (path) {
            if (path.isIdentifier({ name: "n" })) {
                path.node.name = "x";
            }
        }
    });
    return deps;
}
exports.default = default_1;
