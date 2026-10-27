import { describe, expect, it } from 'vitest';

import { pathOfSeed, seedOfSegment } from './path';

describe('seedOfSegment', () => {
  it('reads a 6-digit hex segment', () => {
    expect(seedOfSegment('7ab4c8')).toBe('#7ab4c8');
  });

  it('normalizes case and 3-digit hex', () => {
    expect(seedOfSegment('7AB4C8')).toBe('#7ab4c8');
    expect(seedOfSegment('7ab')).toBe('#77aabb');
  });

  it('rejects anything else', () => {
    for (const segment of ['', '#7ab4c8', '7ab4c', '7ab4c8ff', 'teal', 'v2']) {
      expect(seedOfSegment(segment), `segment ${segment}`).toBeUndefined();
    }
  });

  it('round-trips with pathOfSeed', () => {
    const seed = '#7ab4c8';

    expect(seedOfSegment(pathOfSeed(seed).slice(1))).toBe(seed);
  });
});

describe('pathOfSeed', () => {
  it('drops the hash', () => {
    expect(pathOfSeed('#7ab4c8')).toBe('/7ab4c8');
  });
});
