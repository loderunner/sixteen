import { describe, expect, it } from 'vitest';

import { classifySeed } from './classify';
import { type OKLCH, parseHex } from './color';

const seed = (hex: string): OKLCH => {
  const color = parseHex(hex);
  if (color === undefined) {
    throw new Error(`Invalid hex ${hex}`);
  }
  return color;
};

describe('classifySeed', () => {
  describe('colorful seeds', () => {
    it('makes a light pastel the primary accent of the dark variant', () => {
      expect(classifySeed(seed('#7ab4c8'))).toEqual({
        variant: 'dark',
        group: 'hue',
        index: 1,
      });
    });

    it('puts a mid-dark accent in the deep slot of the dark variant', () => {
      expect(classifySeed({ l: 0.61, c: 0.1, h: 250 })).toEqual({
        variant: 'dark',
        group: 'hue',
        index: 3,
      });
    });

    it('puts a dark accent in the light variant', () => {
      expect(classifySeed(seed('#1e66f5'))).toMatchObject({
        variant: 'light',
        group: 'hue',
      });
    });

    it('keeps a vivid near-white color an accent', () => {
      expect(classifySeed(seed('#ffff00'))).toMatchObject({ group: 'hue' });
    });
  });

  describe('neutral seeds', () => {
    it('makes black the darkest background', () => {
      expect(classifySeed(seed('#000000'))).toEqual({
        variant: 'dark',
        group: 'surface',
        index: 0,
      });
    });

    it('makes a very dark color a background, however colorful', () => {
      expect(classifySeed(seed('#2a0040'))).toMatchObject({
        variant: 'dark',
        group: 'surface',
      });
    });

    it('makes white the lightest background', () => {
      expect(classifySeed(seed('#ffffff'))).toEqual({
        variant: 'light',
        group: 'surface',
        index: 0,
      });
    });

    it('makes an off-white the text of the dark variant', () => {
      expect(classifySeed({ l: 0.9, c: 0.01, h: 250 })).toEqual({
        variant: 'dark',
        group: 'ink',
        index: 0,
      });
    });

    it('makes a mid gray the comment color of the light variant', () => {
      expect(classifySeed(seed('#808080'))).toEqual({
        variant: 'light',
        group: 'surface',
        index: 3,
      });
    });
  });
});
