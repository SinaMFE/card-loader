import webpack = require('webpack');
import MemoryFS = require('memory-fs');
import getContext = require('@mara/x/config/getContext');
import paths = require('@mara/x/config/paths');
import getWebpackConfig from './webpack.config';
import getDependencies from './getDependencies';
const { version } = require(paths.packageJson);

type Build = {
  assets: Map<string, string>;
  dependencies: string[];
};

export default async function(
  resource: string,
  source: string,
  opts: any = {}
): Promise<Build> {
  const context = await getContext({
    version,
    view: 'index'
  });
  const webpackConfig = getWebpackConfig(context, resource, opts);
  const compiler = webpack(webpackConfig);
  const assets = new Map();

  // 获取资源构建结果
  (compiler.hooks as any).assetEmitted.tap('CardLoader', (file, content) => {
    assets.set(file, content);
  });

  // 使用内存文件系统，减少 IO
  compiler.outputFileSystem = new MemoryFS();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);

      // const dependencies = getDependencies(source);
      const dependencies = [];

      resolve({ assets, dependencies });
    });
  });
}

// export function watchBuild(
//   resource: string,
//   source: string,
//   opts: any = {},
//   cb
// ) {
//   const webpackConfig = getWebpackConfig(resource, opts);
//   const compiler = webpack(webpackConfig);

//   // 使用内存文件系统，构建后通过 stats 获取结果
//   compiler.outputFileSystem = new MemoryFS();

//   return compiler.watch({}, (err, stats) => {
//     if (err) return cb(err);

//     cb(err, stats);
//   });
// }
