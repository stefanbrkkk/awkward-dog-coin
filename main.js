/* Awkward Dog Coin — quiet motion only. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var revealables = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  /* ---------------------------------------------------------
     Reveal on scroll — soft fade + 16px rise, gently staggered.
     --------------------------------------------------------- */
  function showAll() {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  function initReveals() {
    if (reduced.matches || !('IntersectionObserver' in window)) {
      showAll();
      return;
    }

    // Arm transitions one frame after paint so the initial hidden state is
    // never animated in from nothing on load.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        revealables.forEach(function (el) { el.classList.add('reveal-ready'); });

        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });

        revealables.forEach(function (el) {
          // Anything already inside the first screen reveals immediately.
          if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
            el.classList.add('is-in');
          } else {
            io.observe(el);
          }
        });

        // The negative bottom margin above leaves a dead band at the very end of
        // the document: an element sitting inside it can never satisfy the
        // observer, however far the reader scrolls. Once the page bottom is
        // reached there is nothing left below the fold, so settle the remainder.
        var sweep = function () {
          var atEnd = window.innerHeight + window.scrollY >=
                      document.documentElement.scrollHeight - 2;
          if (!atEnd) return;
          revealables.forEach(function (el) {
            if (!el.classList.contains('is-in')) {
              el.classList.add('is-in');
              io.unobserve(el);
            }
          });
          window.removeEventListener('scroll', sweep);
          window.removeEventListener('resize', sweep);
        };
        window.addEventListener('scroll', sweep, { passive: true });
        window.addEventListener('resize', sweep, { passive: true });
        sweep();
      });
    });
  }

  /* ---------------------------------------------------------
     Almost-imperceptible parallax on the portrait.
     --------------------------------------------------------- */
  function initParallax() {
    var img = document.querySelector('.plate__img');
    var plate = document.querySelector('.plate');
    if (!img || !plate || reduced.matches) return;

    // Total travel, centred on zero so the resting composition is the designed
    // one and nothing shifts between first paint and this script running.
    // Half of this must stay smaller than the image's bottom bleed.
    var MAX = 10;
    var ticking = false;

    function apply() {
      ticking = false;
      var rect = plate.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      // 0 when the plate sits at the bottom of the viewport, 1 when it exits the top.
      var p = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      p = Math.min(1, Math.max(0, p));
      img.style.setProperty('--py', ((p - 0.5) * MAX).toFixed(2) + 'px');
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     Contract address — copy to clipboard.
     --------------------------------------------------------- */
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var done = document.execCommand('copy');
      document.body.removeChild(ta);
      return done;
    } catch (e) {
      return false;
    }
  }

  function writeClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return legacyCopy(text); }
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  // Last resort: put the address under the caret so the reader can copy it by
  // hand rather than transcribe 44 characters of base58.
  function selectText(el) {
    try {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* selection is a courtesy, never a requirement */ }
  }

  function initCopy() {
    var status = document.getElementById('ca-status');

    Array.prototype.forEach.call(document.querySelectorAll('[data-ca]'), function (block) {
      var btn = block.querySelector('[data-ca-copy]');
      var valueEl = block.querySelector('[data-ca-value]');
      if (!btn || !valueEl) return;

      var idle = btn.textContent;
      var timer;

      btn.addEventListener('click', function () {
        // Guard rather than trust the markup: never copy the placeholder.
        if (block.hasAttribute('data-ca-empty')) return;
        var text = (valueEl.textContent || '').trim();
        if (!text) return;

        writeClipboard(text).then(function (copied) {
          window.clearTimeout(timer);
          if (copied) {
            btn.textContent = 'Copied';
            btn.setAttribute('data-copied', '');
            if (status) status.textContent = 'Contract address copied';
          } else {
            selectText(valueEl);
            btn.textContent = 'Select';
            if (status) status.textContent = 'Could not copy automatically. The address is selected.';
          }
          timer = window.setTimeout(function () {
            btn.textContent = idle;
            btn.removeAttribute('data-copied');
            if (status) status.textContent = '';
          }, 1800);
        });
      });
    });
  }

  function boot() {
    initReveals();
    initParallax();
    initCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // If the motion preference flips mid-session, settle everything calmly.
  var onPrefChange = function () {
    if (reduced.matches) {
      showAll();
      var img = document.querySelector('.plate__img');
      if (img) img.style.setProperty('--py', '0px');
    }
  };
  if (reduced.addEventListener) reduced.addEventListener('change', onPrefChange);
  else if (reduced.addListener) reduced.addListener(onPrefChange);
})();
