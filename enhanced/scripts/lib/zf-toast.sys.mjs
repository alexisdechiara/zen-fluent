// Zen Fluent Enhanced: a short message at the bottom of the window.
//
// Zen's own toasts only take Fluent string ids from its locale files, so
// the features show their own: one #zf-toast per window, reused, which
// removes itself once it has faded (enhanced/src/toast.css). It needs no
// clean-up from the feature that showed it.

const DURATION = 1800;

/**
 * @param {Window} win - The chrome window.
 * @param {string} text
 */
export function showToast(win, text) {
  const doc = win.document;
  let toast = doc.getElementById("zf-toast");
  if (!toast) {
    toast = doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    toast.id = "zf-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    doc.body.append(toast);
  }
  toast.textContent = text;
  win.clearTimeout(toast.zfHide);
  win.clearTimeout(toast.zfRemove);
  // Shown on the next frame so the fade in runs on a new toast too
  win.requestAnimationFrame(() => toast.setAttribute("zf-shown", ""));
  toast.zfHide = win.setTimeout(() => {
    toast.removeAttribute("zf-shown");
    toast.zfRemove = win.setTimeout(() => toast.remove(), 400);
  }, DURATION);
}
