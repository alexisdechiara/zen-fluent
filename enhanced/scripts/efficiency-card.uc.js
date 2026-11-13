// Zen Fluent Enhanced: an efficiency card in the sidebar, as Edge's
// efficiency mode and performance detector.
//
// The card only shows when it has something to say (lib/zf-efficiency.sys.mjs
// has the exact rules): the computer is on battery and low ("Battery at
// 18%"), or Zen uses a lot of memory ("Zen is using 3.4 GB"). Its button
// puts to sleep the tabs of this window that the Sleeping tabs feature
// would (lib/zf-sleep.sys.mjs: never the selected tab, sound, camera,
// microphone or screen sharing, Picture-in-Picture, Glance, the split view
// on screen, a page that would ask before leaving); the card then says how
// many for a moment and goes. With no tab to put to sleep the card stays
// hidden: it would have nothing to offer. Performance opens the panel of
// the Sleeping tabs feature while that one is on. The close button
// dismisses the card until its condition ends and comes back; putting
// tabs to sleep dismisses it the same way.
//
// It sits in the column of sidebar cards (lib/zf-cards.sys.mjs), order 30.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { addCard } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-cards.sys.mjs",
  );
  const { canSleep, sleepTabs } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-sleep.sys.mjs",
  );
  const efficiency = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-efficiency.sys.mjs",
  );
  const { t } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs",
  );

  const ICONS = "chrome://sine/content/Zen-Fluent-Enhanced/icons/";
  const HTML = "http://www.w3.org/1999/xhtml";
  // How long the card says what it did
  const DONE_MS = 4000;

  const feature = ZFFeature.attach(window, {
    name: "efficiency-card",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const gBrowser = win.gBrowser;

      const card = addCard(ctx, {
        id: "zf-efficiency-card",
        order: 30,
        role: "status",
        live: "polite",
      });
      if (!card) {
        return;
      }
      const xul = (tag, attributes, parent) => {
        const node = doc.createXULElement(tag);
        for (const [key, value] of Object.entries(attributes)) {
          node.setAttribute(key, value);
        }
        parent.append(node);
        return node;
      };
      const button = (attributes, text, parent) => {
        const node = doc.createElementNS(HTML, "button");
        for (const [key, value] of Object.entries(attributes)) {
          node.setAttribute(key, value);
        }
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const icon = xul(
        "image",
        { class: "zf-card-icon", "aria-hidden": "true" },
        card,
      );
      const text = xul("vbox", { class: "zf-card-text" }, card);
      const title = xul("label", { class: "zf-card-title", crop: "end" }, text);
      // The detail may take two lines: a narrow sidebar cuts it otherwise
      const detail = xul("description", { class: "zf-card-detail" }, text);
      const actions = xul("hbox", { class: "zf-card-actions" }, card);
      // A row of its own under the text, as wide as the card
      const buttons = xul("hbox", { class: "zf-efficiency-buttons" }, card);
      const sleepButton = button(
        { class: "zf-card-button zf-efficiency-sleep" },
        "",
        buttons,
      );
      const performanceButton = button(
        { class: "zf-card-button zf-efficiency-performance" },
        "Performance",
        buttons,
      );
      const close = button(
        {
          class: "zf-card-button zf-efficiency-close",
          title: "Dismiss",
          "aria-label": "Dismiss",
        },
        "",
        actions,
      );

      // Numbers and units in the interface's language ("3,4 Go" in
      // French), the number never apart from its unit
      const locales = Services.locale.appLocalesAsBCP47;
      const size = (bytes) => {
        const gb = bytes >= 1024 ** 3;
        return new Intl.NumberFormat(locales, {
          style: "unit",
          unit: gb ? "gigabyte" : "megabyte",
          minimumFractionDigits: gb ? 1 : 0,
          maximumFractionDigits: gb ? 1 : 0,
        })
          .format(gb ? bytes / 1024 ** 3 : bytes / 1024 ** 2)
          .replace(/\s/g, "\u00a0");
      };
      const percent = (n) =>
        new Intl.NumberFormat(locales, { style: "percent" }).format(n / 100);
      const sleepable = () => gBrowser.tabs.filter((tab) => canSleep(win, tab));

      // What this window did: { count, until } while the card says it
      let done = null;

      const render = () => {
        const s = efficiency.state();
        const battery = s.batteryLow && !s.muted.battery;
        const memory = s.memoryHigh && !s.muted.memory;
        const showDone = done && Date.now() < done.until;
        // The tabs are only gone through when a condition may show the card
        const n = battery || memory ? sleepable().length : 0;
        card.hidden = !showDone && (!(battery || memory) || n === 0);
        card.toggleAttribute("zf-simulated", s.simulated);
        if (card.hidden) {
          card.removeAttribute("zf-state");
          card.removeAttribute("tooltiptext");
          return;
        }
        const kind = showDone ? "done" : battery ? "battery" : "memory";
        card.setAttribute("zf-state", kind);
        icon.setAttribute(
          "src",
          kind === "battery"
            ? `${ICONS}battery-low.svg`
            : `${ICONS}fluent/${kind === "done" ? "checkbox-checked" : "heart-pulse"}.svg`,
        );
        const used = s.total === null ? "" : `Zen is using ${size(s.total)}`;
        if (showDone) {
          title.textContent = done.count
            ? `${done.count} ${done.count === 1 ? "tab is" : "tabs are"} sleeping now`
            : "No tab could sleep";
          detail.textContent = "";
        } else if (battery) {
          title.textContent = `Battery at ${percent(s.percent)}`;
          detail.textContent =
            memory && used ? used : "Sleeping tabs saves battery";
        } else {
          title.textContent = used;
          detail.textContent = "Sleeping tabs frees memory";
        }
        detail.hidden = !detail.textContent;
        buttons.hidden = showDone;
        close.hidden = showDone;
        sleepButton.textContent = `Put ${n} ${n === 1 ? "tab" : "tabs"} to sleep`;
        // The Sleeping tabs feature's panel, while that feature is on
        performanceButton.hidden = !doc.getElementById("zf-tools-performance");
        // The whole text in the tooltip: the only text of the collapsed
        // sidebar's icon
        const parts = [t(title.textContent)];
        if (!detail.hidden) {
          parts.push(t(detail.textContent));
        }
        if (!showDone) {
          parts.push(t(sleepButton.textContent));
        }
        if (s.simulated) {
          parts.push("test-state");
        }
        card.setAttribute("tooltiptext", parts.join(" · "));
      };

      ctx.listen(sleepButton, "click", () => {
        const count = sleepTabs(win, sleepable());
        efficiency.dismiss();
        done = { count, until: Date.now() + DONE_MS };
        render();
        ctx.timeout(() => {
          done = null;
          render();
        }, DONE_MS);
        // The memory the sleeping tabs gave back, once their processes end
        ctx.timeout(() => efficiency.wake(), 31000);
      });
      ctx.listen(performanceButton, "click", () =>
        doc.getElementById("zf-tools-performance")?.doCommand(),
      );
      ctx.listen(close, "click", () => efficiency.dismiss());

      // The battery, from this window's navigator (a module has none)
      let alive = true;
      ctx.onCleanup(() => (alive = false));
      win.navigator
        .getBattery?.()
        .then((manager) => {
          if (!alive) {
            return;
          }
          const report = () =>
            efficiency.reportBattery({
              level: manager.level,
              charging: manager.charging,
            });
          ctx.listen(manager, "levelchange", report);
          ctx.listen(manager, "chargingchange", report);
          report();
        })
        .catch(() => {});

      // The number of tabs that may sleep changes with the tabs
      let queued = 0;
      const soon = () => {
        if (!queued) {
          queued = win.requestAnimationFrame(() => {
            queued = 0;
            render();
          });
        }
      };
      ctx.onCleanup(() => win.cancelAnimationFrame(queued));
      for (const type of [
        "TabOpen",
        "TabClose",
        "TabSelect",
        "TabAttrModified",
        "TabBrowserDiscarded",
      ]) {
        ctx.listen(gBrowser.tabContainer, type, soon);
      }
      ctx.observePref("zen-fluent.enhanced.performance", soon);
      ctx.listen(doc, "visibilitychange", () => {
        if (!doc.hidden) {
          efficiency.wake();
        }
      });
      ctx.onCleanup(efficiency.subscribe(win, render));
      render();
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
