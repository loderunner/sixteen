import { type Group, type Variant } from '@/palette';

/** What each swatch is for, by group, in palette order. */
export const SWATCH_ROLES: Record<Variant, Record<Group, string[]>> = {
  dark: {
    surface: ['Page', 'Panels', 'Selection', 'Comments and borders'],
    ink: ['Text', 'Brighter text', 'Brightest text'],
    hue: ['Calm accent', 'Primary', 'Secondary', 'Deep accent'],
    signal: ['Error', 'Annotation', 'Warning', 'Success', 'Rare'],
  },
  light: {
    surface: ['Page', 'Panels', 'Selection', 'Comments and borders'],
    ink: ['Text', 'Darker text', 'Darkest text'],
    hue: ['Calm accent', 'Primary', 'Secondary', 'Deep accent'],
    signal: ['Error', 'Annotation', 'Warning', 'Success', 'Rare'],
  },
};

/** What each group is for. */
export const GROUP_DESCRIPTIONS: Record<Group, string> = {
  surface: 'Four backgrounds, from the page up to the faded ink of comments.',
  ink: 'Three text colors, in steps of emphasis.',
  hue: 'Four accents in your color’s hue, for what code is made of.',
  signal: 'Five accents around the rest of the wheel, each with one meaning.',
};
