/* Reckon landing — tasteful JS only.
   1) Theme toggle (light/dark), persisted; otherwise follows the system.
   2) Scroll reveals via IntersectionObserver (progressive enhancement).
   3) Header hairline on scroll.
   No analytics. No tracking. */

(function () {
  var root = document.documentElement;
  var STORE = 'reckon-theme';

  // ---- Theme ----
  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function effectiveTheme() {
    return root.getAttribute('data-theme') || systemTheme();
  }
  function setMeta() {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', effectiveTheme() === 'dark' ? '#161718' : '#ECEDEF');
  }
  (function applyStored() {
    try {
      var saved = localStorage.getItem(STORE);
      if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
    } catch (e) {}
  })();
  setMeta();

  function init() {
    // Theme toggle
    var toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem(STORE, next); } catch (e) {}
        setMeta();
      });
    }

    // Header hairline on scroll
    var head = document.querySelector('.site-head');
    if (head) {
      var onScroll = function () { head.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Scroll reveal — hide only what's below the fold, reveal on scroll.
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // With reduced motion or no observer support, leave everything visible.
    if (reduce || !('IntersectionObserver' in window)) return;

    var vh = window.innerHeight || document.documentElement.clientHeight;
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > vh * 0.85) el.classList.add('pre'); // hide only below the fold
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove('pre');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) {
      if (el.classList.contains('pre')) io.observe(el);
    });

    // Safety net: never leave anything hidden.
    window.addEventListener('load', function () {
      setTimeout(function () {
        items.forEach(function (el) { el.classList.remove('pre'); });
      }, 1800);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
