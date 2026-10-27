import { describe, expect, it } from 'vitest';

import { generatePalette, type PalettePair } from '../generate';
import { type ColorName, loadColorNames, nameSwatches } from './swatch-names';

const generate = (seed: string): PalettePair => {
  const pair = generatePalette(seed);
  if (pair === undefined) {
    throw new Error(`No palette for ${seed}`);
  }
  return pair;
};

describe('nameSwatches', () => {
  it('names the seed after an exact match', () => {
    const names: ColorName[] = [
      { name: 'Exactly Seed', hex: '#7ab4c8' },
      { name: 'Near Seed', hex: '#7ab4c9' },
      { name: 'Black', hex: '#000000' },
    ];

    const result = nameSwatches(generate('#7ab4c8'), names);

    expect(result.dark[8]).toBe('Exactly Seed');
  });

  it('uses each name at most once per variant', async () => {
    const names = await loadColorNames();

    const result = nameSwatches(generate('#7ab4c8'), names);

    expect(result.dark).toHaveLength(16);
    expect(new Set(result.dark).size).toBe(16);
    expect(new Set(result.light).size).toBe(16);
  });

  it('leaves swatches unnamed when names run out', () => {
    const result = nameSwatches(generate('#7ab4c8'), [
      { name: 'Only', hex: '#000000' },
    ]);

    expect(result.dark.filter((name) => name === 'Only')).toHaveLength(1);
    expect(result.dark.filter((name) => name === '')).toHaveLength(15);
  });
});
