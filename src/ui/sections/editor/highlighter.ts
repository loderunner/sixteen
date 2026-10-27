import { type HighlighterCore, type ThemedToken } from 'shiki/core';

import { type VSCodeTheme } from '@/exports';

import { type Language } from './languages';

let highlighter: Promise<HighlighterCore> | undefined;
const loaded = new Map<string, Promise<void>>();
// Shiki re-applies a theme only when its name changes, so each new theme
// takes the name the current one does not hold.
const THEME_NAMES = ['sixteen-a', 'sixteen-b'] as const;
let currentTheme: VSCodeTheme | undefined;
let currentName: string = THEME_NAMES[0];

/**
 * The shared Shiki highlighter, with the JavaScript regex engine (no
 * WebAssembly), created on first use.
 */
const highlighterOf = (): Promise<HighlighterCore> => {
  highlighter ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
    createHighlighterCore({
      themes: [],
      langs: [],
      // Some grammars use regex features JavaScript lacks: skip those rules
      // rather than fail the whole language.
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    }),
  );
  return highlighter;
};

/**
 * Loads a language's grammar into the highlighter, once.
 *
 * @param language - The language to load.
 * @returns The highlighter, ready for it.
 */
export async function prepareLanguage(
  language: Language,
): Promise<HighlighterCore> {
  const core = await highlighterOf();
  let loading = loaded.get(language.id);
  if (loading === undefined) {
    loading = language.load().then(({ default: grammar }) => {
      return core.loadLanguage(...grammar);
    });
    loaded.set(language.id, loading);
  }
  await loading;
  return core;
}

/**
 * Colors code with a VS Code theme, exactly as VS Code would: same grammar,
 * same theme rules.
 *
 * @param core - A highlighter with the language loaded.
 * @param code - The code.
 * @param language - Its language.
 * @param theme - The theme to color with.
 * @returns The tokens of each line.
 */
export function tokenize(
  core: HighlighterCore,
  code: string,
  language: Language,
  theme: VSCodeTheme,
): ThemedToken[][] {
  if (theme !== currentTheme) {
    currentName =
      currentName === THEME_NAMES[0] ? THEME_NAMES[1] : THEME_NAMES[0];
    // Loading a theme under a name replaces the previous one of that name.
    core.loadThemeSync({ ...theme, name: currentName });
    currentTheme = theme;
  }
  return core.codeToTokens(code, {
    lang: language.id,
    theme: currentName,
  }).tokens;
}
