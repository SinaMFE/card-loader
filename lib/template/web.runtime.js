"use strict";
var maskId = "card-mask";
var rootId = "card-root";
var styleAdded = false;
function addLayer(background, opacity) {
    var mask = document.getElementById(maskId);
    if (mask) {
        return;
    }
    if (!styleAdded) {
        addLayerCss(background, opacity);
        styleAdded = true;
    }
    mask = document.createElement("section");
    mask.id = maskId;
    var root = document.createElement("div");
    root.id = rootId;
    mask.appendChild(root);
    document.body.appendChild(mask);
}
function removeLayer() {
    var mask = document.getElementById(maskId);
    if (mask) {
        mask.parentNode.removeChild(mask);
    }
}
function addLayerCss(background, opacity) {
    var head = document.head;
    var style = document.createElement("style");
    style.innerHTML = "#" + maskId + "{position: fixed; top: 0; left: 0; background: " + background + "; opacity: " + opacity + "; height: 100%; width:100%;z-index: 999}";
    head.appendChild(style);
}
