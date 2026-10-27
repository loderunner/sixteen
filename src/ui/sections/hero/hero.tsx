import { usePalette } from '@/ui/palette';
import { ThemeToggle } from '@/ui/theme';

import { HexField } from './hex-field';
import { Spectrum } from './spectrum';

/** The top of the page: the palette's name, its seed, and its 16 colors. */
export function Hero() {
  const { pair, names, setSeed, variant } = usePalette();
  const elsewhere = pair.slot.variant !== variant;

  return (
    <header className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-ink-1">Nord-like</p>
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-semibold tracking-tighter text-ink-2 sm:text-8xl">
            {names.palette}
          </h1>
          <p className="mt-3 text-lg text-ink-0">
            Sixteen colors grown from {pair.seed}, in the structure of Nord:
            four backgrounds, three text colors, four accents in your hue and
            five around it.
          </p>
        </div>
        <HexField value={pair.seed} onChange={setSeed} className="w-40" />
      </div>
      <Spectrum />
      {elsewhere && (
        <p className="text-sm text-ink-0">
          Your color sits in the {pair.slot.variant} palette. Switch the theme
          to see it.
        </p>
      )}
    </header>
  );
}
