// Zen Fluent Enhanced: the place of the sidebar cards.
//
// Small live cards (VPN, downloads, efficiency, the private session…) sit
// in one column, #zf-sidebar-cards, in #TabsToolbar just before the
// sidebar's bottom row (#zen-sidebar-foot-buttons): below Zen's media card
// and its own sidebar notifications, which grow upwards over the tabs, so
// everything stacks without overlapping. Each feature adds its card with
// addCard(); enhanced/src/sidebar-cards.css gives every .zf-card the same
// WinUI surface, and lays the column out. A card's order decides its
// place, lowest on top:
//   10 private session   20 downloads   30 efficiency   40 VPN
// The column only exists while a card does.

const HOST_ID = "zf-sidebar-cards";

/**
 * Adds a card to the sidebar's column, removed when the feature stops.
 *
 * @param {object} ctx - The feature's context (lib/zf-feature.sys.mjs).
 * @param {object} options - id (zf- prefixed), order, and optionally
 *   role and live ("polite") for a status card.
 * @returns {Element|null} The card (an hbox.zf-card, hidden until the
 *   feature shows it), or null when the window has no sidebar bottom row.
 */
export function addCard(ctx, { id, order = 50, role = "group", live = "" }) {
  const doc = ctx.document;
  const foot = doc.getElementById("zen-sidebar-foot-buttons");
  if (!foot) {
    return null;
  }
  let host = doc.getElementById(HOST_ID);
  if (!host) {
    host = doc.createXULElement("vbox");
    host.id = HOST_ID;
    foot.before(host);
  }
  const card = doc.createXULElement("hbox");
  card.id = id;
  card.className = "zf-card";
  card.setAttribute("align", "center");
  card.setAttribute("role", role);
  if (live) {
    card.setAttribute("aria-live", live);
  }
  card.hidden = true;
  card.style.order = String(order);
  host.append(card);
  ctx.onCleanup(() => {
    card.remove();
    if (!host.childElementCount) {
      host.remove();
    }
  });
  return card;
}
