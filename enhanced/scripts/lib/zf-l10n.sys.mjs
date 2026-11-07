// Zen Fluent Enhanced: the French interface, when Zen is in French.
//
// The code and both preferences.json files keep the English text; this
// module swaps it for its translation where it is shown: the settings page,
// and in the browser windows every element Enhanced adds (an id or a class
// starting with zf-). enhanced/l10n/<language>/strings.json maps each
// English text to its translation; {0}, {1}… in a key stand for the parts
// that change, themselves translated when the list has them. A text the
// list lacks stays in English. Sine's own dialog keeps the English labels:
// it reads one preferences.json.

const BASE = "chrome://sine/content/Zen-Fluent-Enhanced/l10n/";
const LANGUAGES = new Set(["fr"]);
const ATTRIBUTES = [
  "label",
  "tooltiptext",
  "title",
  "placeholder",
  "aria-label",
  "aria-description",
];
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "KBD"]);

/** The language of the interface, or null for English. */
export function language() {
  const lang = Services.locale.appLocaleAsBCP47.split("-")[0];
  return LANGUAGES.has(lang) ? lang : null;
}

let table = null;
function load() {
  if (table) {
    return table;
  }
  table = { strings: new Map(), patterns: [] };
  const lang = language();
  if (!lang) {
    return table;
  }
  try {
    const json = JSON.parse(
      Cu.readUTF8URI(Services.io.newURI(`${BASE}${lang}/strings.json`)),
    );
    for (const [key, value] of Object.entries(json.strings ?? {})) {
      if (/\{\d\}/.test(key)) {
        const names = [];
        const source = key
          .split(/(\{\d\})/)
          .map((part) => {
            const slot = part.match(/^\{(\d)\}$/);
            if (slot) {
              names.push(Number(slot[1]));
              return "(.+?)";
            }
            return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          })
          .join("");
        table.patterns.push({ re: new RegExp(`^${source}$`), names, value });
      } else {
        table.strings.set(key, value);
      }
    }
  } catch (error) {
    console.error("[Zen Fluent Enhanced] translation unreadable", error);
  }
  // The most specific first: "{0} of {1}" must not take a longer sentence
  const literal = (re) => re.source.replace(/\(\.\+\?\)/g, "").length;
  table.patterns.sort((a, b) => literal(b.re) - literal(a.re));
  return table;
}

/** The translation of an English text, or the text itself. */
export function t(text) {
  if (typeof text !== "string" || !language()) {
    return text;
  }
  const key = text.replace(/\s+/g, " ").trim();
  if (!key) {
    return text;
  }
  const { strings, patterns } = load();
  let found = strings.get(key);
  if (found === undefined) {
    for (const { re, names, value } of patterns) {
      const match = key.match(re);
      if (match) {
        found = value.replace(/\{(\d)\}/g, (_, n) => {
          const part = match[names.indexOf(Number(n)) + 1] ?? "";
          return strings.get(part) ?? part;
        });
        break;
      }
    }
  }
  if (found === undefined) {
    return text;
  }
  // The spaces around the text stay
  const lead = text.match(/^\s*/)[0];
  const trail = text.match(/\s*$/)[0];
  return lead + found + trail;
}

// A name you gave (a space, a mod) is marked translate="no"
const KEEP = '[translate="no"]';

function translateText(node) {
  const parent = node.parentElement;
  if (
    !parent ||
    SKIP.has(parent.localName.toUpperCase()) ||
    parent.closest?.(KEEP)
  ) {
    return;
  }
  const value = node.data;
  const translated = t(value);
  if (translated !== value) {
    node.data = translated;
  }
}

function translateAttributes(element) {
  if (element.closest?.(KEEP)) {
    return;
  }
  for (const name of ATTRIBUTES) {
    const value = element.getAttribute?.(name);
    if (value) {
      const translated = t(value);
      if (translated !== value) {
        element.setAttribute(name, translated);
      }
    }
  }
}

/** Translates a subtree in place: its texts and labels. */
export function translate(root) {
  if (!language() || !root) {
    return;
  }
  if (root.nodeType === root.TEXT_NODE) {
    translateText(root);
    return;
  }
  if (root.nodeType !== root.ELEMENT_NODE && root.nodeType !== 9) {
    return;
  }
  const doc = root.ownerDocument ?? root;
  if (root.nodeType === root.ELEMENT_NODE) {
    translateAttributes(root);
  }
  const walker = doc.createTreeWalker(root, 0x1 | 0x4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === 3) {
      translateText(node);
    } else {
      translateAttributes(node);
    }
  }
}

/**
 * Keeps a document translated as it changes: everything under root, or
 * only what the accept(node) test keeps.
 *
 * @returns {() => void} Stops watching.
 */
export function watch(doc, { root = doc.documentElement, accept } = {}) {
  if (!language() || !root) {
    return () => {};
  }
  const ok = (node) => {
    const element = node.nodeType === 3 ? node.parentElement : node;
    return element && (!accept || accept(element));
  };
  if (!accept) {
    translate(root);
  } else {
    for (const element of root.querySelectorAll("*")) {
      if (accept(element) && !accept(element.parentElement ?? root)) {
        translate(element);
      }
    }
  }
  const observer = new doc.defaultView.MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "childList") {
        for (const node of record.addedNodes) {
          if (ok(node)) {
            translate(node);
          }
        }
      } else if (record.type === "characterData") {
        if (ok(record.target)) {
          translateText(record.target);
        }
      } else if (ok(record.target) && !record.target.closest?.(KEEP)) {
        const value = record.target.getAttribute(record.attributeName);
        const translated = t(value);
        if (value && translated !== value) {
          record.target.setAttribute(record.attributeName, translated);
        }
      }
    }
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTES,
  });
  return () => observer.disconnect();
}

// The browser windows: the elements Enhanced adds
const watched = new WeakSet();
const MARK = '[id^="zf-"], [class^="zf-"], [class*=" zf-"]';
export function watchWindow(win) {
  if (!language() || watched.has(win)) {
    return;
  }
  watched.add(win);
  const stop = watch(win.document, {
    accept: (element) => !!element.closest?.(MARK),
  });
  win.addEventListener("unload", stop, { once: true });
}
