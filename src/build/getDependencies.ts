import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

export default function(code: string) {
  const ast = parse(code, {
    sourceType: 'module'
  });
  const dependencies: string[] = [];

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    }
  });

  return dependencies.filter(path => path.indexOf('.') == 0);
}
