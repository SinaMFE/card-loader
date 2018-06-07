const maskId = "card-mask"

const rootId = "card-root"

let styleAdded = false;

function addLayer(background: string, opacity: string) {
  let mask = document.getElementById(maskId);

  if (mask) {
    return
  }

  if (!styleAdded) {
    addLayerCss(background, opacity)
    styleAdded = true;
  }

  mask = document.createElement("section")

  mask.id = maskId;

  const root = document.createElement("div");

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

  const style = document.createElement("style");

  const color = transformColorToRgba(background, opacity);

  style.innerHTML = `#${maskId}{position: fixed; top: 0; left: 0; background: ${color}; height: 100%; width:100%;z-index: 999}`

  head.appendChild(style);
}

function transformColorToRgba(color: string, opacity: number | string): string {

  if(typeof color !== "string") {
    throw new Error("传入色值不符合要求！")
  }

  const colorString = color.split("#")[1];

  if(colorString.length < 2) {
    throw new Error("传入色值不符合要求！")
  }

  const length = colorString.length;

  const arr: string[] = [];

  let count = 0;
  let i

  for(count = 0; count < length ; count = count + 2) {

    arr.push(colorString.slice(count, count + 2));
  }

  const hexCommaString = arr.map((color) => {
    return parseInt(color, 16);
  })

  return `rgba(${hexCommaString},${opacity})`

}