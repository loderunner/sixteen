import { type Variant } from '@/palette';

import { cssFile } from './css';
import { ghosttyConfigLine, ghosttyFile } from './ghostty';
import { iterm2File } from './iterm2';
import { type ExportFile, type ExportInput } from './roles';
export {
  ansiColors,
  colorResolver,
  type ThemeColor,
  TOKEN_RULES,
  type TokenRule,
} from './syntax';
export { terminalColors, type TerminalColors } from './terminal';
export { vscodeTheme, type VSCodeTheme } from './vscode';
import { tailwindFile } from './tailwind';
import { textFile } from './text';
import { tmThemeFile } from './tmtheme';
import { vscodeFile } from './vscode';

export {
  type ExportFile,
  type ExportInput,
  hexByRole,
  ROLE_NAMES,
  type RoleName,
  slugOf,
} from './roles';

/** A file format the palette exports to. */
export type ExportFormat = {
  /** Stable identifier. */
  id: string;
  /** Name shown to the user. */
  name: string;
  /** What the file is for. */
  description: string;
  /** Whether one file holds both variants, or there is one file per variant. */
  variants: 'both' | 'each';
  /** Builds the file; `variant` matters only for `each` formats. */
  build: (input: ExportInput, variant: Variant) => ExportFile;
  /** A line of setup to show with the file, if it needs one. */
  setup?: (input: ExportInput) => string;
};

/** Every export format, in the order they are offered. */
export const EXPORT_FORMATS: readonly ExportFormat[] = [
  {
    id: 'vscode',
    name: 'VS Code',
    description:
      'A color theme for the editor, the workbench and the terminal, from the 16 colors alone.',
    variants: 'each',
    build: vscodeFile,
  },
  {
    id: 'tmtheme',
    name: 'TextMate',
    description: 'A .tmTheme for Sublime Text, bat and other TextMate tools.',
    variants: 'each',
    build: tmThemeFile,
  },
  {
    id: 'iterm2',
    name: 'iTerm2',
    description:
      'A color preset with both palettes; iTerm2 3.5 follows the system appearance.',
    variants: 'both',
    build: iterm2File,
  },
  {
    id: 'ghostty',
    name: 'Ghostty',
    description:
      'A theme file for ~/.config/ghostty/themes. Get both, then add this line to your config:',
    variants: 'each',
    build: ghosttyFile,
    setup: ghosttyConfigLine,
  },
  {
    id: 'css',
    name: 'CSS',
    description:
      'Custom properties for every swatch, and role variables that follow the color scheme.',
    variants: 'both',
    build: cssFile,
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS 4',
    description:
      'Theme colors for every swatch, and role colors like bg-surface-0 that follow the color scheme.',
    variants: 'both',
    build: tailwindFile,
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Both palettes as a plain list of hex values and names.',
    variants: 'both',
    build: textFile,
  },
];
