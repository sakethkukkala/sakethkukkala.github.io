(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var BASE_AREA = 1920 * 1080;
  var BASE_NODES = 80;
  var BASE_DIST = 150;
  var MAX_NODES = 220;

  var nodes = [];
  var maxDist = BASE_DIST;
  var logicalW = 0;
  var logicalH = 0;

  function createNode(x, y) {
    return {
      x: x != null ? x : Math.random() * logicalW,
      y: y != null ? y : Math.random() * logicalH,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      ax: Math.random() * 6.28,
      ay: Math.random() * 6.28,
      fx: 0.002 + Math.random() * 0.003,
      fy: 0.002 + Math.random() * 0.003,
      ampX: 0.15 + Math.random() * 0.25,
      ampY: 0.15 + Math.random() * 0.25,
      r: 2 + Math.random() * 1.5,
      pulse: Math.random() * 6.28,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    };
  }

  function redistributeNodes(count) {
    nodes.length = 0;
    for (var i = 0; i < count; i++) {
      nodes.push(createNode());
    }
  }

  function resize() {
    var nextW = window.innerWidth || document.documentElement.clientWidth || 1;
    var nextH = window.innerHeight || document.documentElement.clientHeight || 1;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var prevW = logicalW;
    var prevH = logicalH;
    var sizeChanged = nextW !== logicalW || nextH !== logicalH;

    logicalW = Math.max(nextW, 1);
    logicalH = Math.max(nextH, 1);

    canvas.width = Math.floor(logicalW * dpr);
    canvas.height = Math.floor(logicalH * dpr);
    canvas.style.width = logicalW + "px";
    canvas.style.height = logicalH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var area = logicalW * logicalH;
    var scale = Math.sqrt(area / BASE_AREA);
    var nodeCount = Math.round(BASE_NODES * (area / BASE_AREA));
    nodeCount = Math.max(BASE_NODES, Math.min(MAX_NODES, nodeCount));
    maxDist = Math.max(BASE_DIST, Math.min(260, BASE_DIST * scale));

    // Growing the viewport used to leave old nodes clustered on the left.
    // Rescale existing positions, then top up / trim to the target count.
    if (!prevW || !prevH || nodes.length === 0) {
      redistributeNodes(nodeCount);
      return;
    }

    if (sizeChanged) {
      var sx = logicalW / prevW;
      var sy = logicalH / prevH;
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].x *= sx;
        nodes[i].y *= sy;
      }
    }

    while (nodes.length < nodeCount) {
      nodes.push(createNode());
    }
    if (nodes.length > nodeCount) {
      nodes.length = nodeCount;
    }
  }

  var resizeTimer;
  function scheduleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 50);
  }

  window.addEventListener("resize", scheduleResize);
  window.addEventListener("load", resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleResize);
  }

  resize();
  requestAnimationFrame(function () {
    resize();
  });

  var last = 0;

  function frame(ts) {
    requestAnimationFrame(frame);

    var dt = ts - last;
    if (dt < 16) return;
    last = ts;

    var w = logicalW;
    var h = logicalH;

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.ax += n.fx;
      n.ay += n.fy;
      n.pulse += n.pulseSpeed;

      n.x += n.vx + Math.sin(n.ax) * n.ampX;
      n.y += n.vy + Math.cos(n.ay) * n.ampY;

      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }

    ctx.lineWidth = 1.2;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;

        if (dx > maxDist || dx < -maxDist || dy > maxDist || dy < -maxDist)
          continue;

        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          var opacity = (1 - dist / maxDist) * 0.65;
          ctx.strokeStyle = "rgba(56,189,248," + opacity + ")";
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var glow = 0.6 + Math.sin(n.pulse) * 0.25;
      ctx.fillStyle = "rgba(56,189,248," + glow + ")";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, 6.2832);
      ctx.fill();
    }
  }

  requestAnimationFrame(frame);
})();
