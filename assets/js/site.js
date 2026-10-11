/* KernelForge — site animations. Everything here is decoration: the site works without it. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ PCB background
     Random orthogonal / 45° traces with via pads, and light pulses that travel along them. */
  function pcbBackground() {
    var canvas = document.getElementById('pcb');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var layer = document.createElement('canvas');
    var lctx = layer.getContext('2d');
    var GRID = 26, traces = [], w = 0, h = 0, dpr = 1, raf = 0, last = 0;
    var DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      [canvas, layer].forEach(function (c) { c.width = w * dpr; c.height = h * dpr; });
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); lctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      traces = [];
      var count = Math.round((w * h) / 26000);
      for (var i = 0; i < count; i++) {
        var x = Math.round(Math.random() * w / GRID) * GRID;
        var y = Math.round(Math.random() * h / GRID) * GRID;
        var d = Math.floor(Math.random() * 4) * 2;           // start on an orthogonal direction
        var pts = [[x, y]], len = 0, segs = 3 + Math.floor(Math.random() * 4);
        for (var s = 0; s < segs; s++) {
          var steps = 2 + Math.floor(Math.random() * 6);
          x += DIRS[d][0] * GRID * steps; y += DIRS[d][1] * GRID * steps;
          pts.push([x, y]);
          len += Math.hypot(DIRS[d][0], DIRS[d][1]) * GRID * steps;
          d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;      // bend by 45° either way
        }
        traces.push({ pts: pts, len: len, pos: Math.random() * len, speed: 40 + Math.random() * 90,
                      green: Math.random() < 0.3, wait: Math.random() * 4 });
      }

      lctx.clearRect(0, 0, w, h);
      lctx.lineWidth = 1.2; lctx.lineJoin = 'round';
      traces.forEach(function (t) {
        lctx.strokeStyle = t.green ? 'rgba(52,245,164,0.10)' : 'rgba(34,211,238,0.10)';
        lctx.beginPath();
        t.pts.forEach(function (p, i) { if (i) lctx.lineTo(p[0], p[1]); else lctx.moveTo(p[0], p[1]); });
        lctx.stroke();
        [t.pts[0], t.pts[t.pts.length - 1]].forEach(function (p) {
          lctx.beginPath(); lctx.arc(p[0], p[1], 3.2, 0, 6.2832);
          lctx.fillStyle = '#050a14'; lctx.fill();
          lctx.strokeStyle = t.green ? 'rgba(52,245,164,0.28)' : 'rgba(34,211,238,0.28)'; lctx.stroke();
        });
      });
      draw(0);
    }

    function pointAt(t, dist) {
      for (var i = 1; i < t.pts.length; i++) {
        var a = t.pts[i - 1], b = t.pts[i], seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (dist <= seg) { var k = dist / seg; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
        dist -= seg;
      }
      return t.pts[t.pts.length - 1];
    }

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(layer, 0, 0, w, h);
      traces.forEach(function (t) {
        if (t.wait > 0) { t.wait -= dt; return; }
        t.pos += t.speed * dt;
        if (t.pos > t.len) { t.pos = 0; t.wait = 1 + Math.random() * 5; return; }
        var color = t.green ? '52,245,164' : '34,211,238';
        for (var k = 0; k < 6; k++) {                        // head plus a fading tail
          var p = pointAt(t, Math.max(0, t.pos - k * 5));
          ctx.beginPath(); ctx.arc(p[0], p[1], k ? 1.3 : 2.2, 0, 6.2832);
          ctx.fillStyle = 'rgba(' + color + ',' + (0.85 - k * 0.14) + ')'; ctx.fill();
        }
      });
    }

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!reduce && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    var timer;
    window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(build, 200); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    build(); start();
  }

  /* ------------------------------------------------------------------ oscilloscope strip */
  function scopes() {
    Array.prototype.forEach.call(document.querySelectorAll('canvas[data-scope]'), function (canvas) {
      var ctx = canvas.getContext('2d'), t = 0, w = 0, h = 0;
      function size() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth; h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function wave(color, amp, f1, f2, phase, width) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 3) {
          var u = x / w * 6.2832;
          var y = h / 2 + amp * h * (Math.sin(u * f1 + t * phase) * 0.6 + Math.sin(u * f2 - t * phase * 1.7) * 0.25);
          if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = color; ctx.lineWidth = width; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.stroke();
        ctx.shadowBlur = 0;
      }
      function draw() {
        ctx.clearRect(0, 0, w, h);
        wave('rgba(34,211,238,0.9)', 0.36, 3, 11, 1.0, 1.8);
        wave('rgba(255,176,32,0.75)', 0.22, 5, 17, -0.7, 1.4);
      }
      function frame() { t += 0.016; draw(); if (!reduce) requestAnimationFrame(frame); }
      window.addEventListener('resize', function () { size(); draw(); });
      size(); frame();
    });
  }

  /* ------------------------------------------------------------------ typed boot log */
  function terminals() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-type]'), function (term) {
      var lines = Array.prototype.slice.call(term.querySelectorAll('.tl'));
      if (reduce) { lines.forEach(function (l) { l.classList.add('on', 'done'); }); return; }
      var texts = lines.map(function (l) { var s = l.textContent; l.textContent = ''; return s; });
      var i = 0;
      function nextLine() {
        if (i >= lines.length) return;
        var line = lines[i], text = texts[i], c = 0;
        line.classList.add('on');
        (function tick() {
          c += 2; line.textContent = text.slice(0, c);
          if (c < text.length) setTimeout(tick, 14);
          else { line.textContent = text; line.classList.add('done'); i++; setTimeout(nextLine, 170); }
        })();
      }
      setTimeout(nextLine, 400);
    });
  }

  /* ------------------------------------------------------------------ rotating typed words */
  function rotators() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-rotate]'), function (el) {
      var words = el.getAttribute('data-rotate').split('|');
      if (reduce || words.length < 2) return;
      var w = 0, c = words[0].length, erasing = true;
      (function tick() {
        var word = words[w];
        if (erasing) { c--; if (c <= 0) { erasing = false; w = (w + 1) % words.length; } }
        else { c++; if (c >= words[w].length) { erasing = true; el.textContent = words[w]; return setTimeout(tick, 1700); } }
        el.textContent = (erasing ? word : words[w]).slice(0, Math.max(c, 0));
        setTimeout(tick, erasing ? 32 : 62);
      })();
    });
  }

  /* ------------------------------------------------------------------ reveal on scroll */
  function reveals() {
    var items = document.querySelectorAll('.project-card, .track-card, .post-row, .repo-row, .profile, .section-head, .about-teaser, .track-section, .timeline li, .skills dt, .skills dd');
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(items, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------ card tilt and light */
  function tilt() {
    if (reduce || !window.matchMedia('(hover: hover)').matches) return;
    Array.prototype.forEach.call(document.querySelectorAll('.project-card'), function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 5) + 'deg) rotateY(' + ((x - 0.5) * 6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  function init() { pcbBackground(); scopes(); terminals(); rotators(); reveals(); tilt(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
