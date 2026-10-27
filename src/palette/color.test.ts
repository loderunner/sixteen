import { describe, expect, it } from 'vitest';

import {
  contrast,
  deltaE,
  gamutMap,
  hueDelta,
  hueDistance,
  inSRGB,
  normalizeHex,
  normalizeHue,
  parseHex,
  toHex,
} from './color';

describe('normalizeHex', () => {
  it('lowercases and adds the hash', () => {
    expect(normalizeHex('7AB4C8')).toBe('#7ab4c8');
    expect(normalizeHex('#7ab4c8')).toBe('#7ab4c8');
  });

  it('expands 3-digit hex', () => {
    expect(normalizeHex('#AbC')).toBe('#aabbcc');
  });

  it('rejects anything else', () => {
    expect(normalizeHex('7ab4c')).toBeUndefined();
    expect(normalizeHex('#7ab4c8ff')).toBeUndefined();
    expect(normalizeHex('blue')).toBeUndefined();
    expect(normalizeHex('')).toBeUndefined();
  });
});

describe('parseHex', () => {
  it('converts white and black', () => {
    expect(parseHex('#ffffff')?.l).toBeCloseTo(1, 5);
    expect(parseHex('#000000')?.l).toBeCloseTo(0, 5);
  });

  it('gives grays no chroma and hue 0', () => {
    const gray = parseHex('#808080');

    expect(gray?.c).toBeCloseTo(0, 5);
    expect(gray?.h).toBe(0);
  });

  it('round-trips through toHex', () => {
    for (const hex of ['#7ab4c8', '#ff0000', '#123456', '#fedcba']) {
      const color = parseHex(hex);

      expect(color).toBeDefined();
      expect(toHex(color ?? { l: 0, c: 0, h: 0 })).toBe(hex);
    }
  });

  it('rejects invalid text', () => {
    expect(parseHex('nope')).toBeUndefined();
  });
});

describe('gamutMap', () => {
  it('keeps colors that already fit', () => {
    const color = { l: 0.7, c: 0.05, h: 220 };

    expect(gamutMap(color).c).toBeCloseTo(0.05, 3);
  });

  it('lowers the chroma of colors outside sRGB', () => {
    const vivid = { l: 0.7, c: 0.35, h: 220 };
    const mapped = gamutMap(vivid);

    expect(inSRGB(vivid)).toBe(false);
    expect(mapped.c).toBeLessThan(0.35);
    expect(mapped.l).toBeCloseTo(0.7, 1);
  });
});

describe('deltaE', () => {
  it('is 0 for the same color', () => {
    const color = { l: 0.5, c: 0.1, h: 30 };

    expect(deltaE(color, color)).toBe(0);
  });

  it('is 1 between black and white', () => {
    expect(deltaE({ l: 0, c: 0, h: 0 }, { l: 1, c: 0, h: 0 })).toBeCloseTo(
      1,
      5,
    );
  });
});

describe('contrast', () => {
  it('is 21 for black on white', () => {
    expect(contrast({ l: 0, c: 0, h: 0 }, { l: 1, c: 0, h: 0 })).toBeCloseTo(
      21,
      1,
    );
  });
});

describe('hue helpers', () => {
  it('normalizes angles', () => {
    expect(normalizeHue(-30)).toBe(330);
    expect(normalizeHue(390)).toBe(30);
  });

  it('takes the short way round', () => {
    expect(hueDelta(350, 10)).toBe(20);
    expect(hueDelta(10, 350)).toBe(-20);
    expect(hueDistance(350, 10)).toBe(20);
  });
});
