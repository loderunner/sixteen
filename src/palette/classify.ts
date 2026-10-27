import { type OKLCH } from './color';
import {
  type Group,
  HUE_OFFSETS,
  NEUTRAL_LIGHTNESS,
  PRIMARY_LIGHTNESS,
  type Variant,
} from './structure';

/** Where the seed sits in the generated pair. Its swatch is the seed, exactly. */
export type SeedSlot = {
  /** The palette of the pair that holds the seed. */
  variant: Variant;
  /** The group that holds the seed. */
  group: Group;
  /** Position within the group. */
  index: number;
};

/** Accents need at least this chroma; anything grayer is a neutral. */
const ACCENT_CHROMA = 0.045;

/** Very dark colors make backgrounds, however colorful. */
const DARKEST_ACCENT = 0.3;

/** Very light colors make neutrals, unless they are this colorful. */
const LIGHTEST_ACCENT = 0.93;
const VIVID_CHROMA = 0.1;

/** Accents at least this light belong to the dark variant. */
const DARK_VARIANT_ACCENT = 0.6;

/**
 * Typical lightness of the in-hue accents of the light variant. The real
 * values depend on the hue (they are contrast-mirrored); these only pick the
 * slot.
 */
const LIGHT_HUE_LIGHTNESS = [0.535, 0.52, 0.48, 0.42];

/** Neutrals darker than this are backgrounds of the dark variant. */
const DARK_SURFACE_LIMIT = 0.47;

/** Neutrals lighter than this are text (dark) or backgrounds (light). */
const LIGHT_NEUTRAL_LIMIT = 0.88;

/**
 * Slots a colorful seed can take, primary first so it wins ties. #0 sits at
 * nearly the primary's lightness, so lightness alone can't tell them apart:
 * the seed is the primary, and #0 its calmer neighbour.
 */
const HUE_SEED_SLOTS = [1, 2, 3];

/**
 * Finds where a seed color belongs in a palette pair: which variant, which
 * group, which position.
 *
 * - A colorful seed is an in-hue accent: of the dark variant when it is light
 *   enough to read on a dark background, of the light variant otherwise.
 * - A gray, near-black or near-white seed is a neutral: a dark background, a
 *   light text or background, or the faded ink of light comments.
 *
 * @param color - The seed.
 *
 * @example
 * classifySeed(parseHex('#7ab4c8')); // { variant: 'dark', group: 'hue', index: 1 }
 */
export function classifySeed({ l, c }: OKLCH): SeedSlot {
  const colorful =
    c >= ACCENT_CHROMA &&
    l >= DARKEST_ACCENT &&
    (l <= LIGHTEST_ACCENT || c >= VIVID_CHROMA);
  if (colorful) {
    return classifyAccent(l);
  }
  return classifyNeutral(l);
}

function classifyAccent(lightness: number): SeedSlot {
  const variant: Variant = lightness >= DARK_VARIANT_ACCENT ? 'dark' : 'light';
  const ladder =
    variant === 'dark'
      ? HUE_OFFSETS.map((offset) => PRIMARY_LIGHTNESS + offset.lightness)
      : LIGHT_HUE_LIGHTNESS;
  const index = nearest(lightness, ladder, HUE_SEED_SLOTS);
  return { variant, group: 'hue', index };
}

function classifyNeutral(lightness: number): SeedSlot {
  if (lightness <= DARK_SURFACE_LIMIT) {
    const index = nearest(lightness, NEUTRAL_LIGHTNESS.dark.surface);
    return { variant: 'dark', group: 'surface', index };
  }
  if (lightness < LIGHT_NEUTRAL_LIMIT) {
    return { variant: 'light', group: 'surface', index: 3 };
  }
  const darkInk = nearest(lightness, NEUTRAL_LIGHTNESS.dark.ink);
  // Only the three light backgrounds: #3 is the comment gray.
  const lightSurface = nearest(
    lightness,
    NEUTRAL_LIGHTNESS.light.surface.slice(0, 3),
  );
  const toInk = Math.abs(lightness - NEUTRAL_LIGHTNESS.dark.ink[darkInk]);
  const toSurface = Math.abs(
    lightness - NEUTRAL_LIGHTNESS.light.surface[lightSurface],
  );
  return toInk <= toSurface
    ? { variant: 'dark', group: 'ink', index: darkInk }
    : { variant: 'light', group: 'surface', index: lightSurface };
}

/**
 * Index of the ladder value closest to `value`. Ties go to the earliest index
 * in `preference` (by default, the lowest index).
 */
const nearest = (
  value: number,
  ladder: readonly number[],
  preference: readonly number[] = ladder.map((_, index) => index),
): number => {
  let best = preference[0] ?? 0;
  for (const index of preference) {
    const distance = Math.abs(value - (ladder[index] ?? Infinity));
    if (distance < Math.abs(value - (ladder[best] ?? Infinity))) {
      best = index;
    }
  }
  return best;
};
