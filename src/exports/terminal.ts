import { type Variant } from '@/palette';

import { ansiColors, type ANSIColors, type ThemeColor } from './syntax';

/** The colors of a terminal theme, by role. */
export type TerminalColors = {
  /** The 16 ANSI colors. */
  ansi: ANSIColors;
  /** Background. */
  background: ThemeColor;
  /** Default text. */
  foreground: ThemeColor;
  /** Bold text, when the terminal colors it apart. */
  bold: ThemeColor;
  /** The cursor block. */
  cursor: ThemeColor;
  /** Text under the cursor block. */
  cursorText: ThemeColor;
  /** Selection background. Opaque: not every terminal blends alpha. */
  selection: ThemeColor;
  /** Selected text. */
  selectionText: ThemeColor;
  /** Links. */
  link: ThemeColor;
};

/**
 * A terminal theme by role, shared by the iTerm2 and Ghostty exports and the
 * terminal preview.
 *
 * @param variant - The variant the terminal shows.
 */
export function terminalColors(variant: Variant): TerminalColors {
  return {
    ansi: ansiColors(variant),
    background: 'surface-0',
    foreground: 'ink-0',
    bold: 'ink-2',
    cursor: 'ink-0',
    cursorText: 'surface-0',
    selection: 'surface-2',
    selectionText: 'ink-2',
    link: 'hue-1',
  };
}
