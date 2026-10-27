import { type Variant } from '@/palette';

import { plist, type PlistDict } from './plist';
import { creditOf, type ExportFile, type ExportInput, slugOf } from './roles';
import { colorResolver, COMMENT, TOKEN_RULES } from './syntax';

/**
 * One palette as a TextMate theme (`.tmTheme`), for Sublime Text, bat, and
 * other TextMate-grammar tools. Same rules as the VS Code theme.
 *
 * @param input - The palette to export.
 * @param variant - Which palette of the pair.
 */
export function tmThemeFile(input: ExportInput, variant: Variant): ExportFile {
  const resolve = colorResolver(input.pair[variant]);
  const name = `${input.names.palette} ${variant === 'dark' ? 'Dark' : 'Light'}`;
  const rules = TOKEN_RULES.map(
    ({ scope, foreground, background, fontStyle }): PlistDict => {
      const settings: PlistDict = {};
      if (foreground !== undefined) {
        settings.foreground = resolve(foreground);
      }
      if (background !== undefined) {
        settings.background = resolve(background);
      }
      if (fontStyle !== undefined) {
        settings.fontStyle = fontStyle;
      }
      return { name: scope[0] ?? '', scope: scope.join(', '), settings };
    },
  );
  const content = plist({
    name,
    comment: creditOf(input),
    semanticClass: `theme.${variant}.${slugOf(input.names.palette)}`,
    settings: [
      {
        settings: {
          background: resolve('surface-0'),
          foreground: resolve('ink-0'),
          caret: resolve('ink-0'),
          selection: resolve('surface-2/cc'),
          lineHighlight: resolve('surface-1'),
          invisibles: resolve('surface-3/b3'),
          gutter: resolve('surface-0'),
          gutterForeground: resolve('surface-3'),
          findHighlight: resolve('hue-1/66'),
          guide: resolve('surface-2/b3'),
          activeGuide: resolve('surface-3'),
          comment: resolve(COMMENT),
        },
      },
      ...rules,
    ],
  });
  return {
    filename: `${slugOf(input.names.palette)}-${variant}.tmTheme`,
    mime: 'application/xml',
    content,
  };
}
