import { describe, expect, it } from 'vitest';

import { channelGradient, HSL, HSV, OKLCH_SPACE, RGB } from './spaces';

const HEXES = ['#7ab4c8', '#e06c75', '#000000', '#ffffff', '#1e66f5'];

describe('color spaces', () => {
  it.each([RGB, HSL, HSV, OKLCH_SPACE])(
    'round-trips hex through $name',
    (space) => {
      for (const hex of HEXES) {
        expect(space.toHex(space.fromHex(hex))).toBe(hex);
      }
    },
  );

  it('gamut-maps OKLCH colors past the sRGB edge', () => {
    expect(OKLCH_SPACE.toHex([70, 0.37, 220])).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('channelGradient', () => {
  it('runs from the channel minimum to its maximum', () => {
    const gradient = channelGradient(RGB, [0, 0, 0], 0);

    expect(gradient).toMatch(/^linear-gradient\(to right, #000000, /);
    expect(gradient).toMatch(/#ff0000\)$/);
  });
});
