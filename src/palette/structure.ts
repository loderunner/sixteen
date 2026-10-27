/**
 * The shape every palette shares, in OKLCH. These are this generator's own
 * constants. Their proportions follow Nord's structure: four dark neutrals in
 * small uneven steps, three light neutrals close to white, four accents
 * spread across one side of the seed's hue, and five accents around the rest
 * of the wheel.
 */

/** Which of the pair a palette is. */
export type Variant = 'dark' | 'light';

/**
 * The four groups of a palette, by role:
 *
 * - `surface`: 4 background neutrals. #3 is faded ink: comments, borders.
 * - `ink`: 3 foreground neutrals: text, then two steps of emphasis.
 * - `hue`: 4 accents in the seed's hue. #1 is the primary.
 * - `signal`: 5 accents out of it: red, orange, yellow, green, and a rare one.
 */
export type Group = 'surface' | 'ink' | 'hue' | 'signal';

/** Number of swatches in each group. */
export const GROUP_SIZES = {
  surface: 4,
  ink: 3,
  hue: 4,
  signal: 5,
} as const satisfies Record<Group, number>;

/** The groups in palette order: swatches 0–3, 4–6, 7–10 and 11–15. */
export const GROUPS = ['surface', 'ink', 'hue', 'signal'] as const;

/** Lightness of each neutral, by variant and group. */
export const NEUTRAL_LIGHTNESS = {
  dark: {
    surface: [0.31, 0.365, 0.405, 0.465],
    ink: [0.895, 0.93, 0.955],
  },
  light: {
    surface: [0.975, 0.947, 0.912, 0.62],
    ink: [0.355, 0.3, 0.245],
  },
} as const;

/**
 * Chroma of each neutral at a tint strength of 1. Dark neutrals carry more
 * tint than light ones, which fade toward white.
 */
export const NEUTRAL_CHROMA = {
  dark: {
    surface: [0.022, 0.027, 0.031, 0.035],
    ink: [0.016, 0.011, 0.007],
  },
  light: {
    surface: [0.008, 0.011, 0.015, 0.03],
    ink: [0.03, 0.027, 0.024],
  },
} as const;

/**
 * How the four in-hue accents of the dark variant sit around the primary
 * (#1): a hue turn (degrees, in the palette's direction), a lightness step and
 * a chroma ratio. #0 is a calmer neighbour on the near side, #2 and #3 go deeper
 * and darker on the far side.
 */
export const HUE_OFFSETS = [
  { hue: -22, lightness: -0.012, chroma: 0.78 },
  { hue: 0, lightness: 0, chroma: 1 },
  { hue: 30, lightness: -0.078, chroma: 0.95 },
  { hue: 38, lightness: -0.18, chroma: 1.22 },
] as const;

/** Lightness of the primary accent in the dark variant. */
export const PRIMARY_LIGHTNESS = 0.775;

/** Chroma of the primary accent at a vividness of 1. */
export const PRIMARY_CHROMA = 0.064;

/** Neutrals take their tint from this far along the in-hue band. */
export const NEUTRAL_HUE_OFFSET = 30;

/** The five out-of-hue roles, in palette order. */
export const SIGNAL_ROLES = [
  'red',
  'orange',
  'yellow',
  'green',
  'rare',
] as const;

/** One of the five out-of-hue roles. */
export type SignalRole = (typeof SIGNAL_ROLES)[number];

/** A range of hues, in degrees, that still reads as one color name. */
export type HueWindow = {
  /** Lowest hue of the range. */
  from: number;
  /** Highest hue of the range. */
  to: number;
  /** The hue the role takes when nothing else is close. */
  ideal: number;
};

/**
 * The hue each semantic role must stay within, so red always reads as an
 * error and green as a success. The rare role has no window: it takes the
 * largest free gap on the wheel.
 */
export const SIGNAL_WINDOWS = {
  red: { from: 8, to: 32, ideal: 20 },
  orange: { from: 38, to: 62, ideal: 45 },
  yellow: { from: 76, to: 98, ideal: 86 },
  green: { from: 122, to: 152, ideal: 136 },
} as const satisfies Record<Exclude<SignalRole, 'rare'>, HueWindow>;

/** Lightness and chroma (at a vividness of 1) of each role, dark variant. */
export const SIGNAL_TONES = {
  red: { lightness: 0.62, chroma: 0.118 },
  orange: { lightness: 0.7, chroma: 0.098 },
  yellow: { lightness: 0.85, chroma: 0.09 },
  green: { lightness: 0.765, chroma: 0.078 },
  rare: { lightness: 0.69, chroma: 0.066 },
} as const satisfies Record<SignalRole, { lightness: number; chroma: number }>;

/** Signals keep at least this many degrees from the in-hue band if they can. */
export const SIGNAL_CLEARANCE = 30;

/**
 * How accent contrast on surface #0 carries over from the dark variant to the
 * light one. Dark contrasts in `dark` map, on a log scale, onto `light`, and
 * clamp outside it. Order is kept, so distinct accents stay distinct, while
 * light accents never fade below 3:1 or sink to near-black.
 */
export const LIGHT_ACCENT_CONTRAST = {
  dark: [2, 12],
  light: [3.2, 6.5],
} as const;

/** Accents of the light variant are a little more saturated than dark ones. */
export const LIGHT_ACCENT_CHROMA_BOOST = 1.12;

/** Accent hue for a seed with no hue at all (a pure gray). */
export const ACHROMATIC_HUE = 235;

/** Neutrals outside the seed's own group are tinted at most this strongly. */
export const NEUTRAL_TINT_CAP = 2;

/** Below this chroma a color has no meaningful hue. */
export const ACHROMATIC_CHROMA = 0.008;
