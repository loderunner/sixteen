import { describe, expect, it } from 'vitest';

import { generatePalette, swatchesOf } from './generate';
import { namePalette } from './names';

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

describe('generatePalette output', () => {
  it.each(SEEDS)('is pinned for %s', (seed) => {
    const pair = generatePalette(seed);
    if (pair === undefined) {
      throw new Error(`No palette for ${seed}`);
    }

    expect({
      slot: pair.slot,
      name: namePalette(pair).palette,
      dark: swatchesOf(pair.dark).map(({ hex }) => hex),
      light: swatchesOf(pair.light).map(({ hex }) => hex),
    }).toMatchSnapshot();
  });
});
