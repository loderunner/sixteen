import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { GROUPS } from '@/palette';
import { usePalette } from '@/ui/palette';

/**
 * The 16 swatches of the palette on screen as one band, in palette order and
 * grouped. The seed's swatch carries a mark.
 * `className` is merged over the band's classes; `ref` is the band.
 */
export function Spectrum({ className, ...props }: ComponentProps<'figure'>) {
  const { pair, palette, variant, names } = usePalette();
  const seedIn = (group: string, index: number) =>
    pair.slot.variant === variant &&
    pair.slot.group === group &&
    pair.slot.index === index;

  return (
    <figure
      aria-label={`The 16 colors of ${names.palette}`}
      className={twMerge('flex h-36 gap-1.5 sm:h-48 sm:gap-3', className)}
      {...props}
    >
      {GROUPS.map((group) => (
        <div
          key={group}
          className="flex flex-1 gap-0.5 sm:gap-1"
          style={{ flexGrow: palette[group].length }}
        >
          {palette[group].map((swatch, index) => (
            <div key={`${group}-${index}`} className="relative flex-1">
              <div
                className="h-full rounded-sm ring-1 ring-surface-2 ring-inset"
                style={{ background: swatch.hex }}
              />
              {seedIn(group, index) && (
                <div className="absolute inset-x-0 -bottom-3 mx-auto size-1.5 rounded-full bg-ink-2" />
              )}
            </div>
          ))}
        </div>
      ))}
    </figure>
  );
}
