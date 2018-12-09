const maskId = `card-mask-${Date.now()}`;
const rootId = 'card-root';
let styleAdded = false;

function showCard({ backgroundColor = '#000', opacity = 0, displayTime = 0 }) {
  let mask = document.getElementById(maskId);

  if (mask) return;

  if (!styleAdded) {
    addLayerCss(backgroundColor, opacity);
    styleAdded = true;
  }

  mask = document.createElement('section');
  mask.id = maskId;

  const rootEl = document.createElement('div');

  rootEl.id = rootId;

  mask.appendChild(rootEl);
  document.body.appendChild(mask);

  if (displayTime > 0) {
    setTimeout(removeCard, displayTime * 1000);
  }
}

function removeCard() {
  const mask = document.getElementById(maskId);

  if (mask && mask.parentNode) {
    mask.parentNode.removeChild(mask);
  }
}

function addLayerCss(background, opacity) {
  const head = document.head;
  const style = document.createElement('style');

  style.innerHTML = `#${maskId} {${getLayerStyle(background, opacity)}}`;

  head && head.appendChild(style);
}

function getLayerStyle(background: string, opacity: number | string) {
  const color = transformColorToRgba(background, opacity);

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

  const colorString = color.split('#')[1];

  if (colorString.length < 2) {
    throw new Error('传入色值不符合要求！');
  }

  const length = colorString.length;
  const pace = length / 3;
  let arr: string[] = [];

  for (let count = 0; count < length; count += pace) {
    arr.push(colorString.slice(count, count + pace));
  }

  const hexCommaString = arr.map(color => parseInt(color, 16));

  return `rgba(${hexCommaString}, ${opacity})`;
}

export default cardModal => {
  return {
    show(options) {
      if (!options || typeof options !== 'object') {
        throw new Error('参数不存在或非对象！');
      }

      const display = options.display || {
        opacity: 0,
        backgroundColor: '#000',
        displayTime: 0
      };

      showCard(display);

      cardModal(
        { message: options.message },
        {
          closeModal(cb) {
            typeof cb == 'function' && cb();

            removeCard();
          }
        },
        '#' + rootId
      ).show();
    }
  };
};
