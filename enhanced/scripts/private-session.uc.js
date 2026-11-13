// Zen Fluent Enhanced: a private session card in the sidebar of private windows.
//
// The card (order 10 in the column of sidebar cards, lib/zf-cards.sys.mjs)
// says how long the private session has lasted and how many trackers were
// blocked in this window, and ends the session: End session (a second
// click confirms) closes the other private windows and every tab, clears
// the private session's data and leaves one fresh private tab.
//
// End session takes the steps of Firefox's own button (ResetPBMPanel's
// _restartPBM, off in Zen: browser.privatebrowsing.resetPBM.enabled is
// false). Its function cannot be called as it is: once the data is
// cleared, it anchors its confirmation on that toolbar button, which Zen
// never creates, and throws. zen-fluent.enhanced.private-session.clipboard
// (off by default) also empties the clipboard. The tracker count is a set of blocked origins
// kept in memory for the window; nothing is written to disk and no request
// is made.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs",
  );
  const { addCard } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-cards.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );
  const { t } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs",
  );

  const ICON = "chrome://sine/content/Zen-Fluent-Enhanced/icons/private.svg";
  const HTML = "http://www.w3.org/1999/xhtml";
  const CLIPBOARD_PREF = "zen-fluent.enhanced.private-session.clipboard";
  const CONFIRM_MS = 4000;
  const REFRESH_MS = 20000;

  // What a content blocking log entry counts as a blocked tracker (the
  // states Firefox's protections panel lists as blocked)
  const WPL = Ci.nsIWebProgressListener;
  const BLOCKED = [
    "STATE_BLOCKED_TRACKING_CONTENT",
    "STATE_BLOCKED_FINGERPRINTING_CONTENT",
    "STATE_BLOCKED_CRYPTOMINING_CONTENT",
    "STATE_BLOCKED_SOCIALTRACKING_CONTENT",
    "STATE_BLOCKED_EMAILTRACKING_CONTENT",
    "STATE_COOKIES_BLOCKED_TRACKER",
    "STATE_COOKIES_BLOCKED_SOCIALTRACKER",
  ].reduce((mask, name) => mask | (WPL[name] ?? 0), 0);

  const privateWindows = () =>
    [...Services.wm.getEnumerator("navigator:browser")].filter(
      (w) => !w.closed && PrivateBrowsingUtils.isWindowPrivate(w),
    );

  /** When the private session began: its oldest open window, or its last End session. */
  const sessionStart = () =>
    Math.min(
      ...privateWindows().map(
        (w) => w.zfPrivateSince ?? w.performance.timeOrigin,
      ),
    );

  const feature = ZFFeature.attach(window, {
    name: "private-session",
    default: true,
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      if (!PrivateBrowsingUtils.isWindowPrivate(win)) {
        return;
      }
      // Kept on the window (memory only) so that a rerun of the script
      // keeps the count; it goes with the window
      win.zfPrivateTrackers ??= new Set();
      const trackers = win.zfPrivateTrackers;

      const card = addCard(ctx, { id: "zf-private-session", order: 10 });
      if (!card) {
        return;
      }
      const el = (tag, attributes, parent) => {
        const node = tag.startsWith("html:")
          ? doc.createElementNS(HTML, tag.slice(5))
          : doc.createXULElement(tag);
        for (const [key, value] of Object.entries(attributes)) {
          node.setAttribute(key, value);
        }
        parent.append(node);
        return node;
      };
      el(
        "image",
        { class: "zf-card-icon", src: ICON, "aria-hidden": "true" },
        card,
      );
      const text = el("vbox", { class: "zf-card-text" }, card);
      // The title, and how long at the end of its line; the trackers under
      // it (the sidebar is too narrow for both on one line)
      const head = el("hbox", { class: "zf-ps-head", align: "center" }, text);
      const title = el("label", { class: "zf-card-title", crop: "end" }, head);
      title.textContent = "Private session";
      const time = el("label", { class: "zf-ps-time" }, head);
      const count = el(
        "label",
        { class: "zf-card-detail zf-ps-trackers", crop: "end" },
        text,
      );
      const actions = el("hbox", { class: "zf-card-actions" }, text);
      const end = el(
        "html:button",
        { class: "zf-card-button zf-ps-end", type: "button" },
        actions,
      );
      end.textContent = "End session";

      const duration = () => {
        const minutes = Math.floor((Date.now() - sessionStart()) / 60000);
        if (!Number.isFinite(minutes) || minutes < 0) {
          return "";
        }
        if (minutes < 1) {
          return "< 1 min";
        }
        if (minutes < 60) {
          return `${minutes} min`;
        }
        return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
      };

      const render = () => {
        time.textContent = duration();
        time.hidden = !time.textContent;
        const n = trackers.size;
        count.textContent =
          n === 1 ? "1 tracker blocked" : `${n} trackers blocked`;
        // No tracker blocked yet says nothing worth the room
        count.hidden = n === 0;
        card.hidden = false;
        const parts = [title.textContent, time.textContent];
        if (n) {
          parts.push(count.textContent);
        }
        card.setAttribute(
          "tooltiptext",
          parts
            .filter(Boolean)
            .map((part) => t(part))
            .join(" · "),
        );
      };

      // Trackers: every blocked origin of the window's pages, read again
      // from the page's content blocking log whenever it changes
      let running = true;
      ctx.onCleanup(() => (running = false));
      const collect = async (browser) => {
        let log;
        try {
          log = JSON.parse(await browser.getContentBlockingLog());
        } catch {
          return;
        }
        const before = trackers.size;
        for (const [origin, entries] of Object.entries(log ?? {})) {
          if (
            entries.some(
              ([state, blocked]) => blocked && (state & BLOCKED) !== 0,
            )
          ) {
            trackers.add(origin);
          }
        }
        if (trackers.size !== before && running) {
          render();
        }
      };
      const listener = {
        onContentBlockingEvent(browser) {
          collect(browser);
        },
      };
      win.gBrowser.addTabsProgressListener(listener);
      ctx.onCleanup(() => win.gBrowser.removeTabsProgressListener(listener));
      for (const browser of win.gBrowser.browsers) {
        collect(browser);
      }

      // End session: a second click within a few seconds confirms
      let confirming = 0;
      const disarm = () => {
        win.clearTimeout(confirming);
        confirming = 0;
        end.textContent = "End session";
        end.removeAttribute("zf-confirm");
      };
      ctx.onCleanup(() => win.clearTimeout(confirming));
      ctx.listen(end, "click", async () => {
        if (!confirming) {
          end.textContent = "Click again to end";
          end.setAttribute("zf-confirm", "");
          confirming = win.setTimeout(disarm, CONFIRM_MS);
          return;
        }
        disarm();
        end.disabled = true;
        try {
          await endSession(win);
          trackers.clear();
          showToast(win, t("Private session ended"));
        } catch (error) {
          console.error("[Zen Fluent Enhanced] private-session", error);
          showToast(win, t("The private session could not be ended"));
        } finally {
          end.disabled = false;
          if (running) {
            render();
          }
        }
      });

      ctx.interval(render, REFRESH_MS);
      render();
    },
  });

  /**
   * Firefox's "end private session" steps (ResetPBMPanel._restartPBM),
   * without its confirmation hint.
   *
   * @param {Window} win - The private window that stays.
   */
  async function endSession(win) {
    // The browser window's own reference (its module moved to moz-src:)
    const { SessionStore } = win;
    // 1. The other private windows close, without beforeunload prompts or
    //    the tab close warning
    for (const other of privateWindows()) {
      if (other !== win) {
        other.closeWindow?.(true, null, "restart-pbm");
      }
    }
    // 2. A fresh tab, then every other one goes, kept out of the closed
    //    tabs list. Zen keeps a blank tab in each window for its new tab
    //    (zen.urlbar.replace-newtab), and never closes it: that one is the
    //    fresh tab, as in a new private window. Otherwise Firefox's new tab.
    const gBrowser = win.gBrowser;
    const empty = win.gZenWorkspaces?._emptyTab;
    let fresh =
      empty?.isConnected &&
      !empty.closing &&
      win.gZenVerticalTabsManager?._canReplaceNewTab
        ? empty
        : null;
    fresh ??= gBrowser.addTab(win.BROWSER_NEW_TAB_URL, {
      triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
    });
    if (!fresh) {
      throw new Error("Could not open a new tab");
    }
    gBrowser.selectedTab = fresh;
    gBrowser.removeAllTabsBut(fresh, {
      skipPermitUnload: true,
      skipSessionStore: true,
      animate: false,
      skipWarnAboutClosingTabs: true,
      skipPinnedOrSelectedTabs: false,
    });
    win.SidebarController?.hide();
    // 3. The window's session data, closed tabs included
    SessionStore.purgeDataForPrivateWindow(win);
    // 4. Cookies, storage, cache… of the private session
    await new Promise((resolve) => {
      Services.clearData.clearPrivateBrowsingData({
        onDataDeleted(failed) {
          if (failed) {
            console.error(
              "[Zen Fluent Enhanced] private-session: clearing failed, flags",
              failed,
            );
          }
          resolve();
        },
      });
    });
    // 5. On request, the clipboard (whatever it holds, from any app): on
    //    Windows emptyClipboard is OleSetClipboard(NULL)
    if (Services.prefs.getBoolPref(CLIPBOARD_PREF, false)) {
      Services.clipboard.emptyClipboard(Ci.nsIClipboard.kGlobalClipboard);
    }
    win.zfPrivateSince = Date.now();
  }

  window.addUnloadListener?.(() => feature.destroy());
}
