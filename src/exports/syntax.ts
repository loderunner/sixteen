import { type Palette, type Variant } from '@/palette';

import { hexByRole, ROLE_NAMES, type RoleName } from './roles';

/**
 * A color of a theme: one of the 16 roles, optionally with an alpha channel
 * as two hex digits. `ink-0/8c` is body text at 55% opacity.
 */
export type ThemeColor = RoleName | `${RoleName}/${string}`;

/**
 * Comments: body text, faded. Not a 17th color, but no swatch alone is
 * readable enough and quiet enough for them.
 */
export const COMMENT: ThemeColor = 'ink-0/8c';

/** One syntax highlighting rule, shared by every editor theme format. */
export type TokenRule = {
  /** TextMate scopes the rule applies to. */
  scope: string[];
  /** Text color. */
  foreground?: ThemeColor;
  /** Background color. */
  background?: ThemeColor;
  /** `bold`, `italic` and/or `underline`, space-separated. */
  fontStyle?: string;
};

/**
 * Syntax colors by role, following the shape of Nord's editor theme:
 *
 * - the primary in-hue accent (`hue-1`) for functions, what code does;
 * - the deeper `hue-2` for keywords, operators, tags, what code is built of;
 * - the calm `hue-0` for types, classes and attributes;
 * - the deep `hue-3` for preprocessor directives and attributes;
 * - signals by meaning: strings are green, numbers rare, escapes and regular
 *   expressions yellow, decorators orange, errors red;
 * - neutrals for the rest: variables in body text, punctuation brightest.
 */
export const TOKEN_RULES: readonly TokenRule[] = [
  { scope: ['emphasis', 'markup.italic'], fontStyle: 'italic' },
  { scope: ['strong', 'markup.bold'], fontStyle: 'bold' },
  {
    scope: [
      'comment',
      'punctuation.definition.comment',
      'markup.quote',
      'string.comment',
    ],
    foreground: COMMENT,
  },
  {
    scope: [
      'constant.character',
      'constant.character.escape',
      'constant.regexp',
      'string.regexp',
      'constant.other.placeholder',
      'punctuation.definition.interpolation',
    ],
    foreground: 'signal-yellow',
  },
  {
    scope: ['constant.numeric', 'constant.other.color', 'keyword.other.unit'],
    foreground: 'signal-rare',
  },
  {
    scope: [
      'constant.language',
      'keyword',
      'keyword.operator',
      'keyword.control',
      'storage',
      'storage.type',
      'storage.modifier',
      'variable.language',
      'entity.name.tag',
      'punctuation.definition.tag',
      'punctuation.terminator',
      'punctuation.separator.key-value',
      'punctuation.section.embedded',
      'punctuation.definition.template-expression',
      'punctuation.definition.variable',
      'support.constant',
      'support.type.primitive',
      'support.function.construct',
      'markup.list punctuation.definition.list.begin',
      'punctuation.definition.heading',
    ],
    foreground: 'hue-2',
  },
  {
    scope: [
      'entity.name.type',
      'entity.name.class',
      'entity.name.namespace',
      'entity.other.attribute-name',
      'entity.other.inherited-class',
      'support.class',
      'support.type',
      'support.type.exception',
      'storage.type.class.jsdoc',
      'markup.inline.raw',
      'markup.fenced_code.block',
      'entity.name.type.module',
    ],
    foreground: 'hue-0',
  },
  {
    scope: [
      'entity.name.function',
      'support.function',
      'meta.function-call entity.name.function',
      'support.type.property-name.json',
      'markup.heading',
      'entity.name.section',
      'markup.underline.link',
      'string.other.link',
      'meta.property-value',
    ],
    foreground: 'hue-1',
  },
  {
    scope: [
      'meta.preprocessor',
      'keyword.control.directive',
      'meta.attribute',
      'meta.tag.sgml.doctype',
      'keyword.other.doctype',
    ],
    foreground: 'hue-3',
  },
  {
    scope: [
      'meta.decorator',
      'punctuation.decorator',
      'entity.name.function.decorator',
      'storage.type.annotation',
      'keyword.control.at-rule',
      'entity.name.function.macro',
    ],
    foreground: 'signal-orange',
  },
  {
    scope: ['string', 'markup.inserted'],
    foreground: 'signal-green',
  },
  { scope: ['markup.changed'], foreground: 'signal-yellow' },
  { scope: ['markup.deleted'], foreground: 'signal-red' },
  {
    scope: ['punctuation', 'meta.brace', 'punctuation.section'],
    foreground: 'ink-2',
  },
  {
    scope: [
      'variable',
      'variable.other',
      'variable.parameter',
      'support.variable',
      'meta.object-literal.key',
      'support.type.property-name',
    ],
    foreground: 'ink-0',
  },
  { scope: ['markup.underline'], fontStyle: 'underline' },
  {
    scope: ['invalid.illegal'],
    foreground: 'ink-2',
    background: 'signal-red',
  },
  {
    scope: ['invalid.deprecated'],
    foreground: 'surface-0',
    background: 'signal-yellow',
  },
];

/**
 * Resolves theme colors to hex for one palette.
 *
 * @param palette - One variant of a pair.
 * @returns A function from a theme color to `#rrggbb` or `#rrggbbaa`.
 */
export function colorResolver(palette: Palette): (color: ThemeColor) => string {
  const hexes = hexByRole(palette);
  return (color) => {
    const [role, alpha = ''] = color.split('/');
    return `${hexes[roleOf(role)]}${alpha}`;
  };
}

const roleOf = (name: string | undefined): RoleName => {
  const role = ROLE_NAMES.find((candidate) => candidate === name);
  if (role === undefined) {
    throw new Error(`Unknown role: ${name}`);
  }
  return role;
};

/** The 16 ANSI terminal colors, in ANSI order (black … bright white). */
export type ANSIColors = [
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
  ThemeColor,
];

/**
 * The ANSI terminal colors by role. Black and white are neutrals: in the dark
 * variant black is a dark surface and white a light ink, and in the light
 * variant the other way round, so "black" text stays dark.
 *
 * @param variant - The variant the terminal shows.
 */
export function ansiColors(variant: Variant): ANSIColors {
  return variant === 'dark' ? DARK_ANSI : LIGHT_ANSI;
}

const DARK_ANSI: ANSIColors = [
  'surface-1',
  'signal-red',
  'signal-green',
  'signal-yellow',
  'hue-2',
  'signal-rare',
  'hue-1',
  'ink-1',
  'surface-3',
  'signal-red',
  'signal-green',
  'signal-yellow',
  'hue-2',
  'signal-rare',
  'hue-0',
  'ink-2',
];

const LIGHT_ANSI: ANSIColors = [
  'ink-1',
  'signal-red',
  'signal-green',
  'signal-yellow',
  'hue-2',
  'signal-rare',
  'hue-1',
  'surface-2',
  'surface-3',
  'signal-red',
  'signal-green',
  'signal-yellow',
  'hue-2',
  'signal-rare',
  'hue-0',
  'surface-1',
];
