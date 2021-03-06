import { showWVModal } from '../microSNC';

export default modalPath => {
  let onlinePath = location.origin + '/' + modalPath;

  if (!!process.env.PUBLIC_URL && process.env.PUBLIC_URL.indexOf('http') > -1) {
    // @FIXME remove end slash
    onlinePath = process.env.PUBLIC_URL + modalPath;
  }

  return {
    show(options) {
      if (!options || typeof options !== 'object') {
        throw new Error('show 方法参数不存在或非对象！');
      }

      // displayTime 必须为 String，兼容安卓
      if (options.display && typeof options.display.displayTime === 'number') {
        options.display.displayTime += '';
      }

      options.message = options.message || {};

      // 添加私有属性，标识 card 页面类型
      options.message['__PAGE_TYPE__'] = 'card';

      options.path = modalPath;

      // debug 调试用，在线链接
      if (onlinePath.indexOf('http') > -1) {
        options.onlinePath = onlinePath;
      }

      return showWVModal(options);
    }
  };
};
