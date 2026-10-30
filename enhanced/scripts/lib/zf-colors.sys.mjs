// Zen Fluent Enhanced: colors read from tab icons.
//
// iconColor() draws an icon into a 32 x 32 canvas and keeps its dominant
// color: the most weighted of 512 color boxes, where a pixel weighs its
// saturation, so a logo's color wins over its white or black background.
// An icon with no color (grey, black, white) gives its average. Results are
// cached by URL for the whole process (icons are shared between windows).

const SIZE = 32;
const MIN_CHROMA = 0.15;
const CACHE_SIZE = 300;
const cache = new Map();

/** The icon Zen shows for a tab: an Essential's own icon, else its image. */
export function iconOf(tab) {
  // Zen writes url(<icon>) without quotes on Essentials
  const essential = tab.style
    .getPropertyValue("--zen-essential-tab-icon")
    .match(/^url\((.+)\)$/);
  return essential?.[1] || tab.getAttribute("image") || "";
}

/** [r, g, b] (0-255) to an rgb() string. */
export function rgb([r, g, b]) {
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

/** 0 (grey) to 1 (fully saturated). */
export function chroma([r, g, b]) {
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

function dominant(pixels) {
  const boxes = new Map();
  const average = [0, 0, 0];
  let opaque = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) {
      continue;
    }
    const color = [pixels[i], pixels[i + 1], pixels[i + 2]];
    average[0] += color[0];
    average[1] += color[1];
    average[2] += color[2];
    opaque++;
    const weight = chroma(color);
    if (weight < MIN_CHROMA) {
      continue;
    }
    const [r, g, b] = color;
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const box = boxes.get(key) ?? { sum: [0, 0, 0], count: 0, weight: 0 };
    box.sum[0] += r;
    box.sum[1] += g;
    box.sum[2] += b;
    box.count++;
    box.weight += weight;
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
  const [sum, count] =
    best && best.count >= opaque * 0.05
      ? [best.sum, best.count]
      : [average, opaque];
  return sum.map((v) => v / count);
}

/**
 * The dominant color of an image, as [r, g, b], or null (not an image,
 * fully transparent).
 *
 * @param {Window} win - A chrome window, to create the image and canvas.
 * @param {string} url
 * @returns {Promise<number[]|null>}
 */
export async function iconColor(win, url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  let color = null;
  try {
    const image = new win.Image(SIZE, SIZE);
    image.src = url;
    await image.decode();
    const canvas = win.document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "canvas",
    );
    canvas.width = canvas.height = SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, SIZE, SIZE);
    color = dominant(context.getImageData(0, 0, SIZE, SIZE).data);
  } catch {
    // Not an image, or gone (a page that changed its icon meanwhile)
  }
  if (cache.size >= CACHE_SIZE) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(url, color);
  return color;
}
