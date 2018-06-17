const maskId = 'card-mask-' + new Date().getTime();

const rootId = 'card-root';

let styleAdded = false;

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

  let mask = document.getElementById(maskId);

  if (mask) {
    return;
  }

  if (!styleAdded) {
    addLayerCss(background, opacity);
    styleAdded = true;
  }

  mask = document.createElement('section');

  mask.id = maskId;

  const root = document.createElement('div');

  root.id = rootId;

  mask.appendChild(root);

  document.body.appendChild(mask);
}

function removeLayer() {
  let mask = document.getElementById(maskId);

  if (mask && mask.parentNode) {
    mask.parentNode.removeChild(mask);
  }
}

function addLayerCss(background, opacity) {
  const head = document.head;

  const style = document.createElement('style');

  style.innerHTML = `#${maskId}{${getLayerStyle(background, opacity)}`;

  head.appendChild(style);
}

function getLayerStyle(background: string, opacity: number | string) {
  const color = transformColorToRgba(background, opacity);

  return `position: fixed; top: 0; left: 0; background: ${color}; height: 100%; width:100%;z-index: 999`;
}

function transformColorToRgba(color: string, opacity: number | string): string {
  if (typeof color !== 'string') {
    throw new Error('传入色值不符合要求！');
  }

  const colorString = color.split('#')[1];

  if (colorString.length < 2) {
    throw new Error('传入色值不符合要求！');
  }

  const length = colorString.length;

  const arr: string[] = [];

  let count = 0;
  const pace = length / 3;

  for (count = 0; count < length; count = count + pace) {
    arr.push(colorString.slice(count, count + pace));
  }

  const hexCommaString = arr.map(color => {
    return parseInt(color, 16);
  });

  return `rgba(${hexCommaString},${opacity})`;
}
