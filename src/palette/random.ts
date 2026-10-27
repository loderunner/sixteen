import { toHex } from './color';
import { type Variant } from './structure';

type Range = {
  min: number;
  max: number;
};

/**
 * Lightness range of random seeds, per variant: around that variant's primary
 * accent, light enough to read on dark backgrounds or dark enough for light
 * ones.
 */
const LIGHTNESS: Record<Variant, Range> = {
  dark: { min: 0.68, max: 0.82 },
  light: { min: 0.48, max: 0.58 },
};

/** Chroma range of random seeds: clearly colorful, never garish. */
const CHROMA: Range = { min: 0.06, max: 0.14 };

/**
 * A random seed, as lowercase `#rrggbb`. Any hue, but lightness and chroma
 * stay where a seed makes the primary accent of the given variant, so every
 * random palette is a colorful one with its seed on show in that variant.
 *
 * @param variant - The palette of the pair the seed should sit in, usually
 *   the theme the page shows.
 * @param random - Source of uniform numbers in `[0, 1)`; tests pass a seeded
 *   one.
 *
 * @example
 * randomSeed('dark'); // '#c48a6f', or any other
 */
export function randomSeed(
  variant: Variant,
  random: () => number = Math.random,
): string {
  const between = ({ min, max }: Range) => min + random() * (max - min);
  return toHex({
    l: between(LIGHTNESS[variant]),
    c: between(CHROMA),
    h: random() * 360,
  });
}
