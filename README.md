本说明主要针对浮层的开发

## 安装和使用

安装：

```shell
yarn add card-loader -D
```

使用 loader：

```javascript
// 引入路径为./card/index.js的浮层
const card = require("card-loader!./card/index.js");

const param = {
  display: {
    opacity: 0.5
  },
  message: {},
  success(data) {
    console.log("success", data)
  },
  error(opt, errMessage) {
    console.log("err", errMessage, opt);
  }
}

// 参数的配置path字段外遵循 http://wiki.intra.sina.com.cn/pages/viewpage.action?pageId=166466748
card.show(param)
```

## 浮层模块的开发

先看一个最简单的例子：

```javascript
//./card/index.js文件（浮层入口）

/**
 * 模块暴露一个名称为card的函数，接收三个参数
 * 使用函数声明的原因是 在抹平差异同时需要传递参数给业务人员
 * 函数会在hybrid的ready生命周期后执行，并注入参数
 * 
 * @export
 * @param {object} data 从主view传递过来的参数(实际为ready方法触发传递的参数)
 * @param {object} {
 *   closeModal
 * } 注入的变量和方法，目前只有closeModal方法，调用则关闭当前浮层
 * @param {string} container 渲染的容器id
 * @returns {object} {show: function} 
 * 函数返回对象中包含键为show的方法，内部执行浮层渲染、显示，业务人员需要实现此方法
 */
export default function(data, inject, containerId) {

  // 处理数据
  output = processData(data)

  return {
    show() {
      renderModal(output, inject, containerId)
    }
  };
}

function renderModal(data, inject, containerId) {

  // use data
  console.log(data)

  const container = document.getElementById(containerId);

  const button = document.createElement("button");

  const destroy = () => {...}

  button.addEventListener("click", () => {

    // closeModal为注入的关闭弹层方法
    // 可选：这里可以传递一个destroy方法，该方法由业务实现，主要目的是在web环境中，进行垃圾回收（⌚事件销毁，实例化对象释放等）
    inject.closeModal(destroy)
  });

  container.appendChild(button);
}

```

如注释，模块只规定通过export default输出一个方法，该方法接收三个参数，并且返回一个含有show方法的对象。

show方法完成模块渲染。

>注意：
>当使用`card-loader`加载代码时，客户端的浮层代码会以一个单独的页面存在。
>换句话说在编译页面同时会以loader为入口文件执行webpack构建弹层页面。
>因此弹层使用的各种资源文件（包含但不限于js、css）需要直接或间接的被浮层入口文件引入

### `manifest.json`文件

由于需要对每个浮层进行唯一标示，需要在浮层入口代码的同级目录创建一个`manifest.json`文件：

```json
{
  "name": "card-name"
}
```
如果没有此文件，编译时会报错。