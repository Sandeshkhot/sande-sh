/* Small, dependency-free interactions. Everything degrades gracefully
   and respects prefers-reduced-motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;

  /* 1. Scroll progress on the left accent line ------------------------ */
  var progressRaf = 0;
  function updateProgress() {
    progressRaf = 0;
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    root.style.setProperty('--scroll', p.toFixed(4));
  }
  window.addEventListener('scroll', function () {
    if (!progressRaf) progressRaf = requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* 2. Reveal on scroll ------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
        el.classList.add('is-visible');
        io.unobserve(el);
        i++;
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* 3. Cursor spotlight (fine pointers only) ---------------------------- */
  if (finePointer && !reduceMotion) {
    var spot = document.createElement('div');
    spot.className = 'spotlight';
    spot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spot);

    var tx = window.innerWidth / 2, ty = window.innerHeight / 3;
    var cx = tx, cy = ty, spotRaf = 0;

    function tick() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      spot.style.setProperty('--x', cx + 'px');
      spot.style.setProperty('--y', cy + 'px');
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) {
        spotRaf = requestAnimationFrame(tick);
      } else {
        spotRaf = 0;
      }
    }
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      spot.classList.add('is-on');
      if (!spotRaf) spotRaf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      spot.classList.remove('is-on');
    });
  }

  /* 4. Subtle hero parallax --------------------------------------------- */
  var parallax = document.querySelector('[data-parallax]');
  if (parallax && !reduceMotion && finePointer) {
    var pRaf = 0;
    function updateParallax() {
      pRaf = 0;
      var y = Math.min(window.scrollY, 600);
      parallax.style.transform = 'translate3d(0,' + (y * -0.08).toFixed(2) + 'px,0)';
    }
    window.addEventListener('scroll', function () {
      if (!pRaf) pRaf = requestAnimationFrame(updateParallax);
    }, { passive: true });
  }

  /* 5. Click-to-copy on email links ------------------------------------- */
  var toast, toastTimer;
  function showToast(text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 1800);
  }
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var addr = a.getAttribute('href').replace(/^mailto:/, '').split('?')[0];
      if (navigator.clipboard && addr) {
        navigator.clipboard.writeText(addr).then(function () {
          showToast('Email copied');
        }, function () {});
      }
    });
  });

  /* 6. Live local time -------------------------------------------------- */
  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata'
      });
    } catch (e) { fmt = null; }
    function updateClock() {
      if (!fmt) return;
      clock.textContent = fmt.format(new Date()) + ' IST';
      clock.closest('[data-clock-wrap]') && clock.closest('[data-clock-wrap]').classList.add('is-on');
    }
    updateClock();
    setInterval(updateClock, 15000);
  }
})();
