import { toHex } from './color';

type Range = {
  min: number;
  max: number;
};

/** Lightness range of random seeds: around the dark variant's primary. */
const LIGHTNESS: Range = { min: 0.68, max: 0.82 };

/** Chroma range of random seeds: clearly colorful, never garish. */
const CHROMA: Range = { min: 0.06, max: 0.14 };

/**
 * A random seed, as lowercase `#rrggbb`. Any hue, but lightness and chroma
 * stay where a seed makes the dark variant's primary accent, so every random
 * palette is a colorful one.
 *
 * @param random - Source of uniform numbers in `[0, 1)`; tests pass a seeded
 *   one.
 *
 * @example
 * randomSeed(); // '#c48a6f', or any other
 */
export function randomSeed(random: () => number = Math.random): string {
  const between = ({ min, max }: Range) => min + random() * (max - min);
  return toHex({
    l: between(LIGHTNESS),
    c: between(CHROMA),
    h: random() * 360,
  });
}
