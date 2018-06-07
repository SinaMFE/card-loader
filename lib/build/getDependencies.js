import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
export default function (code) {
    var ast = parse(code);
    var deps = [];
    traverse(ast, {
        enter: function (path) {
            if (path.isIdentifier({ name: "n" })) {
                path.node.name = "x";
            }
        }
    });
    return deps;
}
