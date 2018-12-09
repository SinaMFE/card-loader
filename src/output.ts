import { transES5 } from './build/util';

function wap(filePath: string, opts?: any): string {
  // loader 自身返回的代码需要确保为 es5
  return transES5(
    `import card from ${filePath};
    import getLoader from 'card-loader/lib/template/web.runtime'

    const cardLoader = getLoader(card)

    export default cardLoader`
  );
}

function app(cardName: string, opts: any = {}): string {
  // loader 自身返回的代码需要确保为 es5
  return transES5(
    `import getLoader from 'card-loader/lib/template/app.runtime'

    const cardLoader = getLoader('modal/${cardName}/index.html')

    export default cardLoader`
  );
}

export default { wap, app };
