"use strict";

exports.__esModule = true;
exports.default = _default;

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _parser = require("@babel/parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(code) {
  const ast = (0, _parser.parse)(code);
  const deps = [];
  (0, _traverse.default)(ast, {
    enter(path) {
      if (path.isIdentifier({
        name: "n"
      })) {
        path.node.name = "x";
      }
    }

  });
  return deps;
}