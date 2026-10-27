import { type Variant } from '@/palette';

import { creditOf, type ExportFile, type ExportInput } from './roles';
import { colorResolver } from './syntax';
import { terminalColors } from './terminal';

/**
 * The name Ghostty knows a theme by: its file name.
 *
 * @param input - The palette.
 * @param variant - Which palette of the pair.
 */
export function ghosttyThemeName(
  { names }: ExportInput,
  variant: Variant,
): string {
  return `${names.palette} ${variant === 'dark' ? 'Dark' : 'Light'}`;
}

/**
 * One palette as a Ghostty theme, for `~/.config/ghostty/themes/`. Ghostty
 * themes hold one palette; `theme = light:…,dark:…` in the config switches
 * between the two with the system appearance.
 *
 * @param input - The palette to export.
 * @param variant - Which palette of the pair.
 */
export function ghosttyFile(input: ExportInput, variant: Variant): ExportFile {
  const resolve = colorResolver(input.pair[variant]);
  const terminal = terminalColors(variant);
  const content = [
    `# ${creditOf(input)}`,
    ...terminal.ansi.map(
      (color, index) => `palette = ${index}=${resolve(color)}`,
    ),
    `background = ${resolve(terminal.background)}`,
    `foreground = ${resolve(terminal.foreground)}`,
    `cursor-color = ${resolve(terminal.cursor)}`,
    `cursor-text = ${resolve(terminal.cursorText)}`,
    `selection-background = ${resolve(terminal.selection)}`,
    `selection-foreground = ${resolve(terminal.selectionText)}`,
    '',
  ].join('\n');
  return {
    filename: ghosttyThemeName(input, variant),
    mime: 'text/plain',
    content,
  };
}

/**
 * The line of a Ghostty config that switches between the two themes.
 *
 * @param input - The palette.
 */
export function ghosttyConfigLine(input: ExportInput): string {
  return `theme = light:${ghosttyThemeName(input, 'light')},dark:${ghosttyThemeName(input, 'dark')}`;
}
