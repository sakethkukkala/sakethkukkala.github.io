(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var NODE_COUNT = 80;
  var MAX_DIST = 150;
  var nodes = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  resize();

  for (var i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
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
    });
  }

  var last = 0;

  function frame(ts) {
    requestAnimationFrame(frame);

    var dt = ts - last;
    if (dt < 16) return;
    last = ts;

    var w = canvas.width;
    var h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < NODE_COUNT; i++) {
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
    for (var i = 0; i < NODE_COUNT; i++) {
      for (var j = i + 1; j < NODE_COUNT; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;

        if (dx > MAX_DIST || dx < -MAX_DIST || dy > MAX_DIST || dy < -MAX_DIST)
          continue;

        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          var opacity = (1 - dist / MAX_DIST) * 0.65;
          ctx.strokeStyle = "rgba(56,189,248," + opacity + ")";
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    for (var i = 0; i < NODE_COUNT; i++) {
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
