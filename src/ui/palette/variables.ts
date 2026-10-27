import {
  type Palette,
  type PalettePair,
  SIGNAL_ROLES,
  type Variant,
} from '@/palette';

/**
 * The role names of a palette's 16 swatches, as used by the CSS custom
 * properties and the Tailwind tokens in `styles.css`.
 */
export const ROLE_NAMES = [
  'surface-0',
  'surface-1',
  'surface-2',
  'surface-3',
  'ink-0',
  'ink-1',
  'ink-2',
  'hue-0',
  'hue-1',
  'hue-2',
  'hue-3',
  ...SIGNAL_ROLES.map((role) => `signal-${role}`),
] as const;

const hexesOf = ({ surface, ink, hue, signal }: Palette) =>
  [...surface, ...ink, ...hue, ...signal].map(({ hex }) => hex);

/**
 * The custom properties that theme the page with a pair: `--dark-<role>` and
 * `--light-<role>` for each of the 16 roles. `styles.css` points the role
 * tokens at one variant or the other through `data-theme`.
 *
 * @param pair - A generated palette pair.
 */
export function paletteVariables(pair: PalettePair): Record<string, string> {
  const variables: Record<string, string> = {};
  const add = (variant: Variant) => {
    hexesOf(pair[variant]).forEach((hex, index) => {
      variables[`--${variant}-${ROLE_NAMES[index]}`] = hex;
    });
  };
  add('dark');
  add('light');
  return variables;
}

/**
 * Themes the page with a pair, by setting its custom properties on `<html>`.
 *
 * @param pair - A generated palette pair.
 */
export function applyPalette(pair: PalettePair): void {
  const { style } = document.documentElement;
  for (const [name, value] of Object.entries(paletteVariables(pair))) {
    style.setProperty(name, value);
  }
}
