import { type Variant } from '@/palette';

import { plist, type PlistDict } from './plist';
import { creditOf, type ExportFile, type ExportInput, slugOf } from './roles';
import { colorResolver } from './syntax';
import { terminalColors } from './terminal';

const component = (hex: string, start: number) =>
  Number((Number.parseInt(hex.slice(start, start + 2), 16) / 255).toFixed(6));

const colorDict = (hex: string): PlistDict => ({
  'Alpha Component': 1,
  'Blue Component': component(hex, 5),
  'Color Space': 'sRGB',
  'Green Component': component(hex, 3),
  'Red Component': component(hex, 1),
});

const variantColors = (input: ExportInput, variant: Variant) => {
  const resolve = colorResolver(input.pair[variant]);
  const terminal = terminalColors(variant);
  const colors: Record<string, string> = {
    'Background Color': resolve(terminal.background),
    'Foreground Color': resolve(terminal.foreground),
    'Bold Color': resolve(terminal.bold),
    'Cursor Color': resolve(terminal.cursor),
    'Cursor Text Color': resolve(terminal.cursorText),
    'Selection Color': resolve(terminal.selection),
    'Selected Text Color': resolve(terminal.selectionText),
    'Link Color': resolve(terminal.link),
    'Badge Color': resolve('hue-1'),
    'Cursor Guide Color': resolve('surface-1'),
  };
  terminal.ansi.forEach((color, index) => {
    colors[`Ansi ${index} Color`] = resolve(color);
  });
  return colors;
};

/**
 * Both palettes as one iTerm2 color preset. iTerm2 3.5 and later switch
 * between them with the system appearance (keys ending in `(Dark)` and
 * `(Light)`); older versions read the plain keys, which hold the dark one.
 *
 * @param input - The palette to export.
 */
export function iterm2File(input: ExportInput): ExportFile {
  const dark = variantColors(input, 'dark');
  const light = variantColors(input, 'light');
  const root: PlistDict = {};
  for (const key of Object.keys(dark).toSorted()) {
    const darkHex = dark[key] ?? '#000000';
    root[key] = colorDict(darkHex);
    root[`${key} (Dark)`] = colorDict(darkHex);
    root[`${key} (Light)`] = colorDict(light[key] ?? '#ffffff');
  }
  const content = plist(root).replace(
    '<plist version="1.0">',
    `<!-- ${creditOf(input)} -->\n<plist version="1.0">`,
  );
  return {
    filename: `${slugOf(input.names.palette)}.itermcolors`,
    mime: 'application/xml',
    content,
  };
}
