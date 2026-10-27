export { classifySeed, type SeedSlot } from './classify';
export {
  contrast,
  deltaE,
  gamutMap,
  inSRGB,
  normalizeHex,
  type OKLCH,
  parseHex,
  toHex,
} from './color';
export {
  generatePalette,
  type Palette,
  type PalettePair,
  type Swatch,
  swatchesOf,
} from './generate';
export {
  type ColorName,
  loadColorNames,
  namePalette,
  nameSwatches,
  type PaletteNames,
  type SwatchNames,
} from './names';
export { pathOfSeed, seedOfSegment } from './path';
export { randomSeed } from './random';
export {
  type Group,
  GROUP_SIZES,
  GROUPS,
  SIGNAL_ROLES,
  type SignalRole,
  type Variant,
} from './structure';

/** Seed of the palette linked from the not-found page: a mid-lightness cool cyan. */
export const DEFAULT_SEED = '#7ab4c8';
