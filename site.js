/* Interactions for sande.sh. No dependencies. Everything degrades
   gracefully and switches off under prefers-reduced-motion. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ------------------------------------------------------------------ */
  /* 0. Split text into words for staggered reveals                      */
  /* ------------------------------------------------------------------ */
  function splitWords(el) {
    var i = 0;
    function walk(node) {
      if (node.nodeType === 3) {
        var parts = node.nodeValue.split(/(\s+)/);
        if (parts.join('').trim() === '') return;
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--i', i++);
          var inner = document.createElement('span');
          inner.className = 'wi';
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }
    }
    walk(el);
    el.classList.add('is-split');
  }
  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* ------------------------------------------------------------------ */
  /* 1. Typed name + decode effect on tagline                             */
  /* ------------------------------------------------------------------ */
  var nameEl = document.querySelector('[data-type]');
  if (nameEl) {
    var full = nameEl.textContent;
    if (reduceMotion) {
      nameEl.classList.add('is-done');
    } else {
      nameEl.textContent = '';
      nameEl.classList.add('is-typing');
      var n = 0;
      (function typeNext() {
        nameEl.textContent = full.slice(0, ++n);
        if (n < full.length) setTimeout(typeNext, 70 + Math.random() * 60);
        else nameEl.classList.add('is-done');
      })();
    }
  }

  var scrambleEl = document.querySelector('[data-scramble]');
  if (scrambleEl) {
    var target = scrambleEl.textContent;
    var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_-+*';
    if (reduceMotion) {
      scrambleEl.classList.add('is-done');
    } else {
      var start = null, dur = 1100, delay = 450;
      scrambleEl.classList.add('is-on');
      function frame(ts) {
        if (!start) start = ts;
        var t = Math.max(0, (ts - start - delay) / dur);
        var out = '';
        for (var k = 0; k < target.length; k++) {
          var ch = target[k];
          if (ch === ' ' || ch === '×' || k / target.length < ease(Math.min(1, t))) out += ch;
          else out += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        scrambleEl.textContent = out;
        if (t < 1) requestAnimationFrame(frame);
        else { scrambleEl.textContent = target; scrambleEl.classList.add('is-done'); }
      }
      requestAnimationFrame(frame);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Scroll progress + hero recede + focus reading                     */
  /* ------------------------------------------------------------------ */
  var hero = document.querySelector('[data-hero]');
  var pct = document.querySelector('[data-pct]');
  var focusEls = document.querySelectorAll('[data-focus]');
  var scrollRaf = 0;

  function onScroll() {
    scrollRaf = 0;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var max = root.scrollHeight - vh;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    root.style.setProperty('--scroll', p.toFixed(4));
    root.classList.toggle('is-scrolled', y > 60);
    if (pct) pct.textContent = Math.round(p * 100) + '%';

    if (hero && !reduceMotion) {
      var t = Math.min(1, y / (vh * 0.7));
      hero.style.opacity = (1 - t * 0.75).toFixed(3);
      hero.style.setProperty('--hy', (y * -0.12).toFixed(1) + 'px');
      hero.style.setProperty('--hs', (1 - t * 0.04).toFixed(3));
    }

    /* Focus reading: the block nearest the viewport centre reads brightest */
    if (focusEls.length) {
      var centre = vh * 0.42;
      focusEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var mid = r.top + r.height / 2;
        var d = Math.abs(mid - centre) / (vh * 0.5);
        var f = Math.max(0, Math.min(1, 1 - d));
        el.style.setProperty('--focus', f.toFixed(3));
      });
    }
  }
  window.addEventListener('scroll', function () {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(onScroll);
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------------------------------------------------------------------ */
  /* 3. Reveal on scroll                                                  */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el);
        i++;
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 7. Click-to-copy on email links                                      */
  /* ------------------------------------------------------------------ */
  var toast, toastTimer;
  function showToast(text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = text; toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  }
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var addr = a.getAttribute('href').replace(/^mailto:/, '').split('?')[0];
      if (navigator.clipboard && addr) {
        navigator.clipboard.writeText(addr).then(function () { showToast('Email copied'); }, function () {});
      }
    });
  });

  /* Everything below needs a mouse. */
  if (!finePointer || reduceMotion) return;
  root.classList.add('has-pointer');

  var mx = window.innerWidth / 2, my = window.innerHeight / 3, moved = false;

  /* ------------------------------------------------------------------ */
  /* 4. Custom cursor                                                     */
  /* ------------------------------------------------------------------ */
  var dot = document.createElement('div');  dot.className = 'cur-dot';
  var ring = document.createElement('div'); ring.className = 'cur-ring';
  dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring); document.body.appendChild(dot);
  var rx = mx, ry = my;

  /* ------------------------------------------------------------------ */
  /* 5. Spotlight + reactive dot field                                    */
  /* ------------------------------------------------------------------ */
  var spot = document.createElement('div');
  spot.className = 'spotlight'; spot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(spot);
  var sx = mx, sy = my;

  var canvas = document.createElement('canvas');
  canvas.className = 'dots'; canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var GAP = 30, R = 170, W, H, cols, rows;

  function sizeCanvas() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / GAP) + 1; rows = Math.ceil(H / GAP) + 1;
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  var fx = mx, fy = my;
  function drawDots() {
    ctx.clearRect(0, 0, W, H);
    var ox = (W % GAP) / 2, oy = (H % GAP) / 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = ox + c * GAP, y = oy + r * GAP;
        var dx = x - fx, dy = y - fy;
        var d = Math.sqrt(dx * dx + dy * dy);
        var k = moved && d < R ? ease(1 - d / R) : 0;
        var a = 0.07 + k * 0.6;
        var rad = 1 + k * 1.4;
        // push dots gently away from the cursor
        var px = x + (k ? dx / d * k * 6 : 0), py = y + (k ? dy / d * k * 6 : 0);
        ctx.fillStyle = k > 0.02
          ? 'rgba(255,107,53,' + a.toFixed(3) + ')'
          : 'rgba(232,230,224,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(px, py, rad, 0, 6.2832); ctx.fill();
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* 6. Hero tilt + card glow                                             */
  /* ------------------------------------------------------------------ */
  var heroTitle = document.querySelector('.hero-title');
  var accentWord = document.querySelector('.accent-word');
  var cards = document.querySelectorAll('.exp-item');

  /* One animation loop for everything mouse-driven. */
  var loopRaf = 0, settled = 0;
  function loop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    sx += (mx - sx) * 0.10; sy += (my - sy) * 0.10;
    fx += (mx - fx) * 0.22; fy += (my - fy) * 0.22;

    dot.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    spot.style.setProperty('--x', sx + 'px'); spot.style.setProperty('--y', sy + 'px');
    drawDots();

    if (heroTitle) {
      var nx = (sx / W - 0.5) * 2, ny = (sy / H - 0.5) * 2;
      heroTitle.style.transform = 'translate3d(' + (nx * 8).toFixed(1) + 'px,' + (ny * 5).toFixed(1) + 'px,0)';
      if (accentWord) accentWord.style.transform = 'translate3d(' + (nx * 6).toFixed(1) + 'px,' + (ny * 4).toFixed(1) + 'px,0)';
    }

    var still = Math.abs(mx - rx) < 0.2 && Math.abs(mx - sx) < 0.2 && Math.abs(my - ry) < 0.2 && Math.abs(my - sy) < 0.2;
    settled = still ? settled + 1 : 0;
    loopRaf = settled > 30 ? 0 : requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY; moved = true;
    root.classList.add('cursor-on');
    spot.classList.add('is-on');
    if (!loopRaf) loopRaf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener('mouseleave', function () {
    root.classList.remove('cursor-on'); spot.classList.remove('is-on'); moved = false;
    if (!loopRaf) loopRaf = requestAnimationFrame(loop);
  });
  window.addEventListener('scroll', function () {
    if (!loopRaf) loopRaf = requestAnimationFrame(loop);
  }, { passive: true });

  /* Cursor states */
  function setCursor(state) { root.setAttribute('data-cursor', state || ''); }
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest ? e.target.closest('a, button, .exp-item, [data-cursor]') : null;
    if (!t) return setCursor('');
    setCursor(t.getAttribute('data-cursor') || (t.classList.contains('exp-item') ? 'card' : 'link'));
  });
  document.addEventListener('mousedown', function () { root.classList.add('cursor-down'); });
  document.addEventListener('mouseup',   function () { root.classList.remove('cursor-down'); });

  /* Card glow follows the cursor inside each card */
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

})();

/* Live local time (runs regardless of pointer type) */
(function () {
  var clock = document.querySelector('[data-clock]');
  if (!clock) return;
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }); }
  catch (e) { return; }
  var wrap = clock.closest('[data-clock-wrap]');
  function tick() { clock.textContent = fmt.format(new Date()) + ' IST'; if (wrap) wrap.classList.add('is-on'); }
  tick(); setInterval(tick, 15000);
})();
