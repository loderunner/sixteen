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
 * Both palettes for Tailwind CSS 4, to import after `tailwindcss`. Each swatch
 * is a theme color (`bg-<slug>-dark-hue-1`), and each role is a color that
 * follows the variant in use (`bg-surface-0 text-ink-0`): by
 * `prefers-color-scheme`, overridden by `data-theme` on an ancestor.
 *
 * @param input - The palette to export.
 */
export function tailwindFile(input: ExportInput): ExportFile {
  const slug = slugOf(input.names.palette);
  const swatches = (variant: Variant) => {
    const hexes = hexByRole(input.pair[variant]);
    return ROLE_NAMES.map(
      (role) => `  --color-${slug}-${variant}-${role}: ${hexes[role]};`,
    );
  };
  const roles = (variant: Variant, indent: string) =>
    ROLE_NAMES.map(
      (role) => `${indent}--${role}: var(--color-${slug}-${variant}-${role});`,
    );
  const content = [
    `/* ${creditOf(input)}`,
    '   Import after tailwindcss: @import "./' + slug + '.tailwind.css"; */',
    '',
    '@theme {',
    ...swatches('dark'),
    '',
    ...swatches('light'),
    '}',
    '',
    '@theme inline {',
    ...ROLE_NAMES.map((role) => `  --color-${role}: var(--${role});`),
    '}',
    '',
    ":root,\n[data-theme='light'] {",
    ...roles('light', '  '),
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    "  :root:not([data-theme='light']) {",
    ...roles('dark', '    '),
    '  }',
    '}',
    '',
    "[data-theme='dark'] {",
    ...roles('dark', '  '),
    '}',
    '',
  ].join('\n');
  return { filename: `${slug}.tailwind.css`, mime: 'text/css', content };
}
