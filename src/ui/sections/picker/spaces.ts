import {
  converter,
  formatHex,
  modeHsl,
  modeHsv,
  modeOklch,
  modeRgb,
  toGamut,
  useMode as registerMode,
} from 'culori/fn';

registerMode(modeRgb);
registerMode(modeHsl);
registerMode(modeHsv);
registerMode(modeOklch);

/** One adjustable channel of a color space. */
export type Channel = {
  /** Accessible name, e.g. `Red`. */
  label: string;
  /** Lowest value. */
  min: number;
  /** Highest value. */
  max: number;
  /** Smallest change. */
  step: number;
  /** How a value reads next to the slider. */
  format: (value: number) => string;
};

/** A color space the picker can edit in. */
export type ColorSpace = {
  /** Name shown on its tab. */
  name: string;
  /** Its three channels. */
  channels: [Channel, Channel, Channel];
  /** The channel values of a hex color. */
  fromHex: (hex: string) => [number, number, number];
  /** The hex color of channel values, gamut-mapped into sRGB. */
  toHex: (values: readonly number[]) => string;
};

const toRGB = converter('rgb');
const toHSL = converter('hsl');
const toHSV = converter('hsv');
const toOKLCH = converter('oklch');
const mapToSRGB = toGamut('rgb', 'oklch');

const whole = (value: number) => value.toFixed(0);
const degrees = (value: number) => `${value.toFixed(0)}°`;
const percent = (value: number) => `${value.toFixed(0)}%`;

const hueChannel: Channel = {
  label: 'Hue',
  min: 0,
  max: 360,
  step: 1,
  format: degrees,
};

const value = (values: readonly number[], index: number) => values[index] ?? 0;

/**
 * Channel values in a space, in channel order. Values keep full precision so
 * that reading a color and writing it back gives the same hex; `format` rounds
 * them for display.
 */
export type Channels = [number, number, number];

const triple = (a: number, b: number, c: number): Channels => [a, b, c];

/** sRGB, 0–255 per channel. */
export const RGB: ColorSpace = {
  name: 'RGB',
  channels: [
    { label: 'Red', min: 0, max: 255, step: 1, format: whole },
    { label: 'Green', min: 0, max: 255, step: 1, format: whole },
    { label: 'Blue', min: 0, max: 255, step: 1, format: whole },
  ],
  fromHex: (hex) => {
    const { r, g, b } = toRGB(hex) ?? { r: 0, g: 0, b: 0 };
    return triple(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
    );
  },
  toHex: (values) =>
    formatHex({
      mode: 'rgb',
      r: value(values, 0) / 255,
      g: value(values, 1) / 255,
      b: value(values, 2) / 255,
    }),
};

/** HSL: hue in degrees, saturation and lightness in percent. */
export const HSL: ColorSpace = {
  name: 'HSL',
  channels: [
    hueChannel,
    { label: 'Saturation', min: 0, max: 100, step: 1, format: percent },
    { label: 'Lightness', min: 0, max: 100, step: 1, format: percent },
  ],
  fromHex: (hex) => {
    const { h, s, l } = toHSL(hex) ?? { h: 0, s: 0, l: 0 };
    return triple(h ?? 0, s * 100, l * 100);
  },
  toHex: (values) =>
    formatHex({
      mode: 'hsl',
      h: value(values, 0),
      s: value(values, 1) / 100,
      l: value(values, 2) / 100,
    }),
};

/**
 * OKLCH: perceptual lightness in percent, chroma, hue in degrees. Colors past
 * the sRGB edge are gamut-mapped, keeping lightness and hue.
 */
export const OKLCH_SPACE: ColorSpace = {
  name: 'OKLCH',
  channels: [
    {
      label: 'Lightness',
      min: 0,
      max: 100,
      step: 0.1,
      format: (lightness) => `${lightness.toFixed(1)}%`,
    },
    {
      label: 'Chroma',
      min: 0,
      max: 0.37,
      step: 0.001,
      format: (chroma) => chroma.toFixed(3),
    },
    hueChannel,
  ],
  fromHex: (hex) => {
    const { l, c, h } = toOKLCH(hex) ?? { l: 0, c: 0, h: 0 };
    return triple(l * 100, c, h ?? 0);
  },
  toHex: (values) =>
    formatHex(
      mapToSRGB({
        mode: 'oklch',
        l: value(values, 0) / 100,
        c: value(values, 1),
        h: value(values, 2),
      }),
    ),
};

/** HSV, for the saturation and brightness area. */
export const HSV: ColorSpace = {
  name: 'HSV',
  channels: [
    hueChannel,
    { label: 'Saturation', min: 0, max: 100, step: 1, format: percent },
    { label: 'Brightness', min: 0, max: 100, step: 1, format: percent },
  ],
  fromHex: (hex) => {
    const { h, s, v } = toHSV(hex) ?? { h: 0, s: 0, v: 0 };
    return triple(h ?? 0, s * 100, v * 100);
  },
  toHex: (values) =>
    formatHex({
      mode: 'hsv',
      h: value(values, 0),
      s: value(values, 1) / 100,
      v: value(values, 2) / 100,
    }),
};

/** The spaces offered as slider tabs, in tab order. */
export const SLIDER_SPACES = [OKLCH_SPACE, HSL, RGB] as const;

/**
 * A CSS gradient showing how the color changes along one channel, the other
 * two held: what the slider's track shows.
 *
 * @param space - The color space.
 * @param values - The current channel values.
 * @param index - The channel the slider moves.
 */
export function channelGradient(
  space: ColorSpace,
  values: readonly number[],
  index: number,
): string {
  const { min, max } = space.channels[index] ?? space.channels[0];
  const steps = 12;
  const stops = Array.from({ length: steps + 1 }, (_, step) => {
    const next = [...values];
    next[index] = min + ((max - min) * step) / steps;
    return space.toHex(next);
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}
