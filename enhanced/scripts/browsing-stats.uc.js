// Zen Fluent Enhanced: browsing stats.
//
// A panel (app menu › Browsing stats, Tools › Browsing stats, or
// Ctrl+Alt+Shift+S) with the time spent on pages, the visits and the sites
// of today, the last 7 or 30 days, a bar per day and the top sites. It
// reads Firefox's own history (lib/zf-stats.sys.mjs) and records nothing.
// It only counts from the day the stats were turned on
// (zen-fluent.enhanced.browsing-stats.since, set when the checkbox is
// checked, dropped when it is unchecked); Clear stats moves that day to
// now, without touching the history. Ignored sites
// (zen-fluent.enhanced.browsing-stats.ignored, hosts separated by commas)
// are left out. Off by default.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );
  const { siteDays, timeTracked } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-stats.sys.mjs",
  );

  const PREF = "zen-fluent.enhanced.browsing-stats";
  const SINCE = `${PREF}.since`;
  const IGNORED = `${PREF}.ignored`;
  const DAY = 24 * 60 * 60 * 1000;
  const TOP = 10;
  const HTML = "http://www.w3.org/1999/xhtml";
  const PERIODS = [
    { id: "today", label: "Today", days: 1 },
    { id: "week", label: "7 days", days: 7 },
    { id: "month", label: "30 days", days: 30 },
  ];

  const since = () => Number(Services.prefs.getStringPref(SINCE, "0")) || 0;
  const ignored = () =>
    new Set(
      Services.prefs
        .getStringPref(IGNORED, "")
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean),
    );
  const siteOf = (host) => host.replace(/^www\./, "");
  const localDay = (time) => {
    const date = new Date(time);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };
  function duration(ms) {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} h ${String(minutes % 60).padStart(2, "0")}`;
  }

  /** Visits, time and sites for the period, ignored sites left out. */
  async function summary(days) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    const from = Math.max(start.getTime(), since());
    const skip = ignored();
    const perDay = new Map();
    const perSite = new Map();
    for (let i = 0; i < days; i++) {
      const time = start.getTime() + i * DAY + DAY / 2;
      perDay.set(localDay(time), { day: localDay(time), time: 0, visits: 0 });
    }
    for (const row of await siteDays(from)) {
      const site = siteOf(row.host);
      if (skip.has(site)) {
        continue;
      }
      const dayRow = perDay.get(row.day);
      if (dayRow) {
        dayRow.time += row.time;
        dayRow.visits += row.visits;
      }
      const siteRow = perSite.get(site) ?? {
        site,
        url: row.url,
        time: 0,
        visits: 0,
      };
      siteRow.time += row.time;
      siteRow.visits += row.visits;
      perSite.set(site, siteRow);
    }
    const sites = [...perSite.values()].sort(
      (a, b) => b.time - a.time || b.visits - a.visits,
    );
    return {
      from,
      days: [...perDay.values()],
      sites,
      time: sites.reduce((sum, site) => sum + site.time, 0),
      visits: sites.reduce((sum, site) => sum + site.visits, 0),
    };
  }

  const feature = ZFFeature.attach(window, {
    name: "browsing-stats",
    start(ctx) {
      const { document } = ctx;
      const win = ctx.window;
      if (!since()) {
        Services.prefs.setStringPref(SINCE, String(Date.now()));
      }
      let period = "week";

      const html = (tag, attributes = {}, text = "") => {
        const el = document.createElementNS(HTML, tag);
        for (const [name, value] of Object.entries(attributes)) {
          el.setAttribute(name, value);
        }
        el.textContent = text;
        return el;
      };

      const panel = ctx.element(
        "panel",
        {
          id: "zf-stats",
          type: "arrow",
          role: "dialog",
          "aria-label": "Browsing stats",
          orient: "vertical",
        },
        document.getElementById("mainPopupSet"),
      );
      ctx.onCleanup(() => panel.hidePopup());

      let rendering = 0;
      async function render() {
        const current = ++rendering;
        const days = PERIODS.find((p) => p.id === period).days;
        const data = await summary(days);
        if (current !== rendering) {
          return;
        }
        const parts = [];

        const header = html("div", { class: "zf-st-header" });
        const tabs = html("div", {
          class: "zf-st-periods",
          role: "radiogroup",
          "aria-label": "Period",
        });
        for (const p of PERIODS) {
          const choice = html(
            "button",
            {
              class: "zf-st-period",
              role: "radio",
              "aria-checked": p.id === period,
            },
            p.label,
          );
          choice.addEventListener("click", () => {
            period = p.id;
            render();
          });
          tabs.append(choice);
        }
        header.append(
          html("h2", { class: "zf-st-title" }, "Browsing stats"),
          tabs,
        );
        parts.push(header);

        const tiles = html("div", { class: "zf-st-tiles" });
        for (const [value, label] of [
          [timeTracked() ? duration(data.time) : "–", "On pages"],
          [String(data.visits), data.visits === 1 ? "Visit" : "Visits"],
          [
            String(data.sites.length),
            data.sites.length === 1 ? "Site" : "Sites",
          ],
        ]) {
          const tile = html("div", { class: "zf-st-tile" });
          tile.append(
            html("span", { class: "zf-st-value" }, value),
            html("span", { class: "zf-st-label" }, label),
          );
          tiles.append(tile);
        }
        parts.push(tiles);

        if (!timeTracked()) {
          const notice = html("div", { class: "zf-st-notice" });
          const enable = html("button", { class: "zf-st-link" }, "Turn it on");
          enable.addEventListener("click", () => {
            Services.prefs.setBoolPref(
              "browser.places.interactions.enabled",
              true,
            );
            render();
          });
          notice.append(
            html(
              "span",
              {},
              "Firefox does not record the time spent on pages.",
            ),
            enable,
          );
          parts.push(notice);
        }

        // A bar per day: time on pages, or visits without time tracking
        if (data.days.length > 1) {
          const metric = timeTracked() ? "time" : "visits";
          const most = Math.max(1, ...data.days.map((d) => d[metric]));
          const chart = html("div", {
            class: "zf-st-chart",
            role: "img",
            "aria-label": `${metric === "time" ? "Time on pages" : "Visits"} per day`,
          });
          const fmt = new Intl.DateTimeFormat("en", {
            weekday: data.days.length <= 7 ? "short" : undefined,
            day: data.days.length > 7 ? "numeric" : undefined,
          });
          for (const d of data.days) {
            const bar = html("div", {
              class: "zf-st-bar",
              title: `${d.day}: ${metric === "time" ? duration(d.time) : d.visits}`,
            });
            bar.style.setProperty(
              "--zf-st-height",
              `${(d[metric] / most) * 100}%`,
            );
            if (d.day === localDay(Date.now())) {
              bar.setAttribute("zf-today", "");
            }
            const label = html(
              "span",
              { class: "zf-st-day" },
              fmt.format(new Date(`${d.day}T12:00`)),
            );
            const column = html("div", { class: "zf-st-column" });
            column.append(bar, label);
            chart.append(column);
          }
          parts.push(chart);
        }

        parts.push(html("h3", { class: "zf-st-heading" }, "Top sites"));
        const list = html("ul", { class: "zf-st-sites", role: "list" });
        for (const site of data.sites.slice(0, TOP)) {
          const item = html("li", { class: "zf-st-site" });
          const icon = html("img", {
            class: "zf-st-icon",
            alt: "",
            src: `page-icon:${site.url}`,
          });
          icon.addEventListener(
            "error",
            () => (icon.src = "chrome://global/skin/icons/defaultFavicon.svg"),
            { once: true },
          );
          const text = html("span", { class: "zf-st-text" });
          text.append(
            html("span", { class: "zf-st-name" }, site.site),
            html(
              "span",
              { class: "zf-st-meta" },
              [
                timeTracked() ? duration(site.time) : null,
                `${site.visits} ${site.visits === 1 ? "visit" : "visits"}`,
              ]
                .filter(Boolean)
                .join(" · "),
            ),
          );
          const ignore = html(
            "button",
            {
              class: "zf-st-ignore",
              "aria-label": `Ignore ${site.site}`,
            },
            "Ignore",
          );
          ignore.addEventListener("click", () => {
            const set = ignored();
            set.add(site.site);
            Services.prefs.setStringPref(IGNORED, [...set].join(","));
          });
          item.append(icon, text, ignore);
          list.append(item);
        }
        if (!data.sites.length) {
          list.append(html("li", { class: "zf-st-empty" }, "No visit yet."));
        }
        parts.push(list);

        const skipped = [...ignored()];
        if (skipped.length) {
          const block = html("details", { class: "zf-st-ignored" });
          block.append(
            html("summary", {}, `Ignored sites (${skipped.length})`),
          );
          for (const host of skipped) {
            const row = html("div", { class: "zf-st-ignored-row" });
            const back = html("button", { class: "zf-st-link" }, "Count again");
            back.addEventListener("click", () => {
              const set = ignored();
              set.delete(host);
              Services.prefs.setStringPref(IGNORED, [...set].join(","));
            });
            row.append(html("span", {}, host), back);
            block.append(row);
          }
          parts.push(block);
        }

        const footer = html("div", { class: "zf-st-footer" });
        const counting = new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
        }).format(new Date(since()));
        const clear = html("button", { class: "zf-st-clear" }, "Clear stats");
        let confirming = 0;
        clear.addEventListener("click", () => {
          if (!confirming) {
            clear.textContent = "Click again to clear";
            confirming = win.setTimeout(() => {
              confirming = 0;
              clear.textContent = "Clear stats";
            }, 4000);
            return;
          }
          win.clearTimeout(confirming);
          Services.prefs.setStringPref(SINCE, String(Date.now()));
        });
        footer.append(
          html("span", { class: "zf-st-since" }, `Counting since ${counting}`),
          clear,
        );
        parts.push(footer);
        panel.replaceChildren(...parts);
      }

      ctx.listen(panel, "popupshowing", render);
      ctx.observePref(`${PREF}.`, () => {
        if (panel.state === "open") {
          render();
        }
      });

      function openPanel() {
        const anchor =
          document.getElementById("PanelUI-menu-button") ??
          document.getElementById("tabbrowser-tabs");
        panel.openPopup(anchor, "bottomleft topleft");
      }

      // -------- Entry points --------
      const tools = document.getElementById("menu_ToolsPopup");
      if (tools) {
        const item = ctx.element(
          "menuitem",
          { id: "zf-tools-stats", label: "Browsing stats" },
          tools,
        );
        ctx.listen(item, "command", openPanel);
      }
      // The app menu's buttons only exist once it was first shown
      ctx.listen(
        win,
        "ViewShowing",
        (event) => {
          if (
            // appMenu-mainView in Zen 1.24, appMenu-protonMainView in Firefox
            !/^appMenu-(proton)?[mM]ainView$/.test(event.target.id) ||
            document.getElementById("zf-appmenu-stats")
          ) {
            return;
          }
          const history = document.getElementById("appMenu-history-button");
          if (!history) {
            return;
          }
          const button = ctx.element("toolbarbutton", {
            id: "zf-appmenu-stats",
            class: "subviewbutton",
            label: "Browsing stats",
          });
          history.after(button);
          ctx.listen(button, "command", () => {
            PanelUI.hide();
            openPanel();
          });
        },
        true,
      );
      ctx.listen(
        win,
        "keydown",
        (event) => {
          if (
            event.code === "KeyS" &&
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
    stop() {
      // Unchecked (not a closed window): the next start counts afresh
      if (!Services.prefs.getBoolPref(PREF, false)) {
        Services.prefs.clearUserPref(SINCE);
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
