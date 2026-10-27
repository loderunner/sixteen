# Sixteen

Sixteen turns any color into a 16-color palette with the structure of
[Nord](https://www.nordtheme.com/docs/colors-and-palettes). It generates a tuned
dark and light pair, names the palette and its groups after one metaphor,
previews it in an interface, a code editor and a terminal, and exports it to
seven formats. It never reuses Nord's colors, only its proportions.

A palette's address is its seed color: `/7ab4c8` always shows the same palette,
so sharing a palette means sharing its link. Sixteen is a static single-page app
with no backend.

## Run it

You need Node.js 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

To check your changes the way CI does, run the following commands:

```sh
pnpm format     # oxfmt, check only; pnpm format:fix to write
pnpm lint       # oxlint, type-aware
pnpm typecheck  # tsc -b
pnpm test       # Vitest: core (node) and ui (jsdom) projects
pnpm build      # static files in dist/
```

## How a palette is built

Every palette has the same four groups, in Nord's order:

| Group   | Swatches | Role                                                                             |
| ------- | -------- | -------------------------------------------------------------------------------- |
| Surface | 4        | Backgrounds, from the page to panels and selection; #3 for comments, borders     |
| Ink     | 3        | Text, in three steps of emphasis                                                 |
| Hue     | 4        | Accents in the seed's hue; #1 is the primary                                     |
| Signal  | 5        | Accents around the rest of the wheel: red, orange, yellow, green, and a rare one |

The generator works in OKLCH, where equal steps of lightness and chroma look
equal at any hue. It does the following:

1. Finds where the seed belongs. A colorful seed becomes an in-hue accent; a
   gray, very dark or very light seed becomes a surface or ink. That swatch is
   the seed, exactly.
2. Solves the rest backwards from that slot: the primary accent, how strongly
   the neutrals are tinted, and which way round the wheel the in-hue accents
   spread.
3. Builds the dark palette from lightness ladders and hue offsets whose
   proportions follow Nord's.
4. Places each signal in its hue window (red stays red), as far as it can from
   the in-hue accents, and puts the rare accent in the widest free gap.
5. Builds the light palette as a tuned twin. Its accents are darker and keep the
   order of the dark accents' contrast, compressed into a readable range. The
   structure is asymmetric (four backgrounds, three text colors), so a light
   theme can't be a role swap of the dark one.

The rules and constants are in `src/palette/structure.ts` and
`src/palette/generate.ts`. Property tests run the generator over a grid of
several hundred seeds and check, among other things, that text keeps at least
7:1 contrast and the primary accent at least 3:1 in both palettes.

### Names

The palette and its groups take their names from one metaphor, picked by the
primary accent's hue: for example, _Harbor_ with _Night Tide_, _Sailcloth_,
_Open Water_ and _Signal Flags_. Each swatch takes the name of the closest color
in the curated list of [color-name-list](https://github.com/meodai/color-names).

### Shared links stay stable

Golden tests in `src/palette/golden.test.ts` pin the output for a set of seeds.
If the generator has to change its output on purpose, give new paths a version
prefix (`/v2/7ab4c8`) so that existing links keep their palette.

## Exports

Each export uses only the palette's 16 colors, sometimes with an alpha channel:

| Format         | File                                | Palettes            |
| -------------- | ----------------------------------- | ------------------- |
| VS Code        | `<name>-<variant>-color-theme.json` | One per file        |
| TextMate       | `<name>-<variant>.tmTheme`          | One per file        |
| iTerm2         | `<name>.itermcolors`                | Both, by appearance |
| Ghostty        | `<Name> <Variant>`                  | One per file        |
| CSS            | `<name>.css`                        | Both                |
| Tailwind CSS 4 | `<name>.tailwind.css`               | Both                |
| Text           | `<name>.txt`                        | Both                |

The syntax and terminal colors come from one role table,
`src/exports/syntax.ts`. The code preview renders the exported VS Code theme
with [Shiki](https://shiki.style), which uses VS Code's own grammars, so the
preview matches the theme you download.

## Project layout

```
src/
  palette/   generation, names, path codec: pure TypeScript, no DOM
  exports/   one module per export format: pure, imports only palette/
  ui/        the React app: routes, page sections, shared components
```

`AGENTS.md` holds the conventions for contributors and coding agents.

## Deploy

`pnpm build` writes static files to `dist/`. Every path is a palette, so the
host must serve `index.html` for any path that isn't a file (an SPA fallback
rewrite).
