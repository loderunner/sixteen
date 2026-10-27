import { describe, expect, it } from 'vitest';

import { pathOfSeed, seedOfSegment, variantOfSegment } from './path';

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

describe('variantOfSegment', () => {
  it('reads a variant', () => {
    expect(variantOfSegment('dark')).toBe('dark');
    expect(variantOfSegment('light')).toBe('light');
  });

  it('rejects anything else', () => {
    for (const segment of ['', 'Light', 'l', 'v2', '7ab4c8']) {
      expect(variantOfSegment(segment), `segment ${segment}`).toBeUndefined();
    }
  });
});

describe('pathOfSeed', () => {
  it('drops the hash', () => {
    expect(pathOfSeed('#7ab4c8')).toBe('/7ab4c8');
  });

  it('prefixes the variant a seed was moved to', () => {
    expect(pathOfSeed('#2a0040', 'light')).toBe('/light/2a0040');
    expect(pathOfSeed('#1e66f5', 'dark')).toBe('/dark/1e66f5');
  });

  it('leaves out a variant that holds the seed anyway', () => {
    expect(pathOfSeed('#7ab4c8', 'dark')).toBe('/7ab4c8');
  });

  it('leaves out a variant that cannot hold the seed', () => {
    expect(pathOfSeed('#7ab4c8', 'light')).toBe('/7ab4c8');
  });
});
