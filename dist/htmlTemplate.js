module.exports = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <link href="./static/css/index.min.css" rel="stylesheet">
  <script type="text/javascript">
		! function (w, d, m) {
			function r() {
				var t = 100,
					o = 750,
					e = d.documentElement.clientWidth || w.innerWidth,
					n = m.max(m.min(e, 480), 320),
					h = 50;
				320 >= n && (h = m.floor(n / o * t * .99)), n > 320 && 362 >= n && (h = m.floor(n / o * t * 1)), n > 362 && 375 >=
					n && (h = m.floor(n / o * t * 1)), n > 375 && (h = m.floor(n / o * t * .97)), d.querySelector("html").style.fontSize =
					h + "px"
			};
			r();
			w.onresize = function () {
				r()
			}
		}(window, document, Math);
	</script>
</head>
<body>
  <div id="root"></div>
  <script src="./static/js/index.min.js"></script>
</body>
</html>`