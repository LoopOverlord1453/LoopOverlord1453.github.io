/* KernelForge — site animations. Everything here is decoration: the site works without it. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ PCB background
     Random orthogonal / 45° traces with via pads, and light pulses that travel along them. */
  function pcbBackground() {
    var base = document.getElementById('pcb');
    if (!base || !base.getContext) return;
    // Static traces are drawn once on `base`; only the small moving pulses are redrawn, on `fx`.
    var fx = document.createElement('canvas');
    fx.id = 'pcb-fx'; fx.setAttribute('aria-hidden', 'true');
    base.parentNode.insertBefore(fx, base.nextSibling);
    var bctx = base.getContext('2d'), ctx = fx.getContext('2d');
    var GRID = 26, FRAME = 1000 / 30, traces = [], dirty = [], w = 0, h = 0, raf = 0, last = 0;
    var DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      [base, fx].forEach(function (c) {
        c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
      });
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      traces = []; dirty = [];
      var count = Math.min(48, Math.round((w * h) / 36000));
      for (var i = 0; i < count; i++) {
        var x = Math.round(Math.random() * w / GRID) * GRID;
        var y = Math.round(Math.random() * h / GRID) * GRID;
        var d = Math.floor(Math.random() * 4) * 2;           // start on an orthogonal direction
        var pts = [[x, y]], segs = [], len = 0, n = 3 + Math.floor(Math.random() * 4);
        for (var s = 0; s < n; s++) {
          var steps = 2 + Math.floor(Math.random() * 6);
          var nx = x + DIRS[d][0] * GRID * steps, ny = y + DIRS[d][1] * GRID * steps;
          var l = Math.hypot(nx - x, ny - y);
          segs.push(l); len += l; x = nx; y = ny; pts.push([x, y]);
          d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;      // bend by 45 degrees either way
        }
        traces.push({ pts: pts, segs: segs, len: len, pos: Math.random() * len, speed: 50 + Math.random() * 90,
                      color: Math.random() < 0.3 ? '52,245,164' : '34,211,238', wait: Math.random() * 4 });
      }

      bctx.clearRect(0, 0, w, h);
      bctx.lineWidth = 1.2; bctx.lineJoin = 'round';
      traces.forEach(function (t) {
        bctx.strokeStyle = 'rgba(' + t.color + ',0.10)';
        bctx.beginPath();
        t.pts.forEach(function (p, i) { if (i) bctx.lineTo(p[0], p[1]); else bctx.moveTo(p[0], p[1]); });
        bctx.stroke();
        [t.pts[0], t.pts[t.pts.length - 1]].forEach(function (p) {
          bctx.beginPath(); bctx.arc(p[0], p[1], 3.2, 0, 6.2832);
          bctx.fillStyle = '#050a14'; bctx.fill();
          bctx.strokeStyle = 'rgba(' + t.color + ',0.28)'; bctx.stroke();
        });
      });
      ctx.clearRect(0, 0, w, h);
    }

    function pointAt(t, dist) {
      for (var i = 0; i < t.segs.length; i++) {
        if (dist <= t.segs[i]) {
          var a = t.pts[i], b = t.pts[i + 1], k = dist / t.segs[i];
          return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
        }
        dist -= t.segs[i];
      }
      return t.pts[t.pts.length - 1];
    }

    function draw(dt) {
      // erase only the small squares touched in the previous frame
      for (var i = 0; i < dirty.length; i++) ctx.clearRect(dirty[i][0] - 5, dirty[i][1] - 5, 10, 10);
      dirty.length = 0;
      for (var j = 0; j < traces.length; j++) {
        var t = traces[j];
        if (t.wait > 0) { t.wait -= dt; continue; }
        t.pos += t.speed * dt;
        if (t.pos > t.len) { t.pos = 0; t.wait = 1 + Math.random() * 5; continue; }
        for (var k = 0; k < 4; k++) {                        // head plus a fading tail
          var p = pointAt(t, Math.max(0, t.pos - k * 7));
          ctx.fillStyle = 'rgba(' + t.color + ',' + (0.85 - k * 0.2) + ')';
          ctx.beginPath(); ctx.arc(p[0], p[1], k ? 1.3 : 2.2, 0, 6.2832); ctx.fill();
          dirty.push(p);
        }
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME) return;                        // 30 frames a second is enough here
      var dt = Math.min((now - last) / 1000, 0.1); last = now;
      draw(dt);
    }
    function start() { if (!reduce && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    var timer;
    window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(build, 250); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    build(); start();
  }

  /* ------------------------------------------------------------------ oscilloscope strip */
  function scopes() {
    Array.prototype.forEach.call(document.querySelectorAll('canvas[data-scope]'), function (canvas) {
      var ctx = canvas.getContext('2d'), t = 0, w = 0, h = 0, visible = true, raf = 0, last = 0;
      function size() {
        var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = canvas.clientWidth; h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function path(amp, f1, f2, phase) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 6) {
          var u = x / w * 6.2832;
          var y = h / 2 + amp * h * (Math.sin(u * f1 + t * phase) * 0.6 + Math.sin(u * f2 - t * phase * 1.7) * 0.25);
          if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
      }
      function wave(rgb, amp, f1, f2, phase, width) {
        path(amp, f1, f2, phase);                            // a wide faint stroke gives the glow without shadowBlur
        ctx.strokeStyle = 'rgba(' + rgb + ',0.18)'; ctx.lineWidth = width + 5; ctx.stroke();
        ctx.strokeStyle = 'rgba(' + rgb + ',0.9)'; ctx.lineWidth = width; ctx.stroke();
      }
      function draw() {
        ctx.clearRect(0, 0, w, h);
        wave('34,211,238', 0.36, 3, 11, 1.0, 1.8);
        wave('255,176,32', 0.22, 5, 17, -0.7, 1.4);
      }
      function frame(now) {
        raf = requestAnimationFrame(frame);
        if (now - last < 1000 / 30) return;
        last = now; t += 0.033; draw();
      }
      function update() {
        var run = visible && !document.hidden && !reduce;
        if (run && !raf) raf = requestAnimationFrame(frame);
        if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { visible = e[0].isIntersecting; update(); }).observe(canvas);
      }
      document.addEventListener('visibilitychange', update);
      window.addEventListener('resize', function () { size(); draw(); });
      size(); draw(); update();
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
      var pending = 0, ev = null;
      function apply() {
        pending = 0;
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
        card.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * 5) + 'deg) rotateY(' + ((x - 0.5) * 6) + 'deg) translateY(-4px)';
      }
      card.addEventListener('mousemove', function (e) { ev = e; if (!pending) pending = requestAnimationFrame(apply); });
      card.addEventListener('mouseleave', function () { cancelAnimationFrame(pending); pending = 0; card.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------ pause off-screen animations */
  function pauseOffscreen() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('paused', !e.isIntersecting); });
    }, { rootMargin: '80px' });
    Array.prototype.forEach.call(document.querySelectorAll('.picon, .ticker, .hero-terminal'), function (el) { io.observe(el); });
  }

  function init() { pcbBackground(); scopes(); terminals(); rotators(); reveals(); tilt(); pauseOffscreen(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
