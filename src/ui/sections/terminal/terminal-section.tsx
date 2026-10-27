import { type ReactNode } from 'react';

import { colorResolver, terminalColors, type ThemeColor } from '@/exports';
import { usePalette } from '@/ui/palette';

type Run = {
  text: string;
  color?: number | 'foreground' | 'bold';
  bold?: boolean;
};

/** A line of the session: runs of text, each in an ANSI color (0–15). */
const SESSION: Run[][] = [
  [
    { text: '~/palettes ', color: 4, bold: true },
    { text: 'on ', color: 'foreground' },
    { text: 'main', color: 5 },
    { text: ' ❯ ', color: 2 },
    { text: 'ls -l', color: 'foreground' },
  ],
  [{ text: 'drwxr-xr-x  ' }, { text: 'themes/', color: 12, bold: true }],
  [{ text: '-rwxr-xr-x  ' }, { text: 'install.sh', color: 10, bold: true }],
  [{ text: '-rw-r--r--  ' }, { text: 'palette.json' }],
  [
    { text: 'lrwxr-xr-x  ' },
    { text: 'latest', color: 14 },
    { text: ' -> themes/harbor' },
  ],
  [],
  [
    { text: '~/palettes ', color: 4, bold: true },
    { text: 'on ', color: 'foreground' },
    { text: 'main', color: 5 },
    { text: ' ❯ ', color: 2 },
    { text: 'git status --short', color: 'foreground' },
  ],
  [{ text: ' M ', color: 3 }, { text: 'palette.json' }],
  [{ text: 'A  ', color: 2 }, { text: 'themes/harbor-light.json' }],
  [{ text: ' D ', color: 1 }, { text: 'themes/old.json' }],
  [{ text: '?? ', color: 9 }, { text: 'notes.md' }],
  [],
  [
    { text: '~/palettes ', color: 4, bold: true },
    { text: 'on ', color: 'foreground' },
    { text: 'main', color: 5 },
    { text: ' ❯ ', color: 2 },
    { text: 'pnpm test', color: 'foreground' },
  ],
  [
    { text: ' ✓ ', color: 2 },
    { text: 'palette/generate.test.ts ', color: 'foreground' },
    { text: '(16 tests) ', color: 8 },
    { text: '41ms', color: 3 },
  ],
  [
    { text: ' ✗ ', color: 1 },
    { text: 'exports/terminal.test.ts ', color: 'foreground' },
    { text: '(2 tests | 1 failed)', color: 1 },
  ],
  [
    { text: '   → ', color: 8 },
    { text: 'expected ', color: 'foreground' },
    { text: '"#e9ca87"', color: 2 },
    { text: ' to be ', color: 'foreground' },
    { text: '"#e9ca88"', color: 1 },
  ],
  [
    { text: ' Tests  ', color: 'bold', bold: true },
    { text: '1 failed', color: 1, bold: true },
    { text: ' | ', color: 8 },
    { text: '17 passed', color: 2, bold: true },
  ],
];

/**
 * The palette's terminal theme at work, with the same colors the iTerm2 and
 * Ghostty exports hold: a short shell session, and the 16 ANSI colors.
 */
export function TerminalSection() {
  const { palette, variant } = usePalette();
  const resolve = colorResolver(palette);
  const terminal = terminalColors(variant);
  const colorOf = (color: Run['color']): string => {
    const role: ThemeColor =
      color === undefined || color === 'foreground'
        ? terminal.foreground
        : color === 'bold'
          ? terminal.bold
          : terminal.ansi[color];
    return resolve(role);
  };

  const lines: ReactNode = SESSION.map((runs, line) => (
    // oxlint-disable-next-line react/no-array-index-key -- a fixed transcript
    <div key={line} className="min-h-5 whitespace-pre">
      {runs.map((run) => (
        <span
          key={run.text}
          style={{
            color: colorOf(run.color),
            fontWeight: run.bold === true ? 600 : undefined,
          }}
        >
          {run.text}
        </span>
      ))}
    </div>
  ));

  return (
    <section aria-labelledby="terminal" className="flex flex-col gap-6">
      <div>
        <h2
          id="terminal"
          className="text-3xl font-semibold tracking-tight text-ink-2"
        >
          In the terminal
        </h2>
        <p className="mt-1 max-w-2xl text-ink-0">
          The 16 ANSI colors of the exported terminal themes, at work.
        </p>
      </div>
      <figure className="flex flex-col overflow-hidden rounded-lg ring-1 ring-surface-2">
        <div
          className="overflow-x-auto p-4 font-mono text-[13px]/5"
          style={{ background: resolve(terminal.background) }}
        >
          {lines}
        </div>
        <figcaption className="grid grid-cols-8">
          {terminal.ansi.map((color, index) => (
            <div
              key={`${color}-${index < 8 ? 'normal' : 'bright'}`}
              className="flex h-10 items-end p-1.5 font-mono text-[11px]"
              style={{
                background: resolve(color),
                color: resolve(
                  index === 0 || index === 8
                    ? terminal.foreground
                    : terminal.background,
                ),
              }}
            >
              {index}
            </div>
          ))}
        </figcaption>
      </figure>
    </section>
  );
}
