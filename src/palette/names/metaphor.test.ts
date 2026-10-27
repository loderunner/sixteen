import { describe, expect, it } from 'vitest';

import { toHex } from '../color';
import { generatePalette, type PalettePair } from '../generate';
import { namePalette } from './metaphor';
import { ACHROMATIC_METAPHORS, METAPHOR_FAMILIES } from './metaphors';

const generate = (seed: string): PalettePair => {
  const pair = generatePalette(seed);
  if (pair === undefined) {
    throw new Error(`No palette for ${seed}`);
  }
  return pair;
};

describe('METAPHOR_FAMILIES', () => {
  it('covers every hue exactly once', () => {
    for (let hue = 0; hue < 360; hue++) {
      const families = METAPHOR_FAMILIES.filter(
        ({ from, to }) => (((hue - from) % 360) + 360) % 360 < to - from,
      );

      expect(families, `hue ${hue}`).toHaveLength(1);
    }
  });

  it('never reuses a name', () => {
    const names = [
      ...METAPHOR_FAMILIES.flatMap((family) => family.metaphors),
      ...ACHROMATIC_METAPHORS,
    ].flatMap(({ name, dark, pale, hue, many }) => [
      name,
      dark,
      pale,
      hue,
      many,
    ]);

    expect(new Set(names).size).toBe(names.length);
  });
});

describe('namePalette', () => {
  it('names the groups of both variants from one metaphor', () => {
    const names = namePalette(generate('#7ab4c8'));

    expect(names.groups.dark.surface).toBe(names.groups.light.ink);
    expect(names.groups.dark.ink).toBe(names.groups.light.surface);
    expect(names.groups.dark.hue).toBe(names.groups.light.hue);
    expect(names.groups.dark.signal).toBe(names.groups.light.signal);
  });

  it('is stable for a seed', () => {
    expect(namePalette(generate('#7ab4c8'))).toEqual(
      namePalette(generate('#7AB4C8')),
    );
  });

  it('picks the family of the primary hue', () => {
    const glacierFamily = METAPHOR_FAMILIES.find(({ from }) => from === 205);
    const names = namePalette(generate(toHex({ l: 0.77, c: 0.07, h: 230 })));

    expect(glacierFamily?.metaphors.map(({ name }) => name)).toContain(
      names.palette,
    );
  });

  it('gives a gray seed an achromatic metaphor', () => {
    const names = namePalette(generate('#808080'));

    expect(ACHROMATIC_METAPHORS.map(({ name }) => name)).toContain(
      names.palette,
    );
  });
});
