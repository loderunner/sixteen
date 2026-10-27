import { type HighlighterCore, type ThemedToken } from 'shiki/core';

import { type VSCodeTheme } from '@/exports';

import { type Language } from './languages';

let highlighter: Promise<HighlighterCore> | undefined;
const loaded = new Map<string, Promise<void>>();
const themesLoaded = new WeakSet<VSCodeTheme>();

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
  if (!themesLoaded.has(theme)) {
    // Loading a theme under a name replaces the previous one of that name.
    core.loadThemeSync({ ...theme, name: `sixteen-${theme.type}` });
    themesLoaded.add(theme);
  }
  return core.codeToTokens(code, {
    lang: language.id,
    theme: `sixteen-${theme.type}`,
  }).tokens;
}
