import webpack = require('webpack');
import MemoryFS = require('memory-fs');
import getWebpackConfig from './webpack.config';
import getDependencies from './getDependencies';

type Build = {
  stats: any;
  dependencies: string[];
};

export default function(
  resource: string,
  source: string,
  opts: any = {}
): Promise<Build> {
  const webpackConfig = getWebpackConfig(resource, opts);

  const compiler = webpack(webpackConfig);
  // 使用内存文件系统，构建后通过 stats 获取结果
  compiler.outputFileSystem = new MemoryFS();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);

      const dependencies = getDependencies(source);

      resolve({ stats, dependencies });
    });
  });
}
