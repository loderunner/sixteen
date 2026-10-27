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

type Range = { min: number; max: number };

/**
 * Lightness of the in-hue accents a variant takes from a seed picked for it.
 * Lighter accents would fade into the light variant's backgrounds, darker
 * ones into the dark variant's. Darker colorful seeds become neutrals.
 */
const PICKED_ACCENT = {
  dark: { min: 0.45, max: Infinity },
  light: { min: 0.3, max: DARK_VARIANT_ACCENT },
} as const satisfies Record<Variant, Range>;

/**
 * Lightness of the neutrals a variant takes from a seed picked for it. Past
 * these, text would no longer read at 7:1 on the backgrounds.
 */
const PICKED_NEUTRAL = {
  dark: { surface: { min: 0, max: 0.55 }, ink: { min: 0.82, max: Infinity } },
  light: { surface: { min: 0, max: Infinity }, ink: { min: 0, max: 0.4 } },
} as const satisfies Record<Variant, Record<'surface' | 'ink', Range>>;

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
 * A seed picked for a variant goes into that variant whenever one of its
 * slots fits: a deep blue picked in a light theme is a light accent, not a
 * dark background. When none fits, or the seed belongs there anyway, the
 * variant changes nothing.
 *
 * @param color - The seed.
 * @param picked - The variant the seed was picked for, if any.
 *
 * @example
 * classifySeed(parseHex('#7ab4c8')); // { variant: 'dark', group: 'hue', index: 1 }
 * classifySeed(parseHex('#2a0040')); // { variant: 'dark', group: 'surface', index: 0 }
 * classifySeed(parseHex('#2a0040'), 'light'); // { variant: 'light', group: 'ink', index: 2 }
 */
export function classifySeed(color: OKLCH, picked?: Variant): SeedSlot {
  const slot = classifyInPair(color);
  if (picked === undefined || slot.variant === picked) {
    return slot;
  }
  return classifyInVariant(color, picked) ?? slot;
}

const colorful = ({ l, c }: OKLCH): boolean =>
  c >= ACCENT_CHROMA && (l <= LIGHTEST_ACCENT || c >= VIVID_CHROMA);

function classifyInPair(color: OKLCH): SeedSlot {
  if (colorful(color) && color.l >= DARKEST_ACCENT) {
    const variant: Variant = color.l >= DARK_VARIANT_ACCENT ? 'dark' : 'light';
    return classifyAccent(color.l, variant);
  }
  return nearestNeutral(color.l, NEUTRAL_SEED_SLOTS) ?? NEUTRAL_SEED_SLOTS[0];
}

function classifyInVariant(
  color: OKLCH,
  variant: Variant,
): SeedSlot | undefined {
  const accent = PICKED_ACCENT[variant];
  if (colorful(color) && color.l >= accent.min) {
    return color.l < accent.max ? classifyAccent(color.l, variant) : undefined;
  }
  const fitting = PICKED_SEED_SLOTS[variant].filter(({ group }) => {
    const { min, max } = PICKED_NEUTRAL[variant][group];
    return color.l >= min && color.l <= max;
  });
  return nearestNeutral(color.l, fitting);
}

function classifyAccent(lightness: number, variant: Variant): SeedSlot {
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

/** A neutral slot, and the lightness the structure gives it. */
type NeutralSlot = SeedSlot & { group: 'surface' | 'ink'; lightness: number };

function slotsOf(variant: Variant, group: 'surface' | 'ink'): NeutralSlot[] {
  return NEUTRAL_LIGHTNESS[variant][group].map((lightness, index) => ({
    variant,
    group,
    index,
    lightness,
  }));
}

/**
 * Slots a neutral seed can take. The dark variant's backgrounds and text, the
 * light variant's backgrounds and its comment gray; not the light variant's
 * text, which the dark backgrounds already cover.
 */
const NEUTRAL_SEED_SLOTS: readonly NeutralSlot[] = [
  ...slotsOf('dark', 'surface'),
  ...slotsOf('dark', 'ink'),
  ...slotsOf('light', 'surface'),
];

/** Neutral slots of each variant, for a seed picked for it. */
const PICKED_SEED_SLOTS: Record<Variant, readonly NeutralSlot[]> = {
  dark: [...slotsOf('dark', 'surface'), ...slotsOf('dark', 'ink')],
  light: [...slotsOf('light', 'surface'), ...slotsOf('light', 'ink')],
};

/** The slot nearest in lightness, or `undefined` when there are none. */
const nearestNeutral = (
  lightness: number,
  slots: readonly NeutralSlot[],
): SeedSlot | undefined => {
  if (slots.length === 0) {
    return undefined;
  }
  const ladder = slots.map((slot) => slot.lightness);
  const { variant, group, index } = slots[nearest(lightness, ladder)];
  return { variant, group, index };
};

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
