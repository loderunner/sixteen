import { normalizeHue, parseHex } from '../color';
import { type PalettePair } from '../generate';
import { ACHROMATIC_CHROMA, type Group, type Variant } from '../structure';
import {
  ACHROMATIC_METAPHORS,
  type Metaphor,
  METAPHOR_FAMILIES,
} from './metaphors';

/** The names of a palette pair: one for the palette, one per group and variant. */
export type PaletteNames = {
  /** Name of the palette, e.g. `Glacier`. */
  palette: string;
  /** Group names of each variant, by group. */
  groups: Record<Variant, Record<Group, string>>;
};

/**
 * Names a palette and its groups from one metaphor, picked by the hue of the
 * primary accent and, among a family's metaphors, by the seed. The neutral
 * groups are named by tone, so the dark variant's backgrounds and the light
 * variant's text share a name.
 *
 * @param pair - A generated palette pair.
 *
 * @example
 * namePalette(generatePalette('#7ab4c8')).palette; // e.g. 'Harbor'
 */
export function namePalette(pair: PalettePair): PaletteNames {
  const metaphor = metaphorOf(pair);
  return {
    palette: metaphor.name,
    groups: {
      dark: {
        surface: metaphor.dark,
        ink: metaphor.pale,
        hue: metaphor.hue,
        signal: metaphor.many,
      },
      light: {
        surface: metaphor.pale,
        ink: metaphor.dark,
        hue: metaphor.hue,
        signal: metaphor.many,
      },
    },
  };
}

const metaphorOf = (pair: PalettePair): Metaphor => {
  const seed = parseHex(pair.seed);
  const pick = (metaphors: readonly Metaphor[]) =>
    metaphors[hash(pair.seed) % metaphors.length] ?? ACHROMATIC_METAPHORS[0];
  if (seed === undefined || seed.c < ACHROMATIC_CHROMA) {
    return pick(ACHROMATIC_METAPHORS);
  }
  const hue = normalizeHue(pair.dark.hue[1]?.color.h ?? seed.h);
  const family = METAPHOR_FAMILIES.find(
    ({ from, to }) => normalizeHue(hue - from) < to - from,
  );
  return pick(family?.metaphors ?? ACHROMATIC_METAPHORS);
};

/** FNV-1a: a small, stable string hash. */
const hash = (text: string): number => {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value;
};
