// Zen Fluent Enhanced: the start page's script (enhanced/start/start.html).
//
// A privileged page (chrome://sine/…): it reads the top sites from Firefox
// (NewTabUtils, the same as Firefox's new tab, blocked sites left out) and
// searches with the default engine. The window it opens in lends it Zen
// Fluent's accent.

const { NewTabUtils } = ChromeUtils.importESModule(
  "resource://gre/modules/NewTabUtils.sys.mjs",
);
// Firefox 158 no longer has Services.search
const { SearchService } = ChromeUtils.importESModule(
  "moz-src:///toolkit/components/search/SearchService.sys.mjs",
);

const chromeWindow = window.browsingContext.topChromeWindow;
const $ = (id) => document.getElementById(id);

// -------- The accent from the window --------
function borrowStyle() {
  if (!chromeWindow) {
    return;
  }
  const style = chromeWindow.getComputedStyle(
    chromeWindow.document.documentElement,
  );
  for (const name of ["--zf-accent", "--zf-on-accent", "--zf-accent-text"]) {
    const value = style.getPropertyValue(name).trim();
    if (value) {
      document.documentElement.style.setProperty(name, value);
    }
  }
}

// -------- Greeting and clock --------
const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });
function tick() {
  const now = new Date();
  const hour = now.getHours();
  $("greeting").textContent =
    hour < 5
      ? "Good night"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
  $("time").textContent = timeFormat.format(now);
  $("date").textContent = dateFormat.format(now);
}

// -------- Search --------
async function setUpSearch() {
  await SearchService.init();
  const engine = await SearchService.getDefault();
  const icon = await engine.getIconURL?.(20);
  $("engine-icon").src = icon || "chrome://global/skin/icons/search-glass.svg";
  $("query").placeholder = `Search with ${engine.name} or type an address`;
  $("search").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = $("query").value.trim();
    if (!text) {
      return;
    }
    // Firefox's own choice between an address and a search
    let url = null;
    try {
      const info = Services.uriFixup.getFixupURIInfo(
        text,
        Ci.nsIURIFixup.FIXUP_FLAG_FIX_SCHEME_TYPOS |
          Ci.nsIURIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP,
      );
      if (!info.keywordProviderName && info.preferredURI) {
        url = info.preferredURI.spec;
      }
    } catch {
      // not an address
    }
    url ??= engine.getSubmission(text).uri.spec;
    chromeWindow.openTrustedLinkIn(url, "current");
  });
}

// -------- Top sites --------
const html = (tag, attributes = {}, text = "") => {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value);
  }
  el.textContent = text;
  return el;
};

function siteName(site) {
  try {
    const host = new URL(site.url).hostname.replace(/^www\./, "");
    return (
      site.label || site.title || host.split(".").slice(0, -1).join(".") || host
    );
  } catch {
    return site.title || site.url;
  }
}

async function renderSites() {
  let sites = [];
  try {
    sites = await NewTabUtils.activityStreamLinks.getTopSites({ numItems: 8 });
  } catch (error) {
    console.error("[Zen Fluent Enhanced] start page:", error);
  }
  $("sites").replaceChildren(
    ...sites.slice(0, 8).map((site) => {
      const li = html("li", { class: "site" });
      const link = html("a", { href: site.url, title: site.url });
      const icon = html("span", { class: "icon" });
      icon.append(html("img", { src: `page-icon:${site.url}`, alt: "" }));
      link.append(icon, html("span", { class: "title" }, siteName(site)));
      link.addEventListener("click", (event) => {
        event.preventDefault();
        chromeWindow.openTrustedLinkIn(
          site.url,
          event.button === 1 || event.ctrlKey ? "tab" : "current",
        );
      });
      const remove = html("button", {
        class: "remove",
        title: "Remove from top sites",
        "aria-label": "Remove from top sites",
      });
      remove.addEventListener("click", () => {
        NewTabUtils.activityStreamLinks.blockURL({ url: site.url });
        li.remove();
      });
      li.append(link, remove);
      return li;
    }),
  );
}

borrowStyle();
tick();
setInterval(tick, 15000);
setUpSearch().catch((error) =>
  console.error("[Zen Fluent Enhanced] start page:", error),
);
renderSites();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    borrowStyle();
    tick();
  }
});
$("query").focus();
