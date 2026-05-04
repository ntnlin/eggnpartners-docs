/* cards.js — Enhanced card animations & visual system */
(function () {
  'use strict';

  /* ── Enhance phase cards ── */
  function enhancePhaseCards() {
    var cards = document.querySelectorAll('.phase-card');
    if (!cards.length) return;

    cards.forEach(function (card, i) {
      /* Shine sweep div */
      var shine = document.createElement('div');
      shine.className = 'card-shine';
      card.appendChild(shine);

      /* Step badge */
      var step = document.createElement('div');
      step.className = 'phase-step';
      step.textContent = '0' + (i + 1);
      card.appendChild(step);
    });
  }

  /* ── Enhance callouts ── */
  function enhanceCallouts() {
    document.querySelectorAll('.callout').forEach(function (el) {
      var shine = document.createElement('div');
      shine.className = 'callout-shine';
      el.appendChild(shine);
    });
  }

  /* ── 3D tilt on hover ── */
  function addTilt(selector) {
    document.querySelectorAll(selector).forEach(function (card) {
      var isHovering = false;
      var raf;

      card.addEventListener('mouseenter', function () {
        isHovering = true;
        card.style.transition = 'border-color 0.25s,box-shadow 0.25s';
      });

      card.addEventListener('mousemove', function (e) {
        if (!isHovering) return;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var rect = card.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width;
          var y = (e.clientY - rect.top) / rect.height;
          var tX = (y - 0.5) * 10;   /* tilt around X axis */
          var tY = (0.5 - x) * 10;   /* tilt around Y axis */
          card.style.transform =
            'perspective(900px) rotateX(' + tX + 'deg) rotateY(' + tY + 'deg) translateY(-4px) scale(1.015)';
        });
      });

      card.addEventListener('mouseleave', function () {
        isHovering = false;
        cancelAnimationFrame(raf);
        card.style.transition =
          'transform 0.55s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.25s';
        card.style.transform = '';
      });
    });
  }

  /* ── Staggered entrance via IntersectionObserver ── */
  function setupEntrance() {
    var SELECTORS = '.phase-card, .callout, .info-box, .stat-card, .diagram-container';
    var els = document.querySelectorAll(SELECTORS);
    if (!els.length) return;

    /* Only animate elements that start below the fold */
    var viewH = window.innerHeight || 600;
    var toAnimate = [];
    els.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top > viewH * 0.85) {
        el.classList.add('card-hidden');
        toAnimate.push(el);
      }
    });

    if (!toAnimate.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        /* Find stagger index among siblings in same grid */
        var parent = el.parentElement;
        var siblings = parent ? Array.prototype.slice.call(
          parent.querySelectorAll('.phase-card, .callout, .info-box, .stat-card')
        ) : [];
        var idx = siblings.indexOf(el);
        var delay = Math.max(0, idx) * 90; /* 90ms stagger */

        setTimeout(function () {
          el.classList.remove('card-hidden');
          el.classList.add('card-reveal');
        }, delay);

        observer.unobserve(el);
      });
    }, { threshold: 0.12 });

    toAnimate.forEach(function (el) { observer.observe(el); });
  }

  /* ── Animated number counter for .stat-value elements ── */
  function animateCounters() {
    var els = document.querySelectorAll('.stat-value');
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var text = el.textContent.trim();
        var num = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return;
        var prefix = text.match(/^[^0-9]*/)[0];
        var suffix = text.slice((prefix + num).length);
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          var val = start + (num - start) * ease;
          var display = num < 10 ? val.toFixed(1) : Math.round(val);
          el.textContent = prefix + display + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ── Animate progress bars inside phase cards ── */
  function animateVisibleProgress() {
    document.querySelectorAll('.phase-card-progress-fill').forEach(function (bar) {
      var pct = bar.dataset.pct || '0';
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.width = pct + '%';
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      observer.observe(bar);
    });
  }

  /* ── Init ── */
  function init() {
    enhancePhaseCards();
    enhanceCallouts();
    setupEntrance();
    animateVisibleProgress();
    addTilt('.phase-card');
    addTilt('.callout');
    addTilt('.stat-card');
    animateCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
