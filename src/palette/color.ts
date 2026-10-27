import {
  converter,
  differenceEuclidean,
  formatHex,
  inGamut,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeRgb,
  parseHex as parseCSSHex,
  toGamut,
  // Not a React hook: culori's name for registering a color space.
  useMode as registerMode,
  wcagContrast,
} from 'culori/fn';

registerMode(modeRgb);
registerMode(modeLrgb);
registerMode(modeOklab);
registerMode(modeOklch);

/**
 * A color in OKLCH. Generation works in OKLCH because lightness and chroma are
 * perceptually even there: equal steps look equal at any hue.
 */
export type OKLCH = {
  /** Perceived lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma, 0 (gray) to about 0.37 at the sRGB edge. */
  c: number;
  /** Hue angle in degrees, `[0, 360)`. 0 for grays. */
  h: number;
};

const toOKLCH = converter('oklch');
const isInSRGB = inGamut('rgb');
const mapToSRGB = toGamut('rgb', 'oklch');
const deltaEOK = differenceEuclidean('oklab');

/** Chroma under which a color is gray for all practical purposes. */
const GRAY_CHROMA = 1e-4;

const HEX = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Normalizes a hex color to lowercase `#rrggbb`, or `undefined` when the text
 * is not a 3- or 6-digit hex color. The leading `#` is optional.
 *
 * @param text - A color such as `#7AB4C8`, `7ab4c8` or `#abc`.
 *
 * @example
 * normalizeHex('ABC'); // '#aabbcc'
 */
export function normalizeHex(text: string): string | undefined {
  if (!HEX.test(text)) {
    return undefined;
  }
  const digits = text.replace('#', '').toLowerCase();
  const full = digits.length === 3 ? digits.replace(/./g, '$&$&') : digits;
  return `#${full}`;
}

/**
 * The OKLCH coordinates of a hex color, or `undefined` when it isn't one.
 *
 * @param hex - A 3- or 6-digit hex color, with or without `#`.
 */
export function parseHex(hex: string): OKLCH | undefined {
  const normalized = normalizeHex(hex);
  if (normalized === undefined) {
    return undefined;
  }
  const rgb = parseCSSHex(normalized);
  if (rgb === undefined) {
    return undefined;
  }
  const { l, c, h } = toOKLCH(rgb);
  return { l, c, h: normalizeHue(h ?? 0) };
}

/**
 * Brings a color into sRGB with the CSS Color 4 gamut-mapping algorithm, which
 * lowers chroma at constant lightness and hue until the color fits.
 *
 * @param color - Any OKLCH color, possibly outside sRGB.
 */
export function gamutMap(color: OKLCH): OKLCH {
  const mapped = toOKLCH(mapToSRGB({ mode: 'oklch', ...color }));
  // A gray's hue is rounding noise: keep the one asked for.
  const hue = mapped.c < GRAY_CHROMA ? color.h : (mapped.h ?? color.h);
  return { l: mapped.l, c: mapped.c, h: normalizeHue(hue) };
}

/**
 * The lowercase `#rrggbb` of a color, gamut-mapped into sRGB first.
 *
 * @param color - Any OKLCH color.
 */
export function toHex(color: OKLCH): string {
  return formatHex(mapToSRGB({ mode: 'oklch', ...color }));
}

/**
 * Whether a color is inside sRGB, so it shows as is on a standard screen.
 *
 * @param color - An OKLCH color.
 */
export function inSRGB(color: OKLCH): boolean {
  return isInSRGB({ mode: 'oklch', ...color });
}

/**
 * Perceptual distance ΔE_OK, the Euclidean distance in OKLab. Around 0.02 is
 * barely noticeable side by side.
 *
 * @param a - First color.
 * @param b - Second color.
 */
export function deltaE(a: OKLCH, b: OKLCH): number {
  return deltaEOK({ mode: 'oklch', ...a }, { mode: 'oklch', ...b });
}

/**
 * WCAG 2 contrast ratio, from 1 (none) to 21 (black on white).
 *
 * @param a - One color; the order doesn't matter.
 * @param b - The other color.
 */
export function contrast(a: OKLCH, b: OKLCH): number {
  return wcagContrast(
    { mode: 'oklch', ...gamutMap(a) },
    { mode: 'oklch', ...gamutMap(b) },
  );
}

/**
 * A hue angle in `[0, 360)`.
 *
 * @param hue - Any angle in degrees.
 */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/**
 * The signed shortest turn from one hue to another, in `(-180, 180]` degrees.
 *
 * @param from - Starting hue.
 * @param to - Target hue.
 *
 * @example
 * hueDelta(350, 10); // 20
 */
export function hueDelta(from: number, to: number): number {
  const delta = normalizeHue(to - from);
  return delta > 180 ? delta - 360 : delta;
}

/**
 * The unsigned shortest distance between two hues, in `[0, 180]` degrees.
 *
 * @param a - One hue.
 * @param b - The other hue.
 */
export function hueDistance(a: number, b: number): number {
  return Math.abs(hueDelta(a, b));
}
