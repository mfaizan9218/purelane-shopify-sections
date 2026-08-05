/**
 * Purelane — shared reveal-on-scroll utility.
 * Load ONCE, globally, via theme.liquid (deferred):
 * <script src="{{ 'purelane-base.js' | asset_url }}" defer></script>
 *
 * Any element with class="pl-rv" fades/slides in the first time it enters
 * the viewport. Re-runs automatically for content injected later (e.g. a
 * section re-rendered by the theme editor) via a MutationObserver, and does
 * nothing when the visitor has requested reduced motion.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAll(root) {
    var els = (root || document).querySelectorAll('.pl-rv:not(.pl-in)');
    if (!els.length) return;

    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('pl-in'); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('pl-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
    );

    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () { revealAll(document); });

  // Re-scan when Shopify's theme editor injects/re-renders a section.
  document.addEventListener('shopify:section:load', function (e) { revealAll(e.target); });

  window.Purelane = window.Purelane || {};
  window.Purelane.revealAll = revealAll;
})();
