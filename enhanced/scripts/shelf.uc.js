// Zen Fluent Enhanced: widgets and a shelf, in a panel of their own.
//
// A button in Zen's sidebar bottom row (or Ctrl+Alt+Shift+W, or the
// Command Palette) opens a board like Windows' widgets:
//   - the time and the date;
//   - what is playing: the tabs playing sound, to go to or to mute;
//   - the last downloads, to open;
//   - the shelf: links, text and images kept for later. Drop them on the
//     shelf (or on the button: the board opens), or add the current page.
//     A click opens a link or an image in a new tab and copies a text;
//     items can be dragged out again; × takes one away.
// The shelf is a JSON file in the profile (zen-fluent-shelf.json, written
// through a temporary file), shared by every window.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );
  const { Downloads } = ChromeUtils.importESModule(
    "resource://gre/modules/Downloads.sys.mjs",
  );

  const HTML = "http://www.w3.org/1999/xhtml";
  const ICON =
    "chrome://sine/content/Zen-Fluent-Enhanced/icons/fluent/apps.svg";
  const DEFAULT_ICON = "chrome://global/skin/icons/defaultFavicon.svg";
  const TOPIC = "zf-shelf-changed";
  const MAX_ITEMS = 100;
  const IMAGE = /\.(png|jpe?g|gif|webp|avif|svg|bmp)(\?|#|$)/i;

  // -------- The shelf file --------
  const file = () =>
    PathUtils.join(PathUtils.profileDir, "zen-fluent-shelf.json");
  async function load() {
    try {
      const items = await IOUtils.readJSON(file());
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }
  async function save(items) {
    await IOUtils.writeJSON(file(), items.slice(0, MAX_ITEMS), {
      tmpPath: `${file()}.tmp`,
    });
    Services.obs.notifyObservers(null, TOPIC);
  }
  async function add(item) {
    const items = await load();
    const same = (other) =>
      (item.url && other.url === item.url) ||
      (item.text && other.text === item.text);
    await save([
      {
        ...item,
        id: Services.uuid.generateUUID().toString(),
        added: Date.now(),
      },
      ...items.filter((other) => !same(other)),
    ]);
  }
  async function remove(id) {
    await save((await load()).filter((item) => item.id !== id));
  }

  /** A shelf item from dropped data, or null. */
  function fromDrop(dataTransfer) {
    const types = [...dataTransfer.types];
    const mozUrl = dataTransfer.getData("text/x-moz-url");
    if (mozUrl) {
      const [url, title] = mozUrl.split("\n");
      const image =
        types.includes("application/x-moz-nativeimage") || IMAGE.test(url);
      return { type: image ? "image" : "link", url, title: title || url };
    }
    const list = dataTransfer.getData("text/uri-list");
    if (list) {
      const url = list.split(/\r?\n/).find((l) => l && !l.startsWith("#"));
      if (url) {
        return { type: IMAGE.test(url) ? "image" : "link", url, title: url };
      }
    }
    const text = dataTransfer.getData("text/plain").trim();
    if (text) {
      return URL.canParse(text) && /^https?:/.test(text)
        ? { type: "link", url: text, title: text }
        : { type: "text", text };
    }
    return null;
  }

  const host = (url) => {
    try {
      return new URL(url).host.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const feature = ZFFeature.attach(window, {
    name: "shelf",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const gBrowser = win.gBrowser;
      const foot = doc.getElementById("zen-sidebar-foot-buttons");
      if (!foot) {
        return;
      }
      const html = (tag, attributes = {}, text = "") => {
        const el = doc.createElementNS(HTML, tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      const button = ctx.element("toolbarbutton", {
        id: "zf-shelf-button",
        class: "toolbarbutton-1 chromeclass-toolbar-additional",
        label: "Widgets and shelf",
        tooltiptext: "Widgets and shelf",
        image: ICON,
        removable: "false",
        skipintoolbarset: "true",
      });
      foot.insertBefore(button, doc.getElementById("zen-create-new-button"));

      const panel = ctx.element(
        "panel",
        {
          id: "zf-shelf",
          type: "arrow",
          role: "dialog",
          "aria-label": "Widgets and shelf",
          orient: "vertical",
        },
        doc.getElementById("mainPopupSet"),
      );
      ctx.onCleanup(() => panel.hidePopup());
      const body = html("div", { class: "zf-sh-body" });
      panel.append(body);
      const openPanel = () => {
        if (panel.state === "closed") {
          panel.openPopup(button, "before_start");
        }
      };
      ctx.listen(button, "command", openPanel);

      // -------- Widgets --------
      const clock = html("section", { class: "zf-sh-widget zf-sh-clock" });
      const time = html("span", { class: "zf-sh-time" });
      const date = html("span", { class: "zf-sh-date" });
      clock.append(time, date);
      const timeFormat = new Intl.DateTimeFormat(undefined, {
        timeStyle: "short",
      });
      const dateFormat = new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
      });
      const tickClock = () => {
        const now = new Date();
        time.textContent = timeFormat.format(now);
        date.textContent = dateFormat.format(now);
      };

      const playing = html("section", { class: "zf-sh-widget" });
      const renderPlaying = () => {
        const tabs = gBrowser.tabs.filter(
          (tab) => tab.hasAttribute("soundplaying") || tab.muted,
        );
        const rows = tabs.slice(0, 3).map((tab) => {
          const row = html("div", { class: "zf-sh-row" });
          const go = html("button", {
            class: "zf-sh-main",
            title: "Go to the tab",
          });
          go.append(
            html("img", {
              src: tab.getAttribute("image") || DEFAULT_ICON,
              alt: "",
            }),
            html("span", { class: "zf-sh-label" }, tab.label),
          );
          go.addEventListener("click", () => {
            panel.hidePopup();
            gBrowser.selectedTab = tab;
          });
          const mute = html(
            "button",
            { class: "zf-sh-small" },
            tab.muted ? "Unmute" : "Mute",
          );
          mute.addEventListener("click", () => {
            tab.toggleMuteAudio();
            renderPlaying();
          });
          row.append(go, mute);
          return row;
        });
        playing.replaceChildren(
          html("h3", {}, "Now playing"),
          ...(rows.length
            ? rows
            : [html("p", { class: "zf-sh-empty" }, "Nothing is playing.")]),
        );
      };

      const downloads = html("section", { class: "zf-sh-widget" });
      const renderDownloads = async () => {
        let list = [];
        try {
          list = await (await Downloads.getList(Downloads.ALL)).getAll();
        } catch {
          // no downloads list (private window): left empty
        }
        const rows = list
          .sort((a, b) => b.startTime - a.startTime)
          .slice(0, 3)
          .map((download) => {
            const row = html("div", { class: "zf-sh-row" });
            const open = html("button", { class: "zf-sh-main" });
            const name = PathUtils.filename(download.target.path);
            const state = download.succeeded
              ? "Done"
              : download.hasProgress && !download.stopped
                ? `${download.progress} %`
                : download.error
                  ? "Failed"
                  : download.canceled
                    ? "Canceled"
                    : "";
            open.append(
              html("img", { src: `moz-icon://${name}?size=16`, alt: "" }),
              html("span", { class: "zf-sh-label" }, name),
            );
            open.disabled = !download.succeeded;
            open.title = download.succeeded ? "Open" : "";
            open.addEventListener("click", () => {
              panel.hidePopup();
              download.launch().catch(() => {});
            });
            row.append(open, html("span", { class: "zf-sh-meta" }, state));
            return row;
          });
        downloads.replaceChildren(
          html("h3", {}, "Downloads"),
          ...(rows.length
            ? rows
            : [html("p", { class: "zf-sh-empty" }, "No downloads yet.")]),
        );
      };

      // -------- The shelf --------
      const shelf = html("section", { class: "zf-sh-widget zf-sh-shelf" });
      const shelfHeader = html("div", { class: "zf-sh-shelf-header" });
      const addPage = html("button", { class: "zf-sh-small" }, "Add this page");
      addPage.addEventListener("click", () => {
        const url = gBrowser.currentURI.spec;
        if (/^(https?|file):/.test(url)) {
          add({
            type: "link",
            url,
            title:
              gBrowser.selectedBrowser.contentTitle ||
              gBrowser.selectedTab.label,
          });
        } else {
          showToast(win, "Only web pages can go on the shelf");
        }
      });
      shelfHeader.append(html("h3", {}, "Shelf"), addPage);
      const items = html("ul", { class: "zf-sh-items" });
      const drop = html(
        "p",
        { class: "zf-sh-drop" },
        "Drop links, text or images here",
      );
      shelf.append(shelfHeader, items, drop);

      const renderShelf = async () => {
        const list = await load();
        items.replaceChildren(
          ...list.map((item) => {
            const li = html("li", {
              class: `zf-sh-item zf-sh-${item.type}`,
              draggable: "true",
              tabindex: "0",
              title: item.url ?? item.text,
            });
            if (item.type === "image") {
              li.append(
                html("img", { class: "zf-sh-thumb", src: item.url, alt: "" }),
              );
            } else if (item.type === "link") {
              li.append(
                html("img", { src: `page-icon:${item.url}`, alt: "" }),
                html("span", { class: "zf-sh-label" }, item.title),
                html("span", { class: "zf-sh-meta" }, host(item.url)),
              );
            } else {
              li.append(html("span", { class: "zf-sh-quote" }, item.text));
            }
            const close = html("button", {
              class: "zf-sh-remove",
              title: "Take off the shelf",
              "aria-label": "Take off the shelf",
            });
            close.addEventListener("click", (event) => {
              event.stopPropagation();
              remove(item.id);
            });
            li.append(close);
            const use = () => {
              if (item.url) {
                win.openTrustedLinkIn(item.url, "tab");
              } else {
                Cc["@mozilla.org/widget/clipboardhelper;1"]
                  .getService(Ci.nsIClipboardHelper)
                  .copyString(item.text);
                showToast(win, "Text copied");
              }
            };
            li.addEventListener("click", use);
            li.addEventListener("keydown", (event) => {
              if (event.key === "Enter") {
                use();
              } else if (event.key === "Delete") {
                remove(item.id);
              }
            });
            li.addEventListener("dragstart", (event) => {
              const dt = event.dataTransfer;
              if (item.url) {
                dt.setData(
                  "text/x-moz-url",
                  `${item.url}\n${item.title ?? item.url}`,
                );
                dt.setData("text/uri-list", item.url);
                dt.setData("text/plain", item.url);
              } else {
                dt.setData("text/plain", item.text);
              }
              dt.effectAllowed = "copyLink";
            });
            return li;
          }),
        );
        drop.textContent = list.length
          ? "Drop links, text or images here"
          : "The shelf is empty. Drop links, text or images here, or add this page.";
      };

      const accept = (event) => {
        // not the shelf's own items
        if (event.dataTransfer.mozSourceNode?.closest?.("#zf-shelf")) {
          return false;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        return true;
      };
      ctx.listen(shelf, "dragover", (event) => {
        if (accept(event)) {
          shelf.setAttribute("zf-drop-over", "");
        }
      });
      ctx.listen(shelf, "dragleave", (event) => {
        if (!shelf.contains(event.relatedTarget)) {
          shelf.removeAttribute("zf-drop-over");
        }
      });
      ctx.listen(shelf, "drop", (event) => {
        shelf.removeAttribute("zf-drop-over");
        if (!accept(event)) {
          return;
        }
        const item = fromDrop(event.dataTransfer);
        if (item) {
          add(item);
        }
      });
      // dragging over the button opens the board, as the taskbar does
      let dragTimer = 0;
      ctx.listen(button, "dragenter", () => {
        win.clearTimeout(dragTimer);
        dragTimer = win.setTimeout(openPanel, 400);
      });
      ctx.listen(button, "dragleave", () => win.clearTimeout(dragTimer));
      ctx.onCleanup(() => win.clearTimeout(dragTimer));

      body.append(clock, playing, downloads, shelf);

      let clockTimer = 0;
      ctx.listen(panel, "popupshowing", (event) => {
        if (event.target !== panel) {
          return;
        }
        tickClock();
        clockTimer = win.setInterval(tickClock, 15000);
        renderPlaying();
        renderDownloads();
        renderShelf();
      });
      ctx.listen(panel, "popuphidden", (event) => {
        if (event.target === panel) {
          win.clearInterval(clockTimer);
        }
      });
      ctx.onCleanup(() => win.clearInterval(clockTimer));
      ctx.observe(TOPIC, () => {
        if (panel.state === "open") {
          renderShelf();
        }
      });

      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyW" &&
            event.ctrlKey &&
            event.altKey &&
            event.shiftKey &&
            !event.metaKey &&
            !event.repeat
          ) {
            event.preventDefault();
            event.stopPropagation();
            openPanel();
          }
        },
        true,
      );
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
