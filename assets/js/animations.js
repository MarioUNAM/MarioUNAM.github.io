/**
 * animations.js
 * Professional micro-interactions for the portfolio.
 *
 * Modules (all respect prefers-reduced-motion):
 *   1. MagneticCTA    — primary buttons pull toward cursor (rAF)
 *   2. ParallaxHero   — hero orbs / grid shift on scroll (0.3x)
 *   3. CounterAnim    — animated number counters (easeOutQuad)
 *   4. CardTilt       — case-study cards tilt toward pointer (max 6°)
 *   5. SmoothScroll   — offset-aware smooth scroll for sticky nav
 *   6. FadeThrough    — opacity + blur fade on section entry
 */

(function () {
  'use strict';

  /* ── Motion guard ────────────────────────────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────────
     1. MAGNETIC CTA
     Elements: [data-magnetic]
     Pulls toward pointer within a radius of 60px.
  ───────────────────────────────────────────────────────────── */
  function initMagneticCTA() {
    if (reducedMotion) return;

    document.querySelectorAll('[data-magnetic]').forEach(el => {
      let rafId = null;
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;

      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = e.clientX - cx;
        const dy   = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const radius = 60;
        const factor = Math.max(0, 1 - dist / radius) * 0.35;

        targetX = dx * factor;
        targetY = dy * factor;

        if (!rafId) animateMagnetic();
      });

      el.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
      });

      function animateMagnetic() {
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;
        el.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;

        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
          rafId = requestAnimationFrame(animateMagnetic);
        } else {
          el.style.transform = '';
          rafId = null;
        }
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     2. PARALLAX HERO
     Elements: [data-parallax] with data-parallax-speed attribute (0–1)
     Moves on scroll: translateY = scrollY * speed
  ───────────────────────────────────────────────────────────── */
  function initParallaxHero() {
    if (reducedMotion) return;

    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    let ticking = false;

    function update() {
      const scrollY = window.scrollY;
      elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallaxSpeed || '0.3');
        el.style.transform = `translateY(${(scrollY * speed).toFixed(1)}px)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     3. COUNTER ANIMATION
     Elements: [data-counter] with data-counter-target (number)
     Optional: data-counter-suffix ("+", "%", etc.)
     Fires once when element enters viewport.
  ───────────────────────────────────────────────────────────── */
  function easeOutQuad(t) { return t * (2 - t); }

  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutQuad(progress) * target);
      el.textContent = value + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.counterTarget || el.dataset.counter, 10);
        const suffix = el.dataset.counterSuffix || '';
        const dur    = reducedMotion ? 0 : parseInt(el.dataset.counterDuration || '1400', 10);

        if (isNaN(target)) return;

        if (reducedMotion) {
          el.textContent = target + suffix;
        } else {
          animateCounter(el, target, suffix, dur);
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
  }

  /* ─────────────────────────────────────────────────────────────
     4. CARD TILT
     Elements: [data-tilt]
     Max rotation: 6deg. Resets on mouseleave.
  ───────────────────────────────────────────────────────────── */
  function initCardTilt() {
    if (reducedMotion) return;

    document.querySelectorAll('[data-tilt]').forEach(card => {
      const maxDeg = parseFloat(card.dataset.tiltMax || '6');

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;
        const rotY =  x * maxDeg * 2;
        const rotX = -y * maxDeg * 2;
        card.style.transform = `perspective(600px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(() => { card.style.transition = ''; }, 400);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5. SMOOTH SCROLL (offset for sticky nav)
     Intercepts anchor clicks href="#section".
     Offset = glass-nav height + 8px breathing room.
  ───────────────────────────────────────────────────────────── */
  function initSmoothScroll() {
    function getNavHeight() {
      const nav = document.getElementById('main-nav');
      return nav ? nav.offsetHeight + 8 : 72;
    }

    document.addEventListener('click', e => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - getNavHeight();

      if (reducedMotion) {
        window.scrollTo({ top });
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     6. FADE-THROUGH SECTION ENTRY
     Elements: [data-fade-section]
     Adds class 'in-view' when section crosses 15% of viewport.
     CSS handles opacity + blur transition.
  ───────────────────────────────────────────────────────────── */
  function initFadeThrough() {
    const sections = document.querySelectorAll('[data-fade-section]');
    if (!sections.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    sections.forEach(s => obs.observe(s));
  }

  /* ── Init all modules on DOMContentLoaded ────────────────────── */
  function init() {
    initMagneticCTA();
    initParallaxHero();
    initCounters();
    initCardTilt();
    initSmoothScroll();
    initFadeThrough();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Public API */
  window.PortfolioAnimations = { init };
})();
