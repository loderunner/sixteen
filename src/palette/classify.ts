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

/**
 * Darker colors make backgrounds, however colorful: as accents they would
 * need a near-white twin to read on a dark background.
 */
const DARKEST_ACCENT = 0.42;

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

/**
 * Slots a colorful seed can take, primary first so it wins ties. #0 sits at
 * nearly the primary's lightness, so lightness alone can't tell them apart:
 * the seed is the primary, and #0 its calmer neighbour.
 */
const HUE_SEED_SLOTS = [1, 2, 3];

/**
 * A seed is the primary unless another slot is this much closer: the primary
 * sets the palette's hue, so it should be the seed whenever it can.
 */
const PRIMARY_BIAS = 0.09;

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
  const toPrimary = Math.abs(lightness - (ladder[1] ?? lightness));
  const toNearest = Math.abs(lightness - (ladder[index] ?? lightness));
  const primary = toPrimary - PRIMARY_BIAS <= toNearest;
  return { variant, group: 'hue', index: primary ? 1 : index };
}

/**
 * Slots a neutral seed can take. The dark variant's backgrounds and text, the
 * light variant's backgrounds and its comment gray; not the light variant's
 * text, which the dark backgrounds already cover.
 */
const NEUTRAL_SEED_SLOTS: readonly (SeedSlot & { lightness: number })[] = [
  ...slotsOf('dark', 'surface', NEUTRAL_LIGHTNESS.dark.surface),
  ...slotsOf('dark', 'ink', NEUTRAL_LIGHTNESS.dark.ink),
  ...slotsOf('light', 'surface', NEUTRAL_LIGHTNESS.light.surface),
];

function slotsOf(
  variant: Variant,
  group: Group,
  ladder: readonly number[],
): (SeedSlot & { lightness: number })[] {
  return ladder.map((lightness, index) => ({
    variant,
    group,
    index,
    lightness,
  }));
}

function classifyNeutral(lightness: number): SeedSlot {
  const ladder = NEUTRAL_SEED_SLOTS.map((slot) => slot.lightness);
  const { variant, group, index } =
    NEUTRAL_SEED_SLOTS[nearest(lightness, ladder)] ?? NEUTRAL_SEED_SLOTS[0];
  return { variant, group, index };
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
