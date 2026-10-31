// Zen Fluent Enhanced: focus sessions, as in Windows' Clock app.
//
// A timer button in Zen's sidebar bottom row opens the Focus panel: pick
// 15 to 90 minutes and start. While the session runs, the button draws its
// progress as a ring, the panel shows the time left in a large ring with
// +5 min and End session, and, as chosen in the panel (and in Sine):
//   - compact mode hides the sidebar in every window (the next startup
//     keeps its own setting: lib/zf-compact.sys.mjs);
//   - tabs that play sound are muted, the selected one aside;
//   - distracting sites (zen-fluent.enhanced.focus-session.sites) are
//     blocked: a tab that opens one goes back, with a message.
// When the time is up, a message and a system notification say so, and
// everything comes back as it was. The session's end time is a pref
// (zen-fluent.enhanced.focus-session.until), so all windows share it.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );
  const { setCompact } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-compact.sys.mjs",
  );

  const PREF = "zen-fluent.enhanced.focus-session";
  const UNTIL = `${PREF}.until`;
  const LENGTH = `${PREF}.length`; // the session's length, for the ring
  const DURATIONS = [15, 25, 45, 60, 90];
  const HTML = "http://www.w3.org/1999/xhtml";
  const ICON = "chrome://browser/skin/history.svg";

  const option = (name, fallback) =>
    Services.prefs.getBoolPref(`${PREF}.${name}`, fallback);
  const until = () => Number(Services.prefs.getStringPref(UNTIL, "")) || 0;
  const running = () => until() > Date.now();
  const sites = () =>
    Services.prefs
      .getStringPref(
        `${PREF}.sites`,
        "youtube.com,reddit.com,x.com,facebook.com,instagram.com,tiktok.com",
      )
      .split(/[\s,]+/)
      .map((site) =>
        site
          .trim()
          .replace(/^www\./, "")
          .toLowerCase(),
      )
      .filter(Boolean);
  const blocked = (host) => {
    host = host.toLowerCase().replace(/^www\./, "");
    return sites().some((site) => host === site || host.endsWith(`.${site}`));
  };

  const clock = (ms) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const feature = ZFFeature.attach(window, {
    name: "focus-session",
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
        id: "zf-focus-button",
        class: "toolbarbutton-1 chromeclass-toolbar-additional",
        label: "Focus",
        tooltiptext: "Focus session",
        image: ICON,
        removable: "false",
        skipintoolbarset: "true",
      });
      foot.insertBefore(button, doc.getElementById("zen-create-new-button"));

      const panel = ctx.element(
        "panel",
        {
          id: "zf-focus",
          type: "arrow",
          role: "dialog",
          "aria-label": "Focus session",
          orient: "vertical",
        },
        doc.getElementById("mainPopupSet"),
      );
      ctx.onCleanup(() => panel.hidePopup());
      const body = html("div", { class: "zf-fs-body" });
      panel.append(body);
      ctx.listen(button, "command", () =>
        panel.openPopup(button, "before_start"),
      );

      // -------- What a session changes in this window --------
      let session = null; // { compact, muted: Set }
      const begin = () => {
        if (session) {
          return;
        }
        session = { compact: false, muted: new Set() };
        if (option("compact", true)) {
          session.compact = setCompact(win, true);
        }
        if (option("mute", true)) {
          for (const tab of gBrowser.tabs) {
            muteIfNeeded(tab);
          }
        }
      };
      const end = () => {
        if (!session) {
          return;
        }
        if (session.compact) {
          setCompact(win, false);
        }
        for (const tab of session.muted) {
          if (tab.isConnected && tab.muted) {
            tab.toggleMuteAudio();
          }
        }
        session = null;
      };
      ctx.onCleanup(end);

      function muteIfNeeded(tab) {
        if (
          session &&
          option("mute", true) &&
          !tab.selected &&
          !tab.muted &&
          tab.hasAttribute("soundplaying")
        ) {
          tab.toggleMuteAudio();
          session.muted.add(tab);
        }
      }
      ctx.listen(gBrowser.tabContainer, "TabAttrModified", (event) => {
        if (event.detail.changed?.includes("soundplaying")) {
          muteIfNeeded(event.target);
        }
      });

      // Distracting sites: back to the previous page
      const guard = {
        onLocationChange(browser, webProgress, request, location) {
          if (
            !webProgress.isTopLevel ||
            !running() ||
            !option("block", true) ||
            !/^https?$/.test(location.scheme) ||
            !blocked(location.host)
          ) {
            return;
          }
          browser.stop();
          if (browser.canGoBack) {
            browser.goBack();
          } else {
            browser.loadURI(Services.io.newURI("about:blank"), {
              triggeringPrincipal:
                Services.scriptSecurityManager.getSystemPrincipal(),
            });
          }
          const time = new Date(until()).toLocaleTimeString(undefined, {
            timeStyle: "short",
          });
          showToast(win, `${location.host} is blocked until ${time}`);
        },
      };
      gBrowser.addTabsProgressListener(guard);
      ctx.onCleanup(() => gBrowser.removeTabsProgressListener(guard));

      // -------- The panel --------
      let minutes = Number(
        Services.prefs.getStringPref(`${PREF}.minutes`, "25"),
      );
      const ring = (fraction, size) => {
        const el = html("div", { class: `zf-fs-ring zf-fs-ring-${size}` });
        el.style.setProperty("--zf-fs-progress", String(fraction));
        return el;
      };

      const renderIdle = () => {
        const choices = html("div", {
          class: "zf-fs-durations",
          role: "radiogroup",
          "aria-label": "Length",
        });
        for (const value of DURATIONS) {
          const choice = html(
            "button",
            {
              class: "zf-fs-duration",
              role: "radio",
              "aria-checked": String(value === minutes),
            },
            `${value} min`,
          );
          choice.addEventListener("click", () => {
            minutes = value;
            Services.prefs.setStringPref(`${PREF}.minutes`, String(value));
            render();
          });
          choices.append(choice);
        }
        const check = (name, label) => {
          const row = html("label", { class: "zf-fs-check" });
          const box = html("input", { type: "checkbox" });
          box.checked = option(name, true);
          box.addEventListener("change", () =>
            Services.prefs.setBoolPref(`${PREF}.${name}`, box.checked),
          );
          row.append(box, html("span", {}, label));
          return row;
        };
        const list = html("input", {
          class: "zf-fs-sites",
          type: "text",
          "aria-label": "Sites to block",
          placeholder: "youtube.com, reddit.com",
        });
        list.value = sites().join(", ");
        list.addEventListener("change", () =>
          Services.prefs.setStringPref(`${PREF}.sites`, list.value),
        );
        const start = html(
          "button",
          { class: "zf-fs-primary" },
          "Start focus session",
        );
        start.addEventListener("click", () => {
          // compact mode would hide the panel's anchor anyway
          panel.hidePopup();
          Services.prefs.setStringPref(LENGTH, String(minutes * 60000));
          Services.prefs.setStringPref(
            UNTIL,
            String(Date.now() + minutes * 60000),
          );
        });
        body.replaceChildren(
          html("h2", { class: "zf-fs-title" }, "Focus session"),
          ring(0, "large"),
          choices,
          check("compact", "Hide the sidebar (compact mode)"),
          check("mute", "Mute tabs playing sound"),
          check("block", "Block distracting sites"),
          list,
          start,
        );
        body
          .querySelector(".zf-fs-ring")
          .append(
            html("span", { class: "zf-fs-time" }, clock(minutes * 60000)),
          );
      };

      const renderRunning = () => {
        const left = until() - Date.now();
        const length = Number(Services.prefs.getStringPref(LENGTH, "")) || left;
        const big = ring(1 - left / length, "large");
        big.append(
          html("span", { class: "zf-fs-time" }, clock(left)),
          html(
            "span",
            { class: "zf-fs-until" },
            `Until ${new Date(until()).toLocaleTimeString(undefined, { timeStyle: "short" })}`,
          ),
        );
        const more = html("button", { class: "zf-fs-secondary" }, "+5 min");
        more.addEventListener("click", () => {
          Services.prefs.setStringPref(UNTIL, String(until() + 5 * 60000));
          Services.prefs.setStringPref(
            LENGTH,
            String(
              (Number(Services.prefs.getStringPref(LENGTH, "")) || 0) +
                5 * 60000,
            ),
          );
        });
        const stop = html(
          "button",
          { class: "zf-fs-secondary" },
          "End session",
        );
        stop.addEventListener("click", () => finish(false));
        const actions = html("div", { class: "zf-fs-actions" });
        actions.append(more, stop);
        body.replaceChildren(
          html("h2", { class: "zf-fs-title" }, "Focusing"),
          big,
          actions,
        );
      };

      function render() {
        if (running()) {
          renderRunning();
        } else {
          renderIdle();
        }
      }
      ctx.listen(panel, "popupshowing", (event) => {
        if (event.target === panel) {
          render();
        }
      });

      // -------- The clock --------
      function finish(done) {
        Services.prefs.clearUserPref(UNTIL);
        Services.prefs.clearUserPref(LENGTH);
        if (done) {
          // the first window whose clock sees the end tells, in the front one
          showToast(
            Services.wm.getMostRecentWindow("navigator:browser") ?? win,
            "Focus session complete",
          );
          try {
            Cc["@mozilla.org/alerts-service;1"]
              .getService(Ci.nsIAlertsService)
              .showAlertNotification(
                ICON,
                "Focus session complete",
                "Time for a break.",
              );
          } catch {
            // no system notifications: the message is enough
          }
        }
      }

      let ticker = 0;
      const tick = () => {
        if (!running()) {
          if (until()) {
            finish(true);
          }
          return;
        }
        const left = until() - Date.now();
        const length = Number(Services.prefs.getStringPref(LENGTH, "")) || left;
        button.style.setProperty("--zf-fs-progress", String(1 - left / length));
        button.setAttribute(
          "tooltiptext",
          `Focus session: ${clock(left)} left`,
        );
        if (panel.state === "open") {
          const time = panel.querySelector(".zf-fs-time");
          const big = panel.querySelector(".zf-fs-ring");
          if (time && big && body.querySelector(".zf-fs-until")) {
            time.textContent = clock(left);
            big.style.setProperty(
              "--zf-fs-progress",
              String(1 - left / length),
            );
          }
        }
      };
      const sync = () => {
        win.clearInterval(ticker);
        if (running()) {
          button.setAttribute("zf-running", "");
          begin();
          ticker = win.setInterval(tick, 1000);
          tick();
        } else {
          button.removeAttribute("zf-running");
          button.style.removeProperty("--zf-fs-progress");
          button.setAttribute("tooltiptext", "Focus session");
          end();
        }
        if (panel.state === "open") {
          render();
        }
      };
      ctx.onCleanup(() => win.clearInterval(ticker));
      ctx.observePref(UNTIL, sync);
      sync();
      // a session that ended while Zen was closed
      if (!running() && until()) {
        Services.prefs.clearUserPref(UNTIL);
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
