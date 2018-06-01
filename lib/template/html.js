"use strict";

exports.__esModule = true;
exports.default = void 0;
var _default = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
  <meta name="author" content="sina_mobile">
  <meta name="format-detection" content="telephone=no">
  <title>Document</title>
  <style>
    body {
      margin: 0;
    }
  </style>
  <link href="./static/css/main.min.css" rel="stylesheet">
  <script type="text/javascript">
    ! function (w, d, m) {
      function r() {
        var t = 100,
          o = 750,
          e = d.documentElement.clientWidth || w.innerWidth || w.__appWidth,
          n = m.max(m.min(e, 480), 320),
          h = 50;
        320 >= n && (h = m.floor(n / o * t * .99)), n > 320 && 362 >= n && (h = m.floor(n / o * t * 1)), n > 362 && 375 >=
          n && (h = m.floor(n / o * t * 1)), n > 375 && (h = m.floor(n / o * t * .97)), d.querySelector("html").style.fontSize =
          h + "px"
      };
      r();
      w.onresize = r
    }(window, document, Math);
  </script>
</head>
<body>
  <div id="root"></div>
  <script src="./static/js/main.min.js"></script>
</body>
</html>`;
exports.default = _default;