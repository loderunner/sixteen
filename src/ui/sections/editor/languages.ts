import { type LanguageRegistration } from 'shiki/core';

import css from './samples/css.txt?raw';
import go from './samples/go.txt?raw';
import html from './samples/html.txt?raw';
import javascript from './samples/javascript.txt?raw';
import json from './samples/json.txt?raw';
import markdown from './samples/markdown.txt?raw';
import python from './samples/python.txt?raw';
import rust from './samples/rust.txt?raw';
import shellscript from './samples/shellscript.txt?raw';
import sql from './samples/sql.txt?raw';
import typescript from './samples/typescript.txt?raw';
import yaml from './samples/yaml.txt?raw';

type GrammarModule = { default: LanguageRegistration[] };

/** A language the editor can show. */
export type Language = {
  /** Shiki's language id. */
  id: string;
  /** Name shown to the user. */
  name: string;
  /** File name shown on the editor tab. */
  file: string;
  /** Sample code that shows off its syntax colors. */
  sample: string;
  /** Loads its TextMate grammar (and those it embeds). */
  load: () => Promise<GrammarModule>;
};

/** The languages offered, in menu order. */
export const LANGUAGES: readonly Language[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    file: 'palette.ts',
    sample: typescript,
    load: () => import('shiki/langs/typescript.mjs'),
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    file: 'ladder.js',
    sample: javascript,
    load: () => import('shiki/langs/javascript.mjs'),
  },
  {
    id: 'python',
    name: 'Python',
    file: 'swatch.py',
    sample: python,
    load: () => import('shiki/langs/python.mjs'),
  },
  {
    id: 'rust',
    name: 'Rust',
    file: 'oklch.rs',
    sample: rust,
    load: () => import('shiki/langs/rust.mjs'),
  },
  {
    id: 'go',
    name: 'Go',
    file: 'palette.go',
    sample: go,
    load: () => import('shiki/langs/go.mjs'),
  },
  {
    id: 'css',
    name: 'CSS',
    file: 'card.css',
    sample: css,
    load: () => import('shiki/langs/css.mjs'),
  },
  {
    id: 'html',
    name: 'HTML',
    file: 'index.html',
    sample: html,
    load: () => import('shiki/langs/html.mjs'),
  },
  {
    id: 'json',
    name: 'JSON',
    file: 'harbor.json',
    sample: json,
    load: () => import('shiki/langs/json.mjs'),
  },
  {
    id: 'markdown',
    name: 'Markdown',
    file: 'README.md',
    sample: markdown,
    load: () => import('shiki/langs/markdown.mjs'),
  },
  {
    id: 'shellscript',
    name: 'Shell',
    file: 'install.sh',
    sample: shellscript,
    load: () => import('shiki/langs/shellscript.mjs'),
  },
  {
    id: 'sql',
    name: 'SQL',
    file: 'shared.sql',
    sample: sql,
    load: () => import('shiki/langs/sql.mjs'),
  },
  {
    id: 'yaml',
    name: 'YAML',
    file: 'build.yaml',
    sample: yaml,
    load: () => import('shiki/langs/yaml.mjs'),
  },
];
