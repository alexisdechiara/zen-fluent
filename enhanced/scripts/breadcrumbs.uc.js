// Zen Fluent Enhanced: the address as a breadcrumb in the URL bar.
//
// While the URL bar shows the page's address (not focused, nothing typed),
// a row of segments covers its text, like File Explorer's address bar: the
// site, then each folder of the path, then the page. A click on a segment
// opens that level of the site (Ctrl or middle click: a new tab, Shift: a
// new window); a click on the page itself or on the empty space edits the
// address as usual. enhanced/src/breadcrumbs.css draws the row and hides it
// as soon as the bar is focused or holds something else.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  /** Path segments decoded for display; a bad escape stays as it is. */
  function decode(segment) {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  }

  /**
   * The breadcrumb of an address: [{ label, url }], the last one the page.
   * Only web and file addresses get one.
   */
  function crumbs(uri) {
    let url;
    try {
      url = new URL(uri.spec);
    } catch {
      return [];
    }
    const parts = url.pathname.split("/").filter(Boolean);
    const list = [];
    let base;
    if (url.protocol === "http:" || url.protocol === "https:") {
      base = url.origin;
      list.push({ label: url.hostname.replace(/^www\./, ""), url: `${base}/` });
    } else if (url.protocol === "file:" && parts.length) {
      base = "file:///" + parts.shift();
      list.push({ label: decode(base.slice(8)), url: `${base}/` });
    } else {
      return [];
    }
    parts.forEach((part, i) => {
      base += `/${part}`;
      const last = i === parts.length - 1;
      // a folder ends with "/"; the page keeps its query and fragment
      const folder = !last || url.pathname.endsWith("/");
      list.push({
        label: decode(part),
        url: folder ? `${base}/` : base + url.search + url.hash,
      });
    });
    return list;
  }

  function where(event) {
    if (event.button === 1 || event.ctrlKey || event.metaKey) {
      return "tab";
    }
    return event.shiftKey ? "window" : "current";
  }

  const feature = ZFFeature.attach(window, {
    name: "breadcrumbs",
    start(ctx) {
      const win = ctx.window;
      const urlbar = win.gURLBar;
      const box = urlbar?.inputField?.parentElement;
      if (!box) {
        return;
      }
      const row = ctx.element(
        "html:div",
        { class: "zf-breadcrumb", "aria-hidden": "true" },
        box,
      );
      ctx.attribute(urlbar, "zf-breadcrumbs");

      const render = () => {
        const list = crumbs(win.gBrowser.currentURI);
        row.replaceChildren();
        urlbar.toggleAttribute("zf-breadcrumbs-shown", list.length > 0);
        list.forEach((crumb, i) => {
          if (i) {
            const sep = win.document.createElementNS(
              "http://www.w3.org/1999/xhtml",
              "span",
            );
            sep.className = "zf-crumb-separator";
            row.append(sep);
          }
          const el = win.document.createElementNS(
            "http://www.w3.org/1999/xhtml",
            "span",
          );
          el.className = "zf-crumb";
          el.textContent = crumb.label;
          if (i === list.length - 1) {
            // the page itself: a click goes through to the address
            el.classList.add("zf-crumb-page");
          } else {
            el.title = crumb.url;
            el.dataset.url = crumb.url;
            if (i === 0) {
              el.classList.add("zf-crumb-site");
            }
          }
          row.append(el);
        });
        fit();
      };

      // Too long for the bar: the inner folders fold, from the site's side,
      // into one "…" segment that opens the last folded level.
      const fit = () => {
        row.querySelector(".zf-crumb-more")?.remove();
        for (const el of row.querySelectorAll("[hidden]")) {
          el.hidden = false;
        }
        const folders = [...row.querySelectorAll(".zf-crumb")].slice(1, -1);
        if (!row.clientWidth || row.scrollWidth <= row.clientWidth) {
          return;
        }
        const more = win.document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "span",
        );
        more.className = "zf-crumb zf-crumb-more";
        more.textContent = "…";
        const sep = folders[0]?.previousElementSibling;
        for (const folder of folders) {
          if (row.scrollWidth <= row.clientWidth) {
            break;
          }
          if (!more.isConnected) {
            sep.after(more, sep.cloneNode());
          }
          folder.hidden = true;
          folder.nextElementSibling.hidden = true;
          more.dataset.url = folder.dataset.url;
          more.title = folder.dataset.url;
        }
      };
      const resize = new win.ResizeObserver(() => fit());
      resize.observe(row);
      ctx.onCleanup(() => resize.disconnect());

      // The URL bar opens on mousedown: a segment keeps it closed.
      ctx.listen(row, "mousedown", (event) => {
        if (event.target.dataset?.url) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
      const open = (event) => {
        const url = event.target.dataset?.url;
        if (!url || event.button > 1) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        win.openTrustedLinkIn(url, where(event));
      };
      ctx.listen(row, "click", open);
      ctx.listen(row, "auxclick", open);

      // the selected tab's address (same-document changes included)
      const progress = {
        onLocationChange(webProgress) {
          if (webProgress.isTopLevel) {
            render();
          }
        },
      };
      win.gBrowser.addProgressListener(progress);
      ctx.onCleanup(() => win.gBrowser.removeProgressListener(progress));
      ctx.listen(win.gBrowser.tabContainer, "TabSelect", render);
      ctx.onCleanup(() => urlbar.removeAttribute("zf-breadcrumbs-shown"));
      render();
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
