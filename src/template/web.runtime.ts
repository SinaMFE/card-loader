// 注意！！！
// 此文件不经过 babel-loader
// 使用 ES5 编写此文件

var maskId = 'card-mask-' + new Date().getTime();
var rootId = 'card-root';
var styleAdded = false;

function addLayer(
  background: string | undefined,
  opacity: number | string | undefined
) {
  if (!background) {
    background = '#000';
  }

  if (!opacity) {
    opacity = 0;
  }

  var mask = document.getElementById(maskId);

  if (mask) return;

  if (!styleAdded) {
    addLayerCss(background, opacity);
    styleAdded = true;
  }

  mask = document.createElement('section');
  mask.id = maskId;

  var root = document.createElement('div');

  root.id = rootId;

  mask.appendChild(root);
  document.body.appendChild(mask);
}

function removeLayer() {
  var mask = document.getElementById(maskId);

  if (mask && mask.parentNode) {
    mask.parentNode.removeChild(mask);
  }
}

function addLayerCss(background, opacity) {
  var head = document.head;
  var style = document.createElement('style');

  style.innerHTML =
    '#' + maskId + ' {getLayerStyle(' + background + ',' + opacity + ')}';

  head && head.appendChild(style);
}

function getLayerStyle(background: string, opacity: number | string) {
  var color = transformColorToRgba(background, opacity);

  return (
    'position: fixed; top: 0; left: 0; background: ' +
    color +
    '; height: 100%; width: 100%; z-index: 999'
  );
}

function transformColorToRgba(color: string, opacity: number | string): string {
  if (typeof color !== 'string') {
    throw new Error('传入色值不符合要求！');
  }

  var colorString = color.split('#')[1];

  if (colorString.length < 2) {
    throw new Error('传入色值不符合要求！');
  }

  var length = colorString.length;
  var arr: string[] = [];
  var count = 0;
  var pace = length / 3;

  for (count = 0; count < length; count = count + pace) {
    arr.push(colorString.slice(count, count + pace));
  }

  var hexCommaString = arr.map(function(color) {
    return parseInt(color, 16);
  });

  return 'rgba(' + hexCommaString + ',' + opacity + ')';
}
