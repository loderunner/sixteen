import { describe, expect, it } from 'vitest';

import {
  contrast,
  deltaE,
  hueDistance,
  type OKLCH,
  parseHex,
  toHex,
} from './color';
import { generatePalette, type PalettePair, swatchesOf } from './generate';
import { SIGNAL_WINDOWS, type Variant } from './structure';

/** Seeds across the whole color space, as hex, without duplicates. */
const GRID = [
  ...new Set(
    [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].flatMap((h) =>
      [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 0.97].flatMap((l) =>
        [0, 0.02, 0.06, 0.12, 0.2, 0.3].map((c) => toHex({ l, c, h })),
      ),
    ),
  ),
  '#000000',
  '#ffffff',
  '#808080',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
];

const VARIANTS: Variant[] = ['dark', 'light'];

const generate = (seed: string, picked?: Variant): PalettePair => {
  const pair = generatePalette(seed, picked);
  if (pair === undefined) {
    throw new Error(`No palette for ${seed}`);
  }
  return pair;
};

/** Every grid seed, unpicked and picked in each variant. */
const PAIRS = GRID.flatMap((seed) => [
  generate(seed),
  ...VARIANTS.map((variant) => generate(seed, variant)),
]);

const colorOf = (hex: string): OKLCH => {
  const color = parseHex(hex);
  if (color === undefined) {
    throw new Error(`Invalid hex ${hex}`);
  }
  return color;
};

describe('generatePalette', () => {
  it('rejects text that is not a hex color', () => {
    expect(generatePalette('teal')).toBeUndefined();
  });

  it('accepts hex without # and in any case', () => {
    expect(generatePalette('7AB4C8')?.seed).toBe('#7ab4c8');
  });

  it('has 4 + 3 + 4 + 5 swatches in each variant', () => {
    const pair = generate('#7ab4c8');

    for (const variant of VARIANTS) {
      expect(pair[variant].surface).toHaveLength(4);
      expect(pair[variant].ink).toHaveLength(3);
      expect(pair[variant].hue).toHaveLength(4);
      expect(pair[variant].signal).toHaveLength(5);
    }
  });

  it('makes a pastel the primary accent of the dark variant', () => {
    const pair = generate('#7ab4c8');

    expect(pair.slot).toEqual({ variant: 'dark', group: 'hue', index: 1 });
    expect(pair.dark.hue[1]?.hex).toBe('#7ab4c8');
  });

  it('builds a dark background seed into a ladder of backgrounds', () => {
    const pair = generate('#000000');
    const lightness = pair.dark.surface.map(({ color }) => color.l);

    expect(pair.dark.surface[0]?.hex).toBe('#000000');
    expect(lightness).toEqual(lightness.toSorted((a, b) => a - b));
  });

  it('gives a pure gray seed gray neutrals', () => {
    const pair = generate('#808080');

    for (const variant of VARIANTS) {
      for (const swatch of [...pair[variant].surface, ...pair[variant].ink]) {
        expect(swatch.color.c).toBeLessThan(0.005);
      }
    }
  });

  describe('over a grid of seeds', () => {
    it('is deterministic', () => {
      for (const seed of GRID.slice(0, 40)) {
        expect(generate(seed)).toEqual(generate(seed));
      }
    });

    it('holds the seed exactly in its slot', () => {
      for (const pair of PAIRS) {
        const { variant, group, index } = pair.slot;

        expect(pair[variant][group][index]?.hex).toBe(pair.seed);
      }
    });

    it('describes every swatch by its own hex', () => {
      for (const pair of PAIRS) {
        for (const variant of VARIANTS) {
          for (const swatch of swatchesOf(pair[variant])) {
            expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/);
            expect(deltaE(swatch.color, colorOf(swatch.hex))).toBeLessThan(
              0.005,
            );
          }
        }
      }
    });

    it('keeps every two swatches of a variant apart', () => {
      for (const pair of PAIRS) {
        for (const variant of VARIANTS) {
          const swatches = swatchesOf(pair[variant]);
          swatches.forEach((a, i) => {
            for (const b of swatches.slice(i + 1)) {
              expect(
                deltaE(a.color, b.color),
                `${pair.seed} ${variant} ${a.hex} ${b.hex}`,
              ).toBeGreaterThanOrEqual(0.012);
            }
          });
        }
      }
    });

    it('makes text readable on the background', () => {
      for (const pair of PAIRS) {
        for (const variant of VARIANTS) {
          const { surface, ink } = pair[variant];
          const ratio = contrast(
            ink[0]?.color ?? colorOf('#000'),
            surface[0]?.color ?? colorOf('#000'),
          );

          expect(ratio, `${pair.seed} ${variant}`).toBeGreaterThanOrEqual(7);
        }
      }
    });

    it('makes the primary accent visible on the background', () => {
      for (const pair of PAIRS) {
        for (const variant of VARIANTS) {
          const { surface, hue } = pair[variant];
          const ratio = contrast(
            hue[1]?.color ?? colorOf('#000'),
            surface[0]?.color ?? colorOf('#000'),
          );

          expect(ratio, `${pair.seed} ${variant}`).toBeGreaterThanOrEqual(3);
        }
      }
    });

    it('keeps the semantic signals in their hue windows', () => {
      const windows = [
        SIGNAL_WINDOWS.red,
        SIGNAL_WINDOWS.orange,
        SIGNAL_WINDOWS.yellow,
        SIGNAL_WINDOWS.green,
      ];
      for (const pair of PAIRS) {
        for (const variant of VARIANTS) {
          windows.forEach((window, index) => {
            const swatch = pair[variant].signal[index] ?? pair[variant].hue[1];
            const middle = (window.from + window.to) / 2;
            const halfWidth = (window.to - window.from) / 2;
            // Gamut mapping nudges the hue of the most vivid colors a little.
            expect(
              hueDistance(swatch.color.h, middle),
              `${pair.seed} ${variant} ${swatch.hex}`,
            ).toBeLessThanOrEqual(halfWidth + 10);
          });
        }
      }
    });
  });
});
