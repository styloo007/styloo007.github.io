var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- scroll reveal (fail-safe) ----------
   .reveal elements are visible by default (see styles.css). We only hide
   them (by adding .pending) once we've confirmed IntersectionObserver is
   available — so if this whole block throws, or the API isn't supported,
   content simply stays visible instead of vanishing. */

try {
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealEls = document.querySelectorAll('.reveal');

    for (var i = 0; i < revealEls.length; i++) {
      revealEls[i].classList.add('pending');
    }

    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('in-view');
          io.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    for (var k = 0; k < revealEls.length; k++) {
      io.observe(revealEls[k]);
    }
  }
} catch (e) {
  // Reveal is purely decorative — a failure here must never hide content.
}

/* ---------- animated stat counters ---------- */

try {
  var statEls = document.querySelectorAll('.stat-num');

  var animateStat = function (el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1100;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    var statIo = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          animateStat(entries[j].target);
          statIo.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.5 });

    for (var m = 0; m < statEls.length; m++) {
      statIo.observe(statEls[m]);
    }
  } else {
    for (var n = 0; n < statEls.length; n++) {
      var el = statEls[n];
      el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
    }
  }
} catch (e) {
  // If counting fails for any reason, fall back to the static target values
  // that are already sitting in the HTML as text content.
}

/* ---------- idle waveform canvas (slim hero strip) ---------- */

try {
  var canvas = document.getElementById('wave');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var bars = 56;
    var barW = W / bars;
    var seeds = [];
    for (var p = 0; p < bars; p++) {
      seeds.push({
        base: 0.15 + Math.random() * 0.55,
        speed: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2
      });
    }

    var accent = '#f2a93c';
    var accent2 = '#5fd0c0';
    var dim = 'rgba(143,150,168,0.45)';

    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      for (var q = 0; q < bars; q++) {
        var s = seeds[q];
        var wobble = reduceMotion ? 0 : Math.sin(t * 0.001 * s.speed + s.phase) * 0.18;
        var h = Math.max(0.06, Math.min(1, s.base + wobble)) * H * 0.82;
        var x = q * barW;
        var y = (H - h) / 2;
        ctx.fillStyle = (q % 7 === 0) ? accent : (q % 11 === 0 ? accent2 : dim);
        ctx.fillRect(x + barW * 0.22, y, barW * 0.56, h);
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  }
} catch (e) {
  // Decorative only — safe to skip entirely if canvas isn't available.
}

/* ---------- contact form ----------
   Submission handling (AJAX, validation, success/error messages) is now
   handled entirely by Formspree's official @formspree/ajax library, loaded
   and initialized directly in index.html. Nothing needed here. */