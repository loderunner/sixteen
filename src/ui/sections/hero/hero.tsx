import { type ComponentProps } from 'react';

import { PaletteActions } from '@/ui/components/palette-actions';
import { usePalette } from '@/ui/palette';
import { ThemeToggle } from '@/ui/theme';

import { Picker } from '../picker/picker';
import { Spectrum } from './spectrum';

/** The top of the page: the palette's name, its seed, and its 16 colors. */
export function Hero({ ref, ...props }: ComponentProps<'header'>) {
  const { pair, names, variant } = usePalette();
  const elsewhere = pair.slot.variant !== variant;

  return (
    <header ref={ref} className="flex flex-col gap-8" {...props}>
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-ink-1">Nord-like</p>
        <div className="flex items-center gap-3">
          <PaletteActions />
          <ThemeToggle />
        </div>
      </div>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
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
          <Spectrum className="h-36 sm:h-48 lg:h-auto lg:min-h-48 lg:flex-1" />
          {elsewhere && (
            <p className="-mt-3 text-sm text-ink-0">
              Your color sits in the {pair.slot.variant} palette. Switch the
              theme to see it.
            </p>
          )}
        </div>
        <Picker className="w-full lg:w-80 lg:shrink-0" />
      </div>
    </header>
  );
}
