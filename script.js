/* ============================================================
   Year + clock
   ============================================================ */
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

var clockEl = document.getElementById('clock');
if (clockEl) {
  function tickClock() {
    var d = new Date();
    var ist = new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
    var hh = String(ist.getHours()).padStart(2, '0');
    var mm = String(ist.getMinutes()).padStart(2, '0');
    clockEl.textContent = hh + ':' + mm;
  }
  tickClock();
  setInterval(tickClock, 30000);
}

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ============================================================
   Voice orb — canvas circular spectrum
   ============================================================ */
(function () {
  var canvas = document.getElementById('orb');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var mouseNX = 0, mouseNY = 0, easingNX = 0, easingNY = 0;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = rect.width;
    H = rect.height;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    easingNX += (mouseNX - easingNX) * 0.06;
    easingNY += (mouseNY - easingNY) * 0.06;

    var cx = W / 2 + easingNX * 24;
    var cy = H / 2 + easingNY * 24;
    var bars = 128;
    var radius = Math.min(W, H) * 0.28;

    for (var i = 0; i < bars; i++) {
      var angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      var noise =
        Math.sin(t * 0.0009 + i * 0.35) * 0.5 +
        Math.sin(t * 0.0014 + i * 0.61) * 0.3 +
        Math.sin(t * 0.0006 + i * 1.13) * 0.2;
      var amp = Math.abs(noise);
      var barLen = 10 + amp * 54;

      var x1 = cx + Math.cos(angle) * radius;
      var y1 = cy + Math.sin(angle) * radius;
      var x2 = cx + Math.cos(angle) * (radius + barLen);
      var y2 = cy + Math.sin(angle) * (radius + barLen);

      var alpha = 0.12 + amp * 0.55;
      ctx.strokeStyle = 'rgba(178, 165, 255, ' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(139, 124, 246, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(139, 124, 246, 0.06)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 64, 0, Math.PI * 2);
    ctx.stroke();

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', function (e) {
    mouseNX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', resize);

  resize();
  if (reduceMotion) {
    draw(0);
  } else {
    requestAnimationFrame(draw);
  }
})();

/* ============================================================
   Custom cursor
   ============================================================ */
(function () {
  if (!hasFinePointer || reduceMotion) return;
  var cursor = document.getElementById('cursor');
  if (!cursor) return;

  var x = window.innerWidth / 2, y = window.innerHeight / 2;
  var tx = x, ty = y;

  document.body.classList.add('has-cursor');

  document.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
    cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', function () {
    cursor.classList.remove('visible');
  });

  function loop() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    cursor.style.transform = 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%)';
    requestAnimationFrame(loop);
  }
  loop();

  var hoverables = document.querySelectorAll('a, button, [data-magnetic], input, textarea');
  hoverables.forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('hover'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('hover'); });
  });
})();

/* ============================================================
   Magnetic elements
   ============================================================ */
(function () {
  if (!hasFinePointer || reduceMotion) return;
  var els = document.querySelectorAll('[data-magnetic]');
  els.forEach(function (el) {
    var strength = 14;
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var mx = e.clientX - (rect.left + rect.width / 2);
      var my = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = 'translate(' + (mx / rect.width) * strength + 'px, ' + (my / rect.height) * strength + 'px)';
      el.style.transition = 'transform 0.1s linear';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.transform = 'translate(0, 0)';
    });
  });
})();

/* ============================================================
   Scroll progress bar
   ============================================================ */
(function () {
  var bar = document.getElementById('progressBar');
  if (!bar) return;
  function update() {
    var h = document.documentElement;
    var scrolled = h.scrollTop;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (scrolled / max) * 100 : 0;
    bar.style.width = pct + '%';
  }
  document.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ============================================================
   Scroll reveal
   ============================================================ */
try {
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealEls = document.querySelectorAll('.reveal');
    for (var i = 0; i < revealEls.length; i++) revealEls[i].classList.add('pending');

    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('in-view');
          io.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    for (var k = 0; k < revealEls.length; k++) io.observe(revealEls[k]);
  }
} catch (e) { /* decorative */ }

/* ============================================================
   Animated stat counters
   ============================================================ */
try {
  var statEls = document.querySelectorAll('.stat-num');

  function animateStat(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }

    var duration = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var statIo = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          animateStat(entries[j].target);
          statIo.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.45 });

    for (var m = 0; m < statEls.length; m++) statIo.observe(statEls[m]);
  } else {
    for (var n = 0; n < statEls.length; n++) {
      var el = statEls[n];
      el.textContent = (el.getAttribute('data-prefix') || '')
                     + el.getAttribute('data-target')
                     + (el.getAttribute('data-suffix') || '');
    }
  }
} catch (e) { /* static fallback */ }

/* ============================================================
   Flow animations — sequential node trace
   ============================================================ */
(function () {
  if (reduceMotion) {
    document.querySelectorAll('[data-flow]').forEach(function (wrap) {
      wrap.querySelectorAll('.sm-node').forEach(function (n) { n.classList.add('active'); });
      wrap.querySelectorAll('.sm-link').forEach(function (l) { l.classList.add('traced'); });
    });
    return;
  }

  function runFlow(wrap) {
    var nodes = wrap.querySelectorAll('.sm-node');
    var links = wrap.querySelectorAll('.sm-link');
    var i = 0;
    var stepMs = 650;
    var endPause = 1600;

    function tick() {
      if (i > 0 && links[i - 1]) links[i - 1].classList.add('traced');
      if (i < nodes.length) {
        nodes[i].classList.add('active');
        i++;
        setTimeout(tick, stepMs);
      } else {
        setTimeout(function () {
          nodes.forEach(function (n) { n.classList.remove('active'); });
          links.forEach(function (l) { l.classList.remove('traced'); });
          i = 0;
          setTimeout(tick, stepMs);
        }, endPause);
      }
    }
    tick();
  }

  var flows = document.querySelectorAll('[data-flow]');
  if (!('IntersectionObserver' in window)) {
    flows.forEach(runFlow);
    return;
  }

  var flowIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        runFlow(entry.target);
        flowIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  flows.forEach(function (f) { flowIo.observe(f); });
})();

/* Contact form is handled by Formspree's @formspree/ajax library,
   initialized inline in index.html. */