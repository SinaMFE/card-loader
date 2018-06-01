import traverse from '@babel/traverse'
import { parse } from '@babel/parser'

export default function(code) {
  const ast = parse(code)
  const deps = []

  traverse(ast, {
    enter(path) {
      if (path.isIdentifier({ name: "n" })) {
        path.node.name = "x";
      }
    }
  });

  return deps
}
