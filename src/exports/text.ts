import { GROUP_SIZES, GROUPS, swatchesOf } from '@/palette';

import {
  creditOf,
  type ExportFile,
  type ExportInput,
  slugOf,
  VARIANTS,
} from './roles';

const GROUP_ROLES = {
  surface: 'backgrounds',
  ink: 'text',
  hue: 'in-hue accents',
  signal: 'out-of-hue accents',
} as const;

/**
 * Both palettes as plain text: one swatch per line, with its hex and name,
 * under its group.
 *
 * @param input - The palette to export.
 */
export function textFile(input: ExportInput): ExportFile {
  const { pair, names, swatchNames } = input;
  const lines = [creditOf(input), ''];
  for (const variant of VARIANTS) {
    lines.push(variant === 'dark' ? 'Dark' : 'Light');
    const swatches = swatchesOf(pair[variant]);
    let index = 0;
    for (const group of GROUPS) {
      lines.push(`  ${names.groups[variant][group]} (${GROUP_ROLES[group]})`);
      for (let position = 0; position < GROUP_SIZES[group]; position++) {
        const name = swatchNames?.[variant][index] ?? '';
        lines.push(
          `    ${String(index).padStart(2)}  ${swatches[index]?.hex ?? ''}  ${name}`.trimEnd(),
        );
        index++;
      }
    }
    lines.push('');
  }
  return {
    filename: `${slugOf(names.palette)}.txt`,
    mime: 'text/plain',
    content: lines.join('\n'),
  };
}
