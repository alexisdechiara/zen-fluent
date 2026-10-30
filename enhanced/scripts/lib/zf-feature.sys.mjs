// Zen Fluent Enhanced: the life cycle every feature script shares.
//
// A feature runs in one window, behind its own checkbox, the boolean pref
// zen-fluent.enhanced.<name>: it starts when the pref turns true, stops
// when it turns false (a missing pref reads as the spec's default: Sine
// only writes a checkbox's defaultValue once its settings page is built), and stops for good when the window closes or Sine
// unloads the script. Everything a feature adds goes through the context
// that start() receives, which undoes it all on stop: listeners, pref and
// topic observers, timers, mutation observers, elements, attributes and
// style properties. stop() in the spec is only for what the context does
// not know about.
//
// Sine 2.3 runs a .uc.js script again when it rebuilds a mod (install,
// update, enable) and only unloads it first through the callback the
// script itself gives to window.addUnloadListener: Sine keys that callback
// on the caller's file, so this module cannot register it for the script.
// Each script ends with
//
//   window.addUnloadListener?.(() => feature.destroy());
//
// attach() also destroys any instance left in the window under the same
// name, so a second run never doubles the feature.
//
// This module keeps no state of its own (one instance per window, held on
// the window): an update of the mod only reaches it after a restart, since
// ES modules are loaded once per process.

const PREF_PREFIX = "zen-fluent.enhanced.";
const LOG_PREFIX = "[Zen Fluent Enhanced]";

class FeatureContext {
  #cleanups = [];

  constructor(win, name) {
    this.window = win;
    this.document = win.document;
    this.name = name;
  }

  /** Runs fn when the feature stops (last added, first run). */
  onCleanup(fn) {
    this.#cleanups.push(fn);
    return fn;
  }

  /** addEventListener, removed on stop. */
  listen(target, type, fn, options = undefined) {
    target.addEventListener(type, fn, options);
    return this.onCleanup(() => target.removeEventListener(type, fn, options));
  }

  /** Calls fn() whenever the pref (or a pref under that branch) changes. */
  observePref(name, fn) {
    const observer = () => fn();
    Services.prefs.addObserver(name, observer);
    return this.onCleanup(() => Services.prefs.removeObserver(name, observer));
  }

  /** Services.obs observer for a topic, removed on stop. */
  observe(topic, fn) {
    const observer = { observe: (subject, t, data) => fn(subject, data) };
    Services.obs.addObserver(observer, topic);
    return this.onCleanup(() => Services.obs.removeObserver(observer, topic));
  }

  /** A MutationObserver on target, disconnected on stop. */
  mutations(target, options, fn) {
    const observer = new this.window.MutationObserver(fn);
    observer.observe(target, options);
    this.onCleanup(() => observer.disconnect());
    return observer;
  }

  timeout(fn, ms) {
    const id = this.window.setTimeout(fn, ms);
    this.onCleanup(() => this.window.clearTimeout(id));
    return id;
  }

  interval(fn, ms) {
    const id = this.window.setInterval(fn, ms);
    this.onCleanup(() => this.window.clearInterval(id));
    return id;
  }

  /**
   * Creates an element (XUL by default, html:tag for HTML) with the given
   * attributes, appends it to parent if given, and removes it on stop.
   */
  element(tag, attributes = {}, parent = null) {
    const doc = this.document;
    const el = tag.startsWith("html:")
      ? doc.createElementNS("http://www.w3.org/1999/xhtml", tag.slice(5))
      : doc.createXULElement(tag);
    for (const [name, value] of Object.entries(attributes)) {
      el.setAttribute(name, value);
    }
    parent?.append(el);
    this.onCleanup(() => el.remove());
    return el;
  }

  /** Sets an attribute (zf- prefixed) on an element and removes it on stop. */
  attribute(el, name, value = "") {
    if (!name.startsWith("zf-")) {
      throw new Error(
        `${LOG_PREFIX} ${this.name}: attribute ${name} needs the zf- prefix`,
      );
    }
    el.setAttribute(name, value);
    this.onCleanup(() => el.removeAttribute(name));
  }

  /** Sets a style property (a --zf-* variable) on an element, removed on stop. */
  styleProperty(el, name, value) {
    if (!name.startsWith("--zf-")) {
      throw new Error(
        `${LOG_PREFIX} ${this.name}: property ${name} needs the --zf- prefix`,
      );
    }
    el.style.setProperty(name, value);
    this.onCleanup(() => el.style.removeProperty(name));
  }

  /** Runs and forgets every clean-up, last added first. */
  cleanUp() {
    while (this.#cleanups.length) {
      const fn = this.#cleanups.pop();
      try {
        fn();
      } catch (error) {
        console.error(`${LOG_PREFIX} ${this.name}: clean-up failed`, error);
      }
    }
  }
}

export class ZFFeature {
  #window;
  #spec;
  #context = null;
  #prefObserver = () => this.#sync();
  #onUnload = () => this.destroy();

  /**
   * Starts a feature in a window, replacing any instance of the same name.
   *
   * @param {Window} win - The window the feature runs in.
   * @param {object} spec - name (the pref is zen-fluent.enhanced.<name>),
   *   start(context), and optionally default (true for a feature on by
   *   default, as in enhanced/preferences.json) and stop(context).
   * @returns {ZFFeature}
   */
  static attach(win, spec) {
    const key = ZFFeature.#key(spec.name);
    win[key]?.destroy();
    const feature = new ZFFeature(win, spec);
    win[key] = feature;
    return feature;
  }

  static #key(name) {
    return `zfFeature:${name}`;
  }

  constructor(win, spec) {
    if (!/^[a-z][a-z0-9-]*$/.test(spec.name ?? "")) {
      throw new Error(`${LOG_PREFIX} invalid feature name: ${spec.name}`);
    }
    this.#window = win;
    this.#spec = spec;
    this.pref = PREF_PREFIX + spec.name;
    Services.prefs.addObserver(this.pref, this.#prefObserver);
    win.addEventListener("unload", this.#onUnload, { once: true });
    this.#sync();
  }

  get name() {
    return this.#spec.name;
  }

  get running() {
    return this.#context !== null;
  }

  get enabled() {
    return Services.prefs.getBoolPref(this.pref, this.#spec.default ?? false);
  }

  #sync() {
    if (this.enabled && !this.running) {
      this.#start();
    } else if (!this.enabled && this.running) {
      this.#stop();
    }
  }

  #start() {
    this.#context = new FeatureContext(this.#window, this.name);
    try {
      this.#spec.start(this.#context);
    } catch (error) {
      console.error(`${LOG_PREFIX} ${this.name}: failed to start`, error);
      this.#stop();
    }
  }

  #stop() {
    const context = this.#context;
    this.#context = null;
    try {
      this.#spec.stop?.(context);
    } catch (error) {
      console.error(`${LOG_PREFIX} ${this.name}: failed to stop`, error);
    }
    context.cleanUp();
  }

  /** Stops the feature and lets go of the window (unload, Sine, a rerun). */
  destroy() {
    Services.prefs.removeObserver(this.pref, this.#prefObserver);
    this.#window.removeEventListener("unload", this.#onUnload);
    if (this.running) {
      this.#stop();
    }
    const key = ZFFeature.#key(this.name);
    if (this.#window[key] === this) {
      delete this.#window[key];
    }
  }
}
