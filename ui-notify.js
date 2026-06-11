
(function () {
  if (window.__appNotifyReady) return;
  window.__appNotifyReady = true;

  const STYLE_ID = 'app-notify-style';
  const TOAST_ID = 'app-toast-root';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${TOAST_ID}{
        position:fixed;
        top:16px;
        left:50%;
        transform:translateX(-50%) translateY(-20px);
        z-index:2147483647;
        min-width:220px;
        max-width:min(92vw, 420px);
        padding:12px 16px;
        border-radius:16px;
        background:rgba(17,24,39,.96);
        color:#fff;
        box-shadow:0 10px 30px rgba(0,0,0,.18);
        font-family:'Cairo',sans-serif;
        font-size:14px;
        line-height:1.6;
        text-align:center;
        opacity:0;
        pointer-events:none;
        transition:opacity .25s ease, transform .25s ease;
      }
      #${TOAST_ID}.show{
        opacity:1;
        transform:translateX(-50%) translateY(0);
      }
      #${TOAST_ID}.success{ background:rgba(0,150,136,.97); }
      #${TOAST_ID}.error{ background:rgba(220,38,38,.97); }
      #${TOAST_ID}.warning{ background:rgba(245,158,11,.97); }
      #${TOAST_ID}.info{ background:rgba(17,24,39,.96); }
    `;
    document.head.appendChild(style);
  }

  function ensureToast() {
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement('div');
      toast.id = TOAST_ID;
      document.body.appendChild(toast);
    }
    return toast;
  }

  let toastTimer = null;

  function showAppToast(message, type = 'info', duration = 2600) {
    const text = String(message ?? '').trim();
    if (!text) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => showAppToast(text, type, duration), { once: true });
      return;
    }

    ensureStyle();
    const toast = ensureToast();
    toast.className = '';
    toast.id = TOAST_ID;
    toast.className = type ? type : '';
    toast.textContent = text;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  window.showAppToast = showAppToast;
  window.showToast = showAppToast;
  window.alert = function (message) {
    showAppToast(message, 'info', 2600);
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./firebase-messaging-sw.js').catch(() => {});
    });
  }

  window.addEventListener('app-notify', (event) => {
    const detail = event?.detail || {};
    showAppToast(detail.message || detail.body || detail.title || 'تم التحديث', detail.type || 'info', detail.duration || 2800);
  });
})();
