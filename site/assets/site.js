/* notify-action-hub docs — minimal progressive enhancement.
 * Self-contained: no external libraries.
 * 1) Copy buttons (clipboard API with execCommand fallback)
 * 2) Current page highlight for internal header/footer links */

(function () {
  'use strict';

  /* ---------- 1) Copy buttons ---------- */

  function copyViaFallback(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  function copyText(text) {
    return new Promise(function (resolve) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(text)
          .then(function () {
            resolve(true);
          })
          .catch(function () {
            resolve(copyViaFallback(text));
          });
      } else {
        resolve(copyViaFallback(text));
      }
    });
  }

  function handleCopyClick(button) {
    if (button.dataset.copyState === 'busy') {
      return;
    }
    var block = button.closest('.code-block');
    var code = block && (block.querySelector('code') || block.querySelector('pre'));
    if (!code) {
      return;
    }
    button.dataset.copyState = 'busy';
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent;
    }
    copyText(code.textContent).then(function (ok) {
      button.textContent = ok
        ? button.dataset.copiedLabel || 'Copied!'
        : button.dataset.copyFailedLabel || 'Copy failed';
      button.classList.toggle('copied', ok);
      setTimeout(function () {
        button.textContent = button.dataset.originalLabel;
        button.classList.remove('copied');
        delete button.dataset.copyState;
      }, 1600);
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target && event.target.closest
      ? event.target.closest('.copy-btn')
      : null;
    if (button) {
      handleCopyClick(button);
    }
  });

  /* ---------- 2) Current page highlight ---------- */

  function normalizePath(pathname) {
    if (!pathname) {
      return '/';
    }
    var path = pathname.split('#')[0].split('?')[0];
    var indexPos = path.indexOf('/index.html');
    if (indexPos !== -1) {
      path = path.slice(0, indexPos);
    }
    while (path.length > 1 && path.charAt(path.length - 1) === '/') {
      path = path.slice(0, -1);
    }
    return path || '/';
  }

  function markCurrentLinks() {
    var links = document.querySelectorAll(
      '.site-header a, .site-footer a, .breadcrumb a'
    );
    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|data:)/i.test(href) || href.charAt(0) === '#') {
        return;
      }
      var target;
      try {
        target = new URL(link.href, window.location.href);
      } catch (err) {
        return;
      }
      if (target.host !== window.location.host) {
        return;
      }
      if (normalizePath(target.pathname) === normalizePath(window.location.pathname)) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markCurrentLinks);
  } else {
    markCurrentLinks();
  }
})();
