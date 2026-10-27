import { describe, expect, it } from 'vitest';

import {
  generatePalette,
  namePalette,
  type PalettePair,
  swatchesOf,
} from '@/palette';

import { EXPORT_FORMATS, type ExportInput, slugOf } from '.';

const pairOf = (seed: string): PalettePair => {
  const pair = generatePalette(seed);
  if (pair === undefined) {
    throw new Error(`No palette for ${seed}`);
  }
  return pair;
};

const pair = pairOf('#7ab4c8');
const input: ExportInput = {
  pair,
  names: namePalette(pair),
  url: 'https://example.com/7ab4c8',
};

const allHexes = [...swatchesOf(pair.dark), ...swatchesOf(pair.light)].map(
  ({ hex }) => hex,
);

describe('slugOf', () => {
  it('makes a lowercase, dash-separated identifier', () => {
    expect(slugOf('Red Planet')).toBe('red-planet');
    expect(slugOf('  Tea House!  ')).toBe('tea-house');
  });
});

describe.each(EXPORT_FORMATS)('$name export', (format) => {
  it('is pinned for one palette', () => {
    expect(format.build(input, 'dark').content).toMatchSnapshot();
  });

  it('is named after the palette', () => {
    expect(format.build(input, 'dark').filename).toMatch(
      new RegExp(`^${slugOf(input.names.palette)}[.-]`),
    );
  });

  it('credits the seed and the link', () => {
    const { content } = format.build(input, 'dark');

    expect(content).toContain('#7ab4c8');
    expect(content).toContain('https://example.com/7ab4c8');
  });
});

describe.each(EXPORT_FORMATS.filter(({ variants }) => variants === 'both'))(
  '$name export, holding both variants',
  (format) => {
    it('lists all 32 swatches', () => {
      const { content } = format.build(input, 'dark');

      for (const hex of allHexes) {
        expect(content).toContain(hex);
      }
    });
  },
);

describe.each(
  EXPORT_FORMATS.filter(({ id }) => id === 'css' || id === 'tailwind'),
)('$name export, as CSS', (format) => {
  it('balances its braces', () => {
    const { content } = format.build(input, 'dark');

    expect(content.split('{').length).toBe(content.split('}').length);
  });

  it('switches roles with the color scheme and data-theme', () => {
    const { content } = format.build(input, 'dark');

    expect(content).toContain('@media (prefers-color-scheme: dark)');
    expect(content).toContain("[data-theme='dark']");
    expect(content).toMatch(/--surface-0: var\(--[a-z-]+-light-surface-0\);/);
    expect(content).toMatch(/--surface-0: var\(--[a-z-]+-dark-surface-0\);/);
  });
});

describe('VS Code export', () => {
  const sixteenWithAlpha = (variant: 'dark' | 'light') =>
    new RegExp(
      `^(${swatchesOf(pair[variant])
        .map(({ hex }) => hex)
        .join('|')})([0-9a-f]{2})?$`,
    );

  it.each(['dark', 'light'] as const)(
    'paints the %s theme from its 16 colors alone',
    (variant) => {
      const content =
        EXPORT_FORMATS.find(({ id }) => id === 'vscode')?.build(input, variant)
          .content ?? '{}';
      // The credit names the seed, which may belong to the other variant.
      const theme: unknown = JSON.parse(content, (key, value: unknown) =>
        key === '$comment' ? undefined : value,
      );
      const colors = JSON.stringify(theme).match(/#[0-9a-f]{6,8}/gi) ?? [];

      expect(colors.length).toBeGreaterThan(200);
      for (const color of colors) {
        expect(color).toMatch(sixteenWithAlpha(variant));
      }
    },
  );
});

describe('TextMate export', () => {
  it('is a well-formed property list', () => {
    const { content } = EXPORT_FORMATS.find(
      ({ id }) => id === 'tmtheme',
    )?.build(input, 'dark') ?? { content: '' };

    expect(content).toMatch(/^<\?xml/);
    expect(content.match(/<dict>/g)?.length).toBe(
      content.match(/<\/dict>/g)?.length,
    );
    expect(content).toContain('<key>scope</key>');
  });
});
