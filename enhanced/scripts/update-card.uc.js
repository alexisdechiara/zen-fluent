// Zen Fluent Enhanced: a card in the sidebar when Zen Fluent was updated, Zen's own.
//
// The first start after an update (lib/zf-updates.sys.mjs: the version in
// the mods' theme.json against zen-fluent.enhanced.update-card.seen) shows
// Zen's sidebar notification, the card Zen shows after its own updates
// (ZenUpdates.mjs): a heading with the version, What's new (the version's
// release notes on GitHub) and Settings (Zen Fluent's settings page, when
// that feature is on), hidden after 15 s like Zen's (the countdown stops
// while the pointer is over it). Built from the element Zen defined
// (customElements, zen-sidebar-notification) with the arguments
// createSidebarNotification takes: importing Zen's module from here would
// evaluate it a second time and fail to define the element again.
//
// Once per update, in one normal window (never a private one). The first
// run records the version silently (the welcome tour does that job).
// While Zen's own card shows, this one waits for it to close: two cards
// stacked would cover the tabs. A collapsed sidebar (Zen gives no card
// then) waits for it to expand. Without the element (another Zen version),
// a toast says it instead. Labels: enhanced/l10n/<locale>/zen-fluent-enhanced.ftl,
// the version passed to the heading as a Fluent argument.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { takeUpdate, releaseUpdate, markSeen, notesUrl, useFluent } =
    ChromeUtils.importESModule(
      "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-updates.sys.mjs",
    );
  const { openSettings } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-settings.sys.mjs",
  );
  const { showToast } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-toast.sys.mjs",
  );
  const { t } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs",
  );

  const ELEMENT = "zen-sidebar-notification";
  const MARK = "zf-update-card";
  const EXPANDED = "zen.view.sidebar-expanded";
  const SETTINGS_PAGE = "zen-fluent.enhanced.settings-page";
  // As Zen's update card (ZEN_UPDATE_NOTIFICATION_TIMEOUT_MS)
  const AUTO_HIDE_MS = 15000;
  // After Zen's own startup work (its update card comes first)
  const SETTLE_MS = 3000;
  const ICONS = "chrome://browser/skin/zen-icons/";

  const feature = ZFFeature.attach(window, {
    name: "update-card",
    default: true,
    private: false,
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      let version = null;
      let card = null;
      let shown = false;
      let stopped = false;

      // The version is only recorded as seen once the card has gone by
      // itself (its countdown, its close button, a link): a card taken
      // away with the feature (Sine rerunning the scripts, the window
      // closing) shows again
      let told = false;
      const tell = () => {
        if (!told) {
          told = true;
          markSeen(version);
        }
      };
      ctx.onCleanup(() => {
        stopped = true;
        if (card?.isConnected) {
          card.remove();
        }
        if (version && !told) {
          releaseUpdate(version);
        }
      });

      const wait = (ms) => new Promise((resolve) => ctx.timeout(resolve, ms));

      // Zen's own card (not ours) still in the sidebar
      const zenCard = () =>
        [...doc.getElementsByTagName(ELEMENT)].find(
          (el) => !el.hasAttribute(MARK),
        );

      const openNotes = () =>
        win.openLinkIn(notesUrl(version), "tab", {
          triggeringPrincipal:
            Services.scriptSecurityManager.getSystemPrincipal(),
          forceForeground: true,
        });

      const links = () => {
        const list = [
          {
            url: notesUrl(version),
            l10nId: "zf-update-card-notes",
            icon: `${ICONS}sparkles.svg`,
            special: true,
          },
        ];
        if (Services.prefs.getBoolPref(SETTINGS_PAGE, true)) {
          list.push({
            // Zen only closes the card itself for a link with a url
            action: () => {
              openSettings(win);
              tell();
              card?.remove();
            },
            l10nId: "zf-update-card-settings",
            icon: `${ICONS}settings.svg`,
          });
        }
        return list;
      };

      const toast = () => {
        showToast(win, t("Zen Fluent updated to {0}").replace("{0}", version), {
          action: { label: t("What's new"), run: openNotes },
        });
        tell();
      };

      // Zen's card, as createSidebarNotification makes it, after the media
      // controls; nothing while the sidebar is collapsed (Zen gives none then)
      const show = async () => {
        const Card = win.customElements.get(ELEMENT);
        const anchor = doc.getElementById("zen-media-controls-toolbar");
        if (!Card || !anchor || !win.gZenVerticalTabsManager) {
          shown = true;
          toast();
          return;
        }
        if (!win.gZenVerticalTabsManager._prefsSidebarExpanded) {
          return;
        }
        shown = true;
        useFluent(doc);
        card = new Card({
          headingL10nId: "zf-update-card-heading",
          links: links(),
          autoHideMs: AUTO_HIDE_MS,
        });
        card.setAttribute(MARK, "");
        anchor.insertAdjacentElement("afterend", card);
        if (!anchor.parentElement) {
          tell();
        }
        // The heading takes the version: Lit leaves data-l10n-args alone,
        // and the shadow root is connected to the document's localization
        await card.updateComplete;
        const heading = card.shadowRoot?.querySelector(
          ".zen-sidebar-notification-heading",
        );
        if (heading) {
          doc.l10n.setArgs(heading, { version });
        }
      };

      const tryShow = () => {
        // Our card left the sidebar by itself: the user was told
        if (shown && card && !card.isConnected && !stopped) {
          tell();
        }
        if (stopped || shown || zenCard()) {
          return;
        }
        show().catch((error) => {
          console.error("[Zen Fluent Enhanced] update-card", error);
        });
      };

      (async () => {
        await win.delayedStartupPromise;
        await win.gZenWorkspaces?.promiseInitialized;
        await wait(SETTLE_MS);
        if (stopped) {
          return;
        }
        version = await takeUpdate(win);
        if (version && stopped) {
          releaseUpdate(version);
        }
        if (!version || stopped) {
          return;
        }
        // Zen's own card first: ours comes once it has closed
        const parent = doc.getElementById(
          "zen-media-controls-toolbar",
        )?.parentElement;
        if (parent) {
          ctx.mutations(parent, { childList: true }, tryShow);
        }
        // A collapsed sidebar expands: the card can show
        ctx.observePref(EXPANDED, () => ctx.timeout(tryShow, 0));
        tryShow();
      })().catch((error) => {
        console.error("[Zen Fluent Enhanced] update-card", error);
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
