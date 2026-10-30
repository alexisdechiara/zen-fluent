// Zen Fluent Enhanced: the exact color of each tab's icon, for the Essentials.
//
// Reads the favicon of every tab (the icon Zen shows on an Essential, else
// the tab's image) into a 32 x 32 canvas and keeps its dominant color: the
// most weighted of 512 color boxes, where a pixel weighs its saturation, so
// a logo's color wins over its white or black background. An icon with no
// color at all (grey, black, white) gives its average. The tab gets
// --zf-favicon-color and the zf-favicon-color attribute; enhanced/src/
// favicon-color.css turns them into the selected Essential's color.
{
  const { ZFFeature } = ChromeUtils.importESModule(
    "chrome://sine/content/Zen-Fluent-Enhanced/scripts/lib/zf-feature.sys.mjs",
  );

  const SIZE = 32;
  const MIN_CHROMA = 0.15;
  const CACHE_SIZE = 200;
  const PROPERTY = "--zf-favicon-color";
  const ATTRIBUTE = "zf-favicon-color";

  function iconOf(tab) {
    // Zen writes url(<icon>) without quotes on Essentials
    const essential = tab.style
      .getPropertyValue("--zen-essential-tab-icon")
      .match(/^url\((.+)\)$/);
    return essential?.[1] || tab.getAttribute("image") || "";
  }

  function dominantColor(pixels) {
    const boxes = new Map();
    const average = [0, 0, 0];
    let opaque = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) {
        continue;
      }
      const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
      average[0] += r;
      average[1] += g;
      average[2] += b;
      opaque++;
      const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
      if (chroma < MIN_CHROMA) {
        continue;
      }
      const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      const box = boxes.get(key) ?? { r: 0, g: 0, b: 0, count: 0, weight: 0 };
      box.r += r;
      box.g += g;
      box.b += b;
      box.count++;
      box.weight += chroma;
      boxes.set(key, box);
    }
    if (!opaque) {
      return null;
    }
    let best = null;
    for (const box of boxes.values()) {
      if (!best || box.weight > best.weight) {
        best = box;
      }
    }
    // A few colored pixels (anti-aliasing, a tiny dot) do not make a color
    const [r, g, b] =
      best && best.count >= opaque * 0.05
        ? [best.r / best.count, best.g / best.count, best.b / best.count]
        : average.map((sum) => sum / opaque);
    return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
  }

  const feature = ZFFeature.attach(window, {
    name: "favicon-color",
    default: true,
    start(ctx) {
      const { document } = ctx;
      const canvas = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "canvas",
      );
      canvas.width = canvas.height = SIZE;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const cache = new Map();
      let running = true;

      async function colorOf(url) {
        if (cache.has(url)) {
          return cache.get(url);
        }
        const image = new ctx.window.Image(SIZE, SIZE);
        image.src = url;
        let color = null;
        try {
          await image.decode();
          context.clearRect(0, 0, SIZE, SIZE);
          context.drawImage(image, 0, 0, SIZE, SIZE);
          color = dominantColor(context.getImageData(0, 0, SIZE, SIZE).data);
        } catch {
          // Not an image, or gone (a page that changed its icon meanwhile)
        }
        if (cache.size >= CACHE_SIZE) {
          cache.delete(cache.keys().next().value);
        }
        cache.set(url, color);
        return color;
      }

      function clear(tab) {
        tab.style.removeProperty(PROPERTY);
        tab.removeAttribute(ATTRIBUTE);
      }

      async function update(tab) {
        // Zen announces an Essential's new icon before it writes it
        await null;
        const url = iconOf(tab);
        const color = url ? await colorOf(url) : null;
        if (!running || !tab.isConnected || iconOf(tab) !== url) {
          return;
        }
        if (color) {
          tab.style.setProperty(PROPERTY, color);
          tab.setAttribute(ATTRIBUTE, "");
        } else {
          clear(tab);
        }
      }

      // On the window: the Essentials are outside the tab container
      ctx.listen(ctx.window, "TabAttrModified", (event) => {
        if (event.detail.changed.includes("image")) {
          update(event.target);
        }
      });
      ctx.listen(ctx.window, "ZenTabIconChanged", (event) =>
        update(event.detail.tab),
      );
      ctx.onCleanup(() => {
        running = false;
        for (const tab of document.querySelectorAll(`[${ATTRIBUTE}]`)) {
          clear(tab);
        }
      });
      for (const tab of gBrowser.tabs) {
        update(tab);
      }
    },
  });

  window.addUnloadListener?.(() => feature.destroy());
}
