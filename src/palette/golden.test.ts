import { describe, expect, it } from 'vitest';

import { generatePalette, swatchesOf } from './generate';
import { namePalette } from './names';
import { type Variant } from './structure';

/**
 * Shared paths must keep meaning the same palette: this pins the generator's
 * output. If a snapshot changes on purpose, paths need a new version prefix
 * (see `seedOfSegment`).
 */
const SEEDS = [
  '#7ab4c8',
  '#e06c75',
  '#1e66f5',
  '#2a0040',
  '#000000',
  '#ffffff',
  '#808080',
  '#ffff00',
  '#00ff88',
  '#c8a27a',
];

/**
 * Seeds that the variant they were picked for moves into it: the palettes of
 * `/light/…` and `/dark/…` paths.
 */
const PICKED_SEEDS: [string, Variant][] = [
  ['#2a0040', 'light'],
  ['#000000', 'light'],
  ['#8b1a1a', 'light'],
  ['#1e3a8a', 'light'],
  ['#1e66f5', 'dark'],
  ['#ffffff', 'dark'],
];

type GoldenCase = {
  label: string;
  seed: string;
  picked?: Variant;
};

const CASES: GoldenCase[] = [
  ...SEEDS.map((seed) => ({ label: seed, seed })),
  ...PICKED_SEEDS.map(([seed, picked]) => ({
    label: `${seed} picked in ${picked}`,
    seed,
    picked,
  })),
];

const generate = (seed: string, picked?: Variant) => {
  const pair = generatePalette(seed, picked);
  if (pair === undefined) {
    throw new Error(`No palette for ${seed}`);
  }
  return pair;
};

describe('generatePalette output', () => {
  it.each(CASES)('is pinned for $label', ({ seed, picked }) => {
    const pair = generate(seed, picked);

    expect({
      slot: pair.slot,
      name: namePalette(pair).palette,
      dark: swatchesOf(pair.dark).map(({ hex }) => hex),
      light: swatchesOf(pair.light).map(({ hex }) => hex),
    }).toMatchSnapshot();
  });

  it.each(PICKED_SEEDS)('moves %s picked in %s into it', (seed, picked) => {
    expect(generate(seed, picked).slot.variant).toBe(picked);
  });
});
