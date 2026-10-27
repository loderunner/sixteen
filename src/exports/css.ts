import { type Variant } from '@/palette';

import {
  creditOf,
  type ExportFile,
  type ExportInput,
  hexByRole,
  ROLE_NAMES,
  slugOf,
} from './roles';

/**
 * Both palettes as CSS custom properties: `--<slug>-<variant>-<role>` for
 * every swatch, and `--<role>` pointing at the variant in use. The variant
 * follows `prefers-color-scheme`, and `data-theme="light"` or `"dark"` on any
 * ancestor overrides it.
 *
 * @param input - The palette to export.
 */
export function cssFile(input: ExportInput): ExportFile {
  const slug = slugOf(input.names.palette);
  const swatches = (variant: Variant) => {
    const hexes = hexByRole(input.pair[variant]);
    return ROLE_NAMES.map(
      (role) => `  --${slug}-${variant}-${role}: ${hexes[role]};`,
    );
  };
  const roles = (variant: Variant, indent: string) =>
    ROLE_NAMES.map(
      (role) => `${indent}--${role}: var(--${slug}-${variant}-${role});`,
    );
  const content = [
    `/* ${creditOf(input)} */`,
    '',
    ':root {',
    ...swatches('dark'),
    '',
    ...swatches('light'),
    '}',
    '',
    ":root,\n[data-theme='light'] {",
    '  color-scheme: light;',
    ...roles('light', '  '),
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    "  :root:not([data-theme='light']) {",
    '    color-scheme: dark;',
    ...roles('dark', '    '),
    '  }',
    '}',
    '',
    "[data-theme='dark'] {",
    '  color-scheme: dark;',
    ...roles('dark', '  '),
    '}',
    '',
  ].join('\n');
  return { filename: `${slug}.css`, mime: 'text/css', content };
}
