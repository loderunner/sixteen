import { describe, expect, it } from 'vitest';

import { classifySeed } from './classify';
import { parseHex } from './color';
import { generatePalette } from './generate';
import { randomSeed } from './random';

/** A seeded linear congruential generator, so draws are repeatable. */
const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
};

const DRAWS = 500;

/** Whether a seed makes a palette, as the primary accent of its dark variant. */
const darkPrimary = (seed: string) => {
  const color = parseHex(seed);
  if (color === undefined || generatePalette(seed) === undefined) {
    return false;
  }
  const { variant, group, index } = classifySeed(color);
  return variant === 'dark' && group === 'hue' && index === 1;
};

describe('randomSeed', () => {
  it('returns a lowercase 6-digit hex color', () => {
    expect(randomSeed()).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('is the dark primary accent of a palette that generates', () => {
    const random = seededRandom(16);
    const seeds = Array.from({ length: DRAWS }, () => randomSeed(random));
    const misplaced = seeds.filter((seed) => !darkPrimary(seed));

    expect(misplaced).toEqual([]);
  });

  it('covers the hue circle', () => {
    const random = seededRandom(7);
    const hues = new Set<number>();
    for (let draw = 0; draw < DRAWS; draw++) {
      const color = parseHex(randomSeed(random));
      hues.add(Math.floor((color?.h ?? 0) / 30));
    }

    expect(hues.size).toBe(12);
  });

  it('follows the random source', () => {
    expect(randomSeed(seededRandom(3))).toBe(randomSeed(seededRandom(3)));
  });
});
