import { describe, expect, it } from 'vitest';

import { classifySeed } from './classify';
import { parseHex } from './color';
import { generatePalette } from './generate';
import { randomSeed } from './random';
import { type Variant } from './structure';

/** A seeded linear congruential generator, so draws are repeatable. */
const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
};

const DRAWS = 500;

/** Whether a seed makes a palette, as the primary accent of `variant`. */
const isPrimaryOf = (variant: Variant, seed: string) => {
  const color = parseHex(seed);
  if (color === undefined || generatePalette(seed) === undefined) {
    return false;
  }
  const slot = classifySeed(color);
  return slot.variant === variant && slot.group === 'hue' && slot.index === 1;
};

const VARIANTS: Variant[] = ['dark', 'light'];

describe('randomSeed', () => {
  it('returns a lowercase 6-digit hex color', () => {
    expect(randomSeed('dark')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it.each(VARIANTS)(
    'is the primary accent of the %s palette, which generates',
    (variant) => {
      const random = seededRandom(16);
      const seeds = Array.from({ length: DRAWS }, () =>
        randomSeed(variant, random),
      );
      const misplaced = seeds.filter((seed) => !isPrimaryOf(variant, seed));

      expect(misplaced).toEqual([]);
    },
  );

  it.each(VARIANTS)('covers the hue circle in the %s palette', (variant) => {
    const random = seededRandom(7);
    const hues = new Set<number>();
    for (let draw = 0; draw < DRAWS; draw++) {
      const color = parseHex(randomSeed(variant, random));
      hues.add(Math.floor((color?.h ?? 0) / 30));
    }

    expect(hues.size).toBe(12);
  });

  it('follows the random source', () => {
    expect(randomSeed('light', seededRandom(3))).toBe(
      randomSeed('light', seededRandom(3)),
    );
  });
});
