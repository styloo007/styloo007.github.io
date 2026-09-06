document.getElementById('year').textContent = new Date().getFullYear();

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- scroll reveal ---------- */

var revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reduceMotion) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) { io.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add('in-view'); });
}

/* ---------- animated stat counters ---------- */

var statEls = document.querySelectorAll('.stat-num');

function animateStat(el) {
  var target = parseInt(el.getAttribute('data-target'), 10);
  var suffix = el.getAttribute('data-suffix') || '';
  if (reduceMotion) {
    el.textContent = target + suffix;
    return;
  }
  var start = 0;
  var duration = 1100;
  var startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var value = Math.round(start + (target - start) * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window) {
  var statIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        statIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statEls.forEach(function (el) { statIo.observe(el); });
} else {
  statEls.forEach(function (el) {
    el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
  });
}

/* ---------- idle waveform canvas ---------- */

var canvas = document.getElementById('wave');
if (canvas && canvas.getContext) {
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var bars = 40;
  var barW = W / bars;
  var seeds = [];
  for (var i = 0; i < bars; i++) {
    seeds.push({
      base: 0.15 + Math.random() * 0.55,
      speed: 0.6 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2
    });
  }

  var accent = '#f2a93c';
  var accent2 = '#5fd0c0';
  var dim = 'rgba(143,150,168,0.45)';

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < bars; i++) {
      var s = seeds[i];
      var wobble = reduceMotion ? 0 : Math.sin(t * 0.001 * s.speed + s.phase) * 0.18;
      var h = Math.max(0.06, Math.min(1, s.base + wobble)) * H * 0.82;
      var x = i * barW;
      var y = (H - h) / 2;
      ctx.fillStyle = (i % 7 === 0) ? accent : (i % 11 === 0 ? accent2 : dim);
      ctx.fillRect(x + barW * 0.22, y, barW * 0.56, h);
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

/* ---------- contact form ---------- */

var contactForm = document.getElementById('contact-form');

if (contactForm) {
  var statusEl = contactForm.querySelector('.form-status');
  var nextField = document.getElementById('cf-next');

  // Point Formspree's redirect-after-submit back at this page's contact
  // section, with a marker query param, rather than Formspree's default page.
  if (nextField) {
    var base = window.location.origin + window.location.pathname;
    nextField.value = base + '?sent=true#contact';
  }

  // Block obvious bots (honeypot filled in) without a full round trip.
  contactForm.addEventListener('submit', function (e) {
    if (contactForm.querySelector('[name="_gotcha"]').value) {
      e.preventDefault();
      statusEl.textContent = 'Thanks — I\'ll get back to you soon.';
      statusEl.className = 'form-status success';
      contactForm.reset();
    }
    // Otherwise, let the form submit normally to Formspree.
  });

  // After Formspree redirects back with ?sent=true, show a success message
  // and clean the URL so a page refresh doesn't repeat it.
  if (window.location.search.indexOf('sent=true') !== -1) {
    statusEl.textContent = 'Thanks — your message is on its way. I\'ll get back to you soon.';
    statusEl.className = 'form-status success';
    var cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);
  }
}