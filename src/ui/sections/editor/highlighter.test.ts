import { describe, expect, it } from 'vitest';

import { vscodeTheme } from '@/exports';
import { generatePalette, namePalette, type PalettePair } from '@/palette';

import { prepareLanguage, tokenize } from './highlighter';
import { LANGUAGES } from './languages';

const pairOf = (seed: string): PalettePair => {
  const pair = generatePalette(seed);
  if (pair === undefined) {
    throw new Error(`No palette for ${seed}`);
  }
  return pair;
};

const themeOf = (seed: string) => {
  const pair = pairOf(seed);
  return vscodeTheme({ pair, names: namePalette(pair) }, 'dark');
};

const colorsOf = (tokens: ReturnType<typeof tokenize>) =>
  tokens.flat().map(({ color }) => color);

describe('tokenize', () => {
  const [language] = LANGUAGES;

  it('colors with each new theme, not the first one loaded', async () => {
    const core = await prepareLanguage(language);
    const first = tokenize(core, language.sample, language, themeOf('#7ab4c8'));
    const second = tokenize(
      core,
      language.sample,
      language,
      themeOf('#c87a9e'),
    );

    expect(colorsOf(second)).not.toEqual(colorsOf(first));
  });

  it('colors the same as a fresh load when a theme returns', async () => {
    const core = await prepareLanguage(language);
    const theme = themeOf('#7ab4c8');
    const before = tokenize(core, language.sample, language, theme);
    tokenize(core, language.sample, language, themeOf('#c87a9e'));
    const after = tokenize(core, language.sample, language, themeOf('#7ab4c8'));

    expect(colorsOf(after)).toEqual(colorsOf(before));
  });
});
