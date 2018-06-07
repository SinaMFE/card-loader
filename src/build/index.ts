import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import getWebpackConfig from './webpack.config';

export default function(resource: string): Promise<webpack.Stats> {
  const webpackConfig = getWebpackConfig(resource);

  const compiler = webpack(webpackConfig);
  // 使用内存文件系统，构建后通过 stats 获取结果
  compiler.outputFileSystem = new MemoryFS();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);

      resolve(stats);
    });
  });
}
