// Zen Fluent Enhanced: a downloads card in the sidebar, sucked into the Library when done.
//
// While a file downloads, a card in the column of sidebar cards
// (lib/zf-cards.sys.mjs, order 20) shows its icon, its name, a WinUI
// progress bar (indeterminate while the size is unknown), the time left
// and the speed, with Pause / Resume and Cancel. Once it is done: "Done",
// its size, Open and Show in folder; a failed, blocked or canceled
// download says so (Retry when it can). A few seconds after the end (the
// countdown waits while the pointer or the focus is on the card), or at
// once after Open, Show in folder or Cancel, the card leaves: it shrinks
// into a dot that flies into Zen's Library button, which gives a small
// pulse as it lands. Without a visible Library button the dot drops and
// fades; with reduced motion the card fades out.
//
// Several downloads: one card each, up to three. A fourth turns the top
// card into a summary ("2 more downloads", their combined progress, a
// button that opens the Library) so the column never takes the tabs'
// room, while each of the newest keeps its own buttons and its own exit.
//
// Zen's own animation (ZenDownloadAnimation.mjs) flies from the click to
// the Library button when a download starts; this card's flight comes at
// the end, so both play. Should a download end while Zen's arc is still
// flying, the card waits for it to land first.
//
// Each kind of window only lists its own downloads: Downloads.PRIVATE in
// a private window, Downloads.PUBLIC in a normal one. Nothing is written
// and no request is made.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { addCard } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-cards.sys.mjs",
  );
  const { t } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-l10n.sys.mjs",
  );
  const { Downloads } = ChromeUtils.importESModule(
    "resource://gre/modules/Downloads.sys.mjs",
  );
  const { DownloadUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/DownloadUtils.sys.mjs",
  );
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/PrivateBrowsingUtils.sys.mjs",
  );

  const HTML = "http://www.w3.org/1999/xhtml";
  const ICONS = "chrome://sine/content/Zen-Fluent-Enhanced/icons/downloads/";
  const ORDER = 20;
  // Cards at most: past that, the top one sums up the oldest
  const MAX_CARDS = 3;
  // How long a finished card stays, by outcome
  const LINGER = { done: 5000, failed: 8000, canceled: 3000 };
  // After the pointer leaves, at least this much is left to read
  const LINGER_AFTER_HOVER = 1500;

  const feature = ZFFeature.attach(window, {
    name: "downloads-card",
    start(ctx) {
      const win = ctx.window;
      const doc = ctx.document;
      const isPrivate = PrivateBrowsingUtils.isWindowPrivate(win);
      const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)");
      let stopped = false;
      ctx.onCleanup(() => (stopped = true));

      /** download -> its entry: { download, card, parts, timer, leaving } */
      const entries = new Map();
      // In the order they came, the newest last (at the bottom, nearest
      // the Library button)
      const order = [];

      // -------- Building a card --------
      const node = (tag, attributes, parent) => {
        const el = tag.startsWith("html:")
          ? doc.createElementNS(HTML, tag.slice(5))
          : doc.createXULElement(tag);
        for (const [key, value] of Object.entries(attributes)) {
          el.setAttribute(key, value);
        }
        parent?.append(el);
        return el;
      };

      const button = (parent, action, label, icon, fn) => {
        const el = node(
          "html:button",
          {
            class: "zf-card-button zf-dl-button",
            "zf-action": action,
            title: label,
            "aria-label": label,
          },
          parent,
        );
        node(
          "html:img",
          { src: `${ICONS}${icon}.svg`, alt: "", "aria-hidden": "true" },
          el,
        );
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          fn();
        });
        return el;
      };

      /** A card with the parts every download card has. */
      const buildCard = (id) => {
        const card = addCard(ctx, { id, order: ORDER });
        if (!card) {
          return null;
        }
        card.classList.add("zf-dl-card");
        const icon = node(
          "image",
          { class: "zf-card-icon zf-dl-icon", "aria-hidden": "true" },
          card,
        );
        const text = node("vbox", { class: "zf-card-text" }, card);
        const title = node(
          "label",
          { class: "zf-card-title", crop: "end" },
          text,
        );
        const bar = node(
          "html:div",
          { class: "zf-dl-bar", role: "progressbar", "aria-valuemin": "0" },
          text,
        );
        node("html:div", { class: "zf-dl-bar-fill" }, bar);
        // The state, and the numbers at the end of the line
        const detail = node("hbox", { class: "zf-card-detail" }, text);
        const state = node(
          "label",
          { class: "zf-dl-state", crop: "end" },
          detail,
        );
        const meta = node(
          "label",
          { class: "zf-dl-meta", translate: "no" },
          detail,
        );
        const actions = node("hbox", { class: "zf-card-actions" }, card);
        return { card, parts: { icon, title, bar, state, meta, actions } };
      };

      // -------- What a download says --------
      const fileName = (d) =>
        d.target?.path ? PathUtils.filename(d.target.path) : d.source.url;

      const iconUrl = (d) => {
        // The finished file itself (an application's own icon), else its
        // kind from the extension alone: no name ever goes in a URL
        if (d.succeeded && d.target?.path) {
          try {
            const file = Cc["@mozilla.org/file/local;1"].createInstance(
              Ci.nsIFile,
            );
            file.initWithPath(d.target.path);
            return `moz-icon:${Services.io.newFileURI(file).spec}?size=32`;
          } catch {
            // falls through to the extension
          }
        }
        const ext = /\.([a-z0-9]{1,10})$/i.exec(fileName(d) ?? "")?.[1];
        return `moz-icon://.${ext ?? "unknown"}?size=32`;
      };

      const bytes = (n) => DownloadUtils.convertByteUnits(n).join(" ");

      /** running, paused, done, failed, blocked or canceled. */
      const stateOf = (d) => {
        if (!d.stopped) {
          return "running";
        }
        if (d.succeeded) {
          return "done";
        }
        if (d.error) {
          return d.error.becauseBlocked ? "blocked" : "failed";
        }
        if (d.canceled && d.hasPartialData) {
          return "paused";
        }
        return "canceled";
      };

      const ended = (s) => s !== "running" && s !== "paused";

      // -------- Showing an entry --------
      const render = (entry) => {
        const { download: d, card, parts } = entry;
        const s = stateOf(d);
        card.setAttribute("zf-state", s);
        const name = fileName(d);
        parts.title.textContent = name;
        parts.title.setAttribute("translate", "no");
        const src = iconUrl(d);
        if (parts.icon.getAttribute("src") !== src) {
          parts.icon.setAttribute("src", src);
        }

        // The bar: determinate when the size is known, hidden once done
        const known = d.hasProgress && d.totalBytes > 0;
        parts.bar.hidden = s === "done" || s === "canceled";
        parts.bar.toggleAttribute(
          "zf-indeterminate",
          s === "running" && !known,
        );
        const progress = known ? Math.round(d.progress) : 0;
        // On the card: the collapsed sidebar's card draws it too
        card.style.setProperty("--zf-dl-ratio", String(progress / 100));
        card.toggleAttribute("zf-known", known);
        if (known) {
          parts.bar.setAttribute("aria-valuemax", "100");
          parts.bar.setAttribute("aria-valuenow", String(progress));
        } else {
          parts.bar.removeAttribute("aria-valuenow");
        }
        parts.bar.setAttribute("aria-label", name);

        // The state (ours, translated) and the numbers (Firefox's own
        // localized units and times)
        let state = "";
        let meta = "";
        if (s === "running") {
          const speed = d.speed > 0 ? `${bytes(d.speed)}/s` : "";
          if (known && d.speed > 0) {
            const [left, last] = DownloadUtils.getTimeLeft(
              (d.totalBytes - d.currentBytes) / d.speed,
              entry.lastSeconds ?? Infinity,
            );
            entry.lastSeconds = last;
            state = left;
          } else {
            state =
              d.currentBytes > 0
                ? known
                  ? "Downloading"
                  : bytes(d.currentBytes)
                : "Starting";
          }
          meta = speed;
        } else if (s === "paused") {
          state = "Paused";
          meta = known
            ? DownloadUtils.getTransferTotal(d.currentBytes, d.totalBytes)
            : bytes(d.currentBytes);
        } else if (s === "done") {
          state = "Done";
          meta = d.target?.size > 0 ? bytes(d.target.size) : "";
        } else {
          state = {
            failed: "Failed",
            blocked: "Blocked",
            canceled: "Canceled",
          }[s];
        }
        // A time or a size from Firefox is already in the right language
        const ours = [
          "Starting",
          "Downloading",
          "Paused",
          "Done",
          "Failed",
          "Blocked",
          "Canceled",
        ].includes(state);
        if (ours) {
          parts.state.removeAttribute("translate");
        } else {
          parts.state.setAttribute("translate", "no");
        }
        parts.state.textContent = state;
        parts.meta.textContent = meta;
        parts.meta.hidden = !meta;
        card.setAttribute(
          "tooltiptext",
          [name, ours ? t(state) : state, meta].filter(Boolean).join(" · "),
        );
        card.setAttribute("aria-label", name);

        // The buttons, rebuilt only when the state changes
        const key = `${s}:${d.hasPartialData}`;
        if (entry.shownState !== key) {
          entry.shownState = key;
          renderActions(entry, s);
        }

        // A finished download leaves after a while
        if (ended(s)) {
          if (!entry.countdown) {
            startCountdown(entry, LINGER[s === "blocked" ? "failed" : s]);
          }
        } else {
          stopCountdown(entry);
        }
      };

      const renderActions = (entry, s) => {
        const { download: d, parts } = entry;
        parts.actions.replaceChildren();
        if (s === "running" || s === "paused") {
          if (s === "paused") {
            button(parts.actions, "resume", t("Resume"), "play", () =>
              d.start().catch(() => {}),
            );
          } else if (d.hasPartialData) {
            // Only a download that can pick up where it stopped pauses
            button(parts.actions, "pause", t("Pause"), "pause", () =>
              d.cancel().catch(() => {}),
            );
          }
          button(parts.actions, "cancel", t("Cancel"), "dismiss", () => {
            d.cancel().catch(() => {});
            d.removePartialData()
              .catch(() => {})
              .finally(() => d.target.refresh?.());
            leave(entry, "drop");
          });
        } else if (s === "done") {
          button(parts.actions, "open", t("Open"), "open", () => {
            openFile(d);
            leave(entry, "library");
          });
          button(
            parts.actions,
            "show",
            t("Show in folder"),
            "folder-open",
            () => {
              showFile(d);
              leave(entry, "library");
            },
          );
        } else if (s === "failed") {
          button(parts.actions, "retry", t("Retry"), "arrow-clockwise", () =>
            d.start().catch(() => {}),
          );
        }
      };

      const common = () => win.DownloadsCommon;
      const openFile = (d) => {
        const dc = common();
        (dc?.openDownload ? dc.openDownload(d) : d.launch()).catch?.(() => {});
      };
      const showFile = (d) => {
        try {
          const file = Cc["@mozilla.org/file/local;1"].createInstance(
            Ci.nsIFile,
          );
          file.initWithPath(d.target.path);
          const dc = common();
          if (dc?.showDownloadedFile) {
            dc.showDownloadedFile(file);
          } else {
            file.reveal();
          }
        } catch (error) {
          console.error("[Zen Fluent Enhanced] downloads-card", error);
        }
      };

      // -------- The countdown, held while the card is in use --------
      const inUse = (card) =>
        card.matches(":hover") || card.matches(":focus-within");

      const startCountdown = (entry, ms) => {
        stopCountdown(entry);
        entry.countdown = { left: ms, since: Date.now() };
        if (!inUse(entry.card)) {
          entry.timer = win.setTimeout(() => leave(entry, "auto"), ms);
        }
      };
      const stopCountdown = (entry) => {
        win.clearTimeout(entry.timer);
        entry.timer = null;
        entry.countdown = null;
      };
      const holdCountdown = (entry) => {
        if (entry.countdown && entry.timer) {
          win.clearTimeout(entry.timer);
          entry.timer = null;
          entry.countdown.left -= Date.now() - entry.countdown.since;
        }
      };
      const resumeCountdown = (entry) => {
        if (entry.countdown && !entry.timer && !inUse(entry.card)) {
          const ms = Math.max(entry.countdown.left, LINGER_AFTER_HOVER);
          entry.countdown = { left: ms, since: Date.now() };
          entry.timer = win.setTimeout(() => leave(entry, "auto"), ms);
        }
      };

      // -------- The summary card, past MAX_CARDS --------
      const summary = buildCard("zf-dl-summary");
      if (!summary) {
        return;
      }
      summary.card.classList.add("zf-dl-summary");
      summary.parts.icon.setAttribute("src", `${ICONS}arrow-download.svg`);
      summary.parts.icon.classList.add("zf-dl-glyph");
      button(
        summary.parts.actions,
        "library",
        t("Show in the Library"),
        "open",
        () => doc.getElementById("zen-library-button")?.doCommand(),
      );

      /** Shows the newest downloads on cards and sums up the others. */
      const layout = () => {
        const live = order.filter((e) => !e.leaving);
        const overflow =
          live.length > MAX_CARDS
            ? live.slice(0, live.length - (MAX_CARDS - 1))
            : [];
        // A summed-up download that ends drops out of the sum, which may
        // free a card for another
        const over = overflow.filter((e) => ended(stateOf(e.download)));
        if (over.length) {
          over.forEach(forget);
          layout();
          return;
        }
        for (const entry of live) {
          entry.card.hidden = overflow.includes(entry);
        }
        const summed = overflow.filter((e) => entries.has(e.download));
        summary.card.hidden = summed.length < 2;
        if (summary.card.hidden) {
          return;
        }
        const label = `${summed.length} more downloads`;
        summary.parts.title.textContent = label;
        summary.parts.title.removeAttribute("translate");
        let current = 0;
        let total = 0;
        let known = true;
        for (const { download: d } of summed) {
          current += d.currentBytes;
          if (d.hasProgress && d.totalBytes > 0) {
            total += d.totalBytes;
          } else {
            known = false;
          }
        }
        const { bar, state, meta } = summary.parts;
        bar.hidden = false;
        bar.toggleAttribute("zf-indeterminate", !known);
        summary.card.style.setProperty(
          "--zf-dl-ratio",
          String(known && total ? current / total : 0),
        );
        bar.setAttribute("aria-label", label);
        state.setAttribute("translate", "no");
        state.textContent = known
          ? DownloadUtils.getTransferTotal(current, total)
          : bytes(current);
        meta.hidden = true;
        summary.card.setAttribute(
          "tooltiptext",
          `${t(label)} · ${state.textContent}`,
        );
      };

      // -------- Coming and going --------
      const add = (download) => {
        if (entries.has(download)) {
          return;
        }
        const built = buildCard(
          `zf-dl-card-${Services.uuid.generateUUID().toString().slice(1, 9)}`,
        );
        if (!built) {
          return;
        }
        const entry = { download, ...built, leaving: false };
        entries.set(download, entry);
        order.push(entry);
        const { card } = entry;
        card.addEventListener("mouseenter", () => holdCountdown(entry));
        card.addEventListener("focusin", () => holdCountdown(entry));
        card.addEventListener("mouseleave", () => resumeCountdown(entry));
        card.addEventListener("focusout", () =>
          win.setTimeout(() => resumeCountdown(entry), 0),
        );
        render(entry);
        card.hidden = false;
        layout();
      };

      /** Drops an entry at once, without a word. */
      const forget = (entry) => {
        stopCountdown(entry);
        entries.delete(entry.download);
        const i = order.indexOf(entry);
        if (i !== -1) {
          order.splice(i, 1);
        }
        entry.card.remove();
      };

      // -------- The exit --------
      const visible = (el) => {
        if (!el || el.hidden || !el.checkVisibility?.()) {
          return null;
        }
        const r = el.getBoundingClientRect();
        // As Zen's own check: on screen, and not parked at 0,0 in a menu
        if (
          r.width < 1 ||
          r.height < 1 ||
          r.bottom < 1 ||
          r.right < 1 ||
          r.top > win.innerHeight ||
          r.left > win.innerWidth
        ) {
          return null;
        }
        return r;
      };

      /** Waits for Zen's own download arc, if one is flying, to land. */
      const zenArcLanded = () => {
        const arc = doc
          .querySelector("zen-download-animation")
          ?.shadowRoot?.querySelector(".zen-download-arc-animation");
        if (!arc) {
          return Promise.resolve();
        }
        const flying = arc.getAnimations().map((a) => a.finished);
        return Promise.race([
          Promise.allSettled(flying),
          new Promise((resolve) => win.setTimeout(resolve, 1500)),
        ]);
      };

      /**
       * The card leaves: "library" (done, opened, shown) flies into the
       * Library button; "drop" (canceled) and anything that did not
       * succeed folds away where it is.
       */
      const leave = async (entry, how) => {
        if (entry.leaving) {
          return;
        }
        entry.leaving = true;
        stopCountdown(entry);
        entries.delete(entry.download);
        const { card } = entry;
        card.setAttribute("zf-leaving", "");
        const done = () => {
          const i = order.indexOf(entry);
          if (i !== -1) {
            order.splice(i, 1);
          }
          card.remove();
          if (!stopped) {
            layout();
          }
        };
        const from = visible(card);
        if (!from || stopped) {
          done();
          return;
        }
        if (how === "auto") {
          how = stateOf(entry.download) === "done" ? "library" : "drop";
        }
        try {
          if (reducedMotion.matches) {
            await card.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 167,
              easing: "linear",
              fill: "forwards",
            }).finished;
          } else if (how === "library") {
            await zenArcLanded();
            await flyAway(entry, from);
          } else {
            await fold(card, from);
          }
        } catch {
          // the window closed or the feature stopped mid-way
        }
        done();
      };

      /**
       * Folds the card's place away: its height, its padding and the gap
       * above it close up (CSS transitions, which beat the cards'
       * !important layout; an animation would not), the cards around it
       * sliding into place.
       */
      const fold = (card, from, delay = 0) => {
        card.style.setProperty("--zf-dl-height", `${from.height}px`);
        card.setAttribute("zf-leaving", "measure");
        card.getBoundingClientRect();
        card.style.setProperty("--zf-dl-fold-delay", `${delay}ms`);
        card.setAttribute("zf-leaving", "fold");
        return new Promise((resolve) => {
          const end = () => resolve();
          card.addEventListener(
            "transitionend",
            (event) => event.propertyName === "height" && end(),
          );
          // Never stuck: transitions may not run (a hidden window)
          win.setTimeout(end, 450 + delay);
        });
      };

      /**
       * The card shrinks into a dot around its icon, then the dot flies
       * along a slight curve into the Library button, which pulses once
       * as it lands. No Library button in sight: the dot drops and fades.
       */
      const flyAway = async (entry, from) => {
        const { card, parts } = entry;
        const iconRect = parts.icon.getBoundingClientRect();
        const start = {
          x: iconRect.left + iconRect.width / 2,
          y: iconRect.top + iconRect.height / 2,
        };
        // The flyer: a copy of the card's surface over everything, which
        // becomes the dot. Physical left/top: they come from client rects
        const flyer = node("html:div", {
          class: "zf-dl-flyer",
          "aria-hidden": "true",
        });
        const flyerIcon = node(
          "html:img",
          {
            class: "zf-dl-flyer-icon",
            src: parts.icon.getAttribute("src"),
            alt: "",
          },
          flyer,
        );
        Object.assign(flyer.style, {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
        });
        flyerIcon.style.left = `${iconRect.left - from.left}px`;
        flyerIcon.style.top = `${iconRect.top - from.top}px`;
        // The card's text and buttons, faded out as it starts to shrink
        const ghost = card.cloneNode(true);
        ghost.removeAttribute("id");
        ghost.removeAttribute("zf-leaving");
        ghost.classList.add("zf-dl-ghost");
        ghost.style.width = `${from.width}px`;
        ghost.style.height = `${from.height}px`;
        flyer.prepend(ghost);
        (doc.body ?? doc.documentElement).append(flyer);
        ctx.onCleanup(() => flyer.remove());
        card.style.visibility = "hidden";
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 140,
          easing: "linear",
          fill: "forwards",
        });

        try {
          // 1. The card shrinks into a dot around its icon, and its place
          //    in the column closes up
          const dot = 28;
          const folding = fold(card, from, 20);
          const shrink = {
            duration: 240,
            easing: "cubic-bezier(0.1, 0.9, 0.2, 1)",
            fill: "forwards",
          };
          const shrinking = flyer.animate(
            [
              {
                left: `${from.left}px`,
                top: `${from.top}px`,
                width: `${from.width}px`,
                height: `${from.height}px`,
                borderRadius: "8px",
              },
              {
                left: `${start.x - dot / 2}px`,
                top: `${start.y - dot / 2}px`,
                width: `${dot}px`,
                height: `${dot}px`,
                borderRadius: `${dot / 2}px`,
              },
            ],
            shrink,
          );
          flyerIcon.animate(
            [
              {
                left: `${iconRect.left - from.left}px`,
                top: `${iconRect.top - from.top}px`,
              },
              {
                left: `${(dot - iconRect.width) / 2}px`,
                top: `${(dot - iconRect.height) / 2}px`,
              },
            ],
            shrink,
          );
          await Promise.all([shrinking.finished, folding]);

          // Where the Library button is once the column has closed up (it
          // moves up with it when nothing pins it to the bottom)
          const library = doc.getElementById("zen-library-button");
          const target = visible(library);
          const end = target
            ? {
                x: target.left + target.width / 2,
                y: target.top + target.height / 2,
              }
            : { x: start.x, y: start.y + 56 };

          // 2. The flight: a quadratic curve bowing towards the page,
          //    accelerating as it is drawn in (WinUI's exit curve)
          const steps = 24;
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const dist = Math.hypot(dx, dy) || 1;
          // Perpendicular, on the side of the window's middle
          let nx = -dy / dist;
          let ny = dx / dist;
          const towardsMiddle = Math.sign(win.innerWidth / 2 - start.x) || 1;
          if (Math.sign(nx || towardsMiddle) !== towardsMiddle) {
            nx = -nx;
            ny = -ny;
          }
          const bow = Math.min(64, dist * 0.35);
          const ctrl = {
            x: (start.x + end.x) / 2 + nx * bow,
            y: (start.y + end.y) / 2 + ny * bow,
          };
          const frames = [];
          for (let i = 0; i <= steps; i++) {
            const p = i / steps;
            const x =
              (1 - p) ** 2 * start.x +
              2 * (1 - p) * p * ctrl.x +
              p ** 2 * end.x;
            const y =
              (1 - p) ** 2 * start.y +
              2 * (1 - p) * p * ctrl.y +
              p ** 2 * end.y;
            const size = dot - (dot - 8) * Math.min(1, p * 1.6);
            frames.push({
              offset: p,
              left: `${x - size / 2}px`,
              top: `${y - size / 2}px`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: `${size / 2}px`,
              opacity: target ? (p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15) : 1 - p,
            });
          }
          flyer.setAttribute("zf-flying", "");
          const flight = flyer.animate(frames, {
            duration: target ? 460 : 360,
            easing: "cubic-bezier(0.7, 0, 1, 0.5)",
            fill: "forwards",
          });
          flyerIcon.animate(
            [
              { opacity: 1, scale: 1 },
              { opacity: 0, scale: 0.4 },
            ],
            {
              duration: 200,
              easing: "linear",
              fill: "forwards",
            },
          );
          await flight.finished;

          // 3. The Library button takes it in
          if (target) {
            library
              .animate([{ scale: 1 }, { scale: 1.14 }, { scale: 1 }], {
                duration: 320,
                easing: "cubic-bezier(0.2, 0, 0, 1)",
              })
              .finished.catch(() => {});
          }
        } finally {
          flyer.remove();
        }
      };

      // -------- The downloads list --------
      let ready = false;
      const view = {
        onDownloadAdded(download) {
          // The ones already there when the window opened only show while
          // still coming in
          if (ready || !download.stopped) {
            add(download);
          }
        },
        onDownloadChanged(download) {
          const entry = entries.get(download);
          if (entry && !entry.leaving) {
            render(entry);
            layout();
          } else if (!entry && !download.stopped && ready) {
            // A retried or resumed download from the Library
            add(download);
          }
        },
        onDownloadRemoved(download) {
          const entry = entries.get(download);
          if (entry) {
            leave(entry, "drop");
          }
        },
      };

      (async () => {
        const list = await Downloads.getList(
          isPrivate ? Downloads.PRIVATE : Downloads.PUBLIC,
        );
        if (stopped) {
          return;
        }
        await list.addView(view);
        ctx.onCleanup(() => list.removeView(view).catch(() => {}));
        ready = true;
        if (stopped) {
          list.removeView(view).catch(() => {});
        }
      })().catch((error) =>
        console.error("[Zen Fluent Enhanced] downloads-card", error),
      );

      // The time left and the speed move on their own between changes
      ctx.interval(() => {
        for (const entry of entries.values()) {
          if (!entry.leaving && !entry.download.stopped) {
            render(entry);
          }
        }
      }, 1000);

      ctx.onCleanup(() => {
        for (const entry of entries.values()) {
          win.clearTimeout(entry.timer);
        }
        entries.clear();
      });
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
