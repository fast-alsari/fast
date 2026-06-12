(function () {
  if (window.__FAST_UI__) return;
  window.__FAST_UI__ = true;

  const style = document.createElement("style");
  style.textContent = `
    .ui-toast-host{
      position: fixed;
      top: 16px;
      left: 16px;
      right: 16px;
      z-index: 100000;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }
    .ui-toast{
      pointer-events: none;
      min-width: min(420px, calc(100vw - 32px));
      max-width: min(520px, calc(100vw - 32px));
      border-radius: 18px;
      padding: 12px 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,.18);
      color: #fff;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.6;
      backdrop-filter: blur(8px);
      transform: translateY(-8px);
      opacity: 0;
      transition: opacity .25s ease, transform .25s ease;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .ui-toast.show{ opacity: 1; transform: translateY(0); }
    .ui-toast.success{ background: linear-gradient(135deg, #15a34a, #22c55e); }
    .ui-toast.error{ background: linear-gradient(135deg, #dc2626, #ef4444); }
    .ui-toast.info{ background: linear-gradient(135deg, #0f766e, #14b8a6); }
    .ui-toast.warn{ background: linear-gradient(135deg, #b45309, #f59e0b); }
    .ui-toast .icon{
      width: 22px;
      flex: 0 0 22px;
      text-align: center;
      font-weight: 900;
      font-size: 16px;
      margin-top: 1px;
    }

    .ui-dialog-overlay{
      position: fixed;
      inset: 0;
      z-index: 100001;
      background: rgba(0,0,0,.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      backdrop-filter: blur(4px);
    }
    .ui-dialog{
      width: min(420px, 100%);
      background: #fff;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      overflow: hidden;
      direction: rtl;
      font-family: inherit;
    }
    .ui-dialog-header{
      padding: 18px 20px 8px;
      font-size: 16px;
      font-weight: 800;
      color: #1f2937;
    }
    .ui-dialog-body{
      padding: 0 20px 18px;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.7;
    }
    .ui-dialog-body input{
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d1d5db;
      border-radius: 16px;
      padding: 12px 14px;
      font: inherit;
      margin-top: 10px;
      outline: none;
      background: #f9fafb;
    }
    .ui-dialog-actions{
      display: flex;
      gap: 10px;
      padding: 0 20px 20px;
    }
    .ui-dialog-actions button{
      flex: 1;
      border: none;
      border-radius: 16px;
      padding: 12px 14px;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    .ui-btn-primary{ background:#ff8800; color:#fff; }
    .ui-btn-secondary{ background:#eef2f7; color:#374151; }
  `;
  document.head.appendChild(style);

  function ensureHost() {
    let host = document.querySelector(".ui-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.className = "ui-toast-host";
      (document.body || document.documentElement).appendChild(host);
    }
    return host;
  }

  function showToast(message, type = "info", duration = 2800) {
    const text = String(message ?? "").trim() || "تم التنفيذ";
    const host = ensureHost();
    const toast = document.createElement("div");
    toast.className = `ui-toast ${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "!" : type === "warn" ? "⚠" : "i";
    toast.innerHTML = `<div class="icon">${icon}</div><div class="text">${text}</div>`;
    host.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    const timer = setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 260);
    }, duration);
    toast.addEventListener("click", () => {
      clearTimeout(timer);
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 160);
    });
    return toast;
  }

  function askDialog({ title, message, input = false, value = "", placeholder = "", confirmText = "موافق", cancelText = "إلغاء" }) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "ui-dialog-overlay";
      overlay.innerHTML = `
        <div class="ui-dialog" role="dialog" aria-modal="true">
          <div class="ui-dialog-header">${title || ""}</div>
          <div class="ui-dialog-body">
            <div>${message || ""}</div>
            ${input ? `<input type="text" value="${String(value).replace(/"/g, "&quot;")}" placeholder="${placeholder || ""}">` : ""}
          </div>
          <div class="ui-dialog-actions">
            <button type="button" class="ui-btn-secondary" data-action="cancel">${cancelText}</button>
            <button type="button" class="ui-btn-primary" data-action="confirm">${confirmText}</button>
          </div>
        </div>
      `;
      const inputEl = overlay.querySelector("input");
      const cleanup = (result) => {
        overlay.remove();
        resolve(result);
      };

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) cleanup(input ? null : false);
      });

      overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => cleanup(input ? null : false));
      overlay.querySelector('[data-action="confirm"]').addEventListener("click", () => {
        cleanup(input ? (inputEl ? inputEl.value : "") : true);
      });
      document.addEventListener("keydown", function onKey(e) {
        if (!document.body.contains(overlay)) {
          document.removeEventListener("keydown", onKey);
          return;
        }
        if (e.key === "Escape") cleanup(input ? null : false);
        if (e.key === "Enter" && inputEl) cleanup(inputEl.value);
      });

      (document.body || document.documentElement).appendChild(overlay);
      if (inputEl) {
        setTimeout(() => {
          inputEl.focus();
          inputEl.select?.();
        }, 0);
      }
    });
  }

  window.showToast = showToast;
  window.uiToast = showToast;
  window.setButtonLoading = function (buttonOrId, loading, loadingText = "جاري المعالجة...", idleText = null) {
    const button = typeof buttonOrId === "string" ? document.getElementById(buttonOrId) : buttonOrId;
    if (!button) return;
    if (!button.dataset.uiIdleText && idleText == null) {
      button.dataset.uiIdleText = button.textContent || "";
    }
    if (idleText != null) button.dataset.uiIdleText = idleText;
    button.disabled = !!loading;
    button.textContent = loading ? loadingText : (button.dataset.uiIdleText || idleText || button.textContent || "");
  };
  window.askText = function (message, options = {}) {
    return askDialog({
      title: options.title || "تنبيه",
      message,
      input: true,
      value: options.value || "",
      placeholder: options.placeholder || "",
      confirmText: options.confirmText || "موافق",
      cancelText: options.cancelText || "إلغاء"
    });
  };
  window.askConfirm = function (message, options = {}) {
    return askDialog({
      title: options.title || "تأكيد",
      message,
      input: false,
      confirmText: options.confirmText || "موافق",
      cancelText: options.cancelText || "إلغاء"
    });
  };

  window.alert = function (message) {
    showToast(message, "error");
  };
})();