(function () {
  'use strict';
  var current;
  var mobile = window.matchMedia('(max-width: 760px), (max-height: 500px)');

  function init(root) {
    if (root.dataset.chatReady) return;
    root.dataset.chatReady = 'true';
    var panel = root.querySelector('[data-chat-panel]');
    var launcher = root.querySelector('[data-chat-launcher]');
    var backdrop = root.querySelector('.dining-chat-backdrop');
    var input = root.querySelector('textarea');
    var open = false;
    var trigger;
    var background = [];
    var overflow;
    function release() {
      background.forEach(function (pair) { pair[0].inert = pair[1]; });
      background = [];
      if (overflow !== undefined) { document.body.style.overflow = overflow; overflow = undefined; }
      document.body.classList.remove('dining-chat-modal');
    }
    function resize() {
      var viewport = window.visualViewport;
      var visibleHeight = viewport ? viewport.height : window.innerHeight;
      root.style.setProperty('--chat-viewport-height', visibleHeight + 'px');
      root.classList.toggle('is-chat-compact', visibleHeight <= 500);
      root.style.setProperty('--chat-viewport-top', (viewport ? viewport.offsetTop : 0) + 'px');
      if (!open) return;
      release();
      if (mobile.matches) {
        // Inert siblings at every level also works when React wraps the page.
        var branch = root;
        while (branch.parentElement && branch !== document.body) {
          Array.from(branch.parentElement.children).forEach(function (sibling) {
            if (sibling !== branch) { background.push([sibling, sibling.inert]); sibling.inert = true; }
          });
          branch = branch.parentElement;
        }
        overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('dining-chat-modal');
        panel.setAttribute('aria-modal', 'true');
        backdrop.hidden = false;
      } else {
        panel.removeAttribute('aria-modal');
        backdrop.hidden = true;
      }
    }
    function close(restoreFocus) {
      if (!open) return;
      input.blur();
      open = false;
      release();
      panel.hidden = true;
      backdrop.hidden = true;
      root.classList.remove('is-chat-open');
      document.querySelectorAll('[data-chat-open]').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
      if (restoreFocus) (trigger && trigger.isConnected ? trigger : launcher).focus({ preventScroll: true });
    }
    current = {
      root: root, resize: resize, close: close,
      show: function (button) {
        if (document.querySelector('[data-reservation-dialog]') || document.body.classList.contains('poster-open')) return;
        if (open) { close(true); return; }
        trigger = button;
        open = true;
        panel.hidden = false;
        root.classList.add('is-chat-open');
        document.querySelectorAll('[data-chat-open]').forEach(function (entry) { entry.setAttribute('aria-expanded', 'true'); });
        resize();
        // Opening chat never opens the keyboard or sends a question.
        root.querySelector('.dining-chat-close').focus({ preventScroll: true });
        try { if (window.gtag) window.gtag('event', 'dining_helper_open', { helper_language: root.dataset.language }); } catch { /* Optional analytics. */ }
      }
    };
    root.querySelectorAll('[data-chat-close]').forEach(function (button) { button.addEventListener('click', function () { close(true); }); });
    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
      if (event.key !== 'Tab' || !mobile.matches) return;
      var focusable = Array.from(panel.querySelectorAll('a[href], button:not([disabled]), textarea, [tabindex="0"]')).filter(function (element) { return element.getClientRects().length; });
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.querySelectorAll('[data-chat-open]').forEach(function (button) { button.hidden = false; });
    document.body.classList.add('dining-chat-ready');
    resize();
  }
  function start() {
    var root = document.querySelector('[data-dining-helper]');
    if (current && current.root !== root) { current.close(false); current = undefined; document.body.classList.remove('dining-chat-ready'); }
    if (root) init(root);
  }
  document.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('[data-chat-open], .poster-thumbnail');
    if (!target || !current) return;
    if (target.hasAttribute('data-chat-open')) { event.preventDefault(); current.show(target); }
    else current.close(false);
  });
  document.addEventListener('hotpot:booking-opening', function () { if (current) current.close(false); });
  window.addEventListener('resize', function () { if (current) current.resize(); }, { passive: true });
  if (window.visualViewport) {
    ['resize', 'scroll'].forEach(function (name) { window.visualViewport.addEventListener(name, function () { if (current) current.resize(); }, { passive: true }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  document.addEventListener('hotpot:page-ready', start);
}());
