// Zen Fluent Enhanced: a short message at the bottom of the window.
//
// Zen's own toasts only take Fluent string ids from its locale files, so
// the features show their own: one #zf-toast per window, reused, which
// removes itself once it has faded (enhanced/src/toast.css). It needs no
// clean-up from the feature that showed it. An action (Undo) adds a button
// and keeps the toast longer.

const DURATION = 1800;
const DURATION_ACTION = 6000;

/**
 * @param {Window} win - The chrome window.
 * @param {string} text
 * @param {object} [options]
 * @param {{label: string, run: Function}} [options.action]
 */
export function showToast(win, text, { action } = {}) {
  const doc = win.document;
  let toast = doc.getElementById("zf-toast");
  if (!toast) {
    toast = doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    toast.id = "zf-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    doc.body.append(toast);
  }
  const message = doc.createElementNS("http://www.w3.org/1999/xhtml", "span");
  message.textContent = text;
  toast.replaceChildren(message);
  const hide = () => {
    win.clearTimeout(toast.zfHide);
    toast.removeAttribute("zf-shown");
    toast.zfRemove = win.setTimeout(() => toast.remove(), 400);
  };
  if (action) {
    const button = doc.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "button",
    );
    button.className = "zf-toast-action";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      hide();
      action.run();
    });
    toast.append(button);
  }
  toast.toggleAttribute("zf-action", !!action);
  win.clearTimeout(toast.zfHide);
  win.clearTimeout(toast.zfRemove);
  // Shown on the next frame so the fade in runs on a new toast too
  win.requestAnimationFrame(() => toast.setAttribute("zf-shown", ""));
  toast.zfHide = win.setTimeout(hide, action ? DURATION_ACTION : DURATION);
}
