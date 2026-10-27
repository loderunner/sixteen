import { Tooltip } from '@base-ui/react/tooltip';
import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { GROUP_SIZES, GROUPS } from '@/palette';
import { SWATCH_ROLES } from '@/ui/components/swatch-roles';
import { usePalette } from '@/ui/palette';

import { SpectrumSwatch } from './spectrum-swatch';

/**
 * The 16 swatches of the palette on screen as one band, in palette order and
 * grouped. The seed's swatch carries a mark. Hovering or focusing a swatch
 * shows its name, role and values; clicking it copies its hex.
 * `className` is merged over the band's classes; `ref` is the band.
 */
export function Spectrum({ className, ...props }: ComponentProps<'figure'>) {
  const { pair, palette, variant, names, swatchNames } = usePalette();
  const background = palette.surface[0].color;
  const labelColors = [palette.surface[0], palette.ink[2]];
  const seedIn = (group: string, index: number) =>
    pair.slot.variant === variant &&
    pair.slot.group === group &&
    pair.slot.index === index;

  const groups = GROUPS.map((group, position) => {
    const start = GROUPS.slice(0, position).reduce(
      (total, previous) => total + GROUP_SIZES[previous],
      0,
    );
    return (
      <div
        key={group}
        className="flex flex-1 gap-0.5 sm:gap-1"
        style={{ flexGrow: palette[group].length }}
      >
        {palette[group].map((swatch, index) => (
          <SpectrumSwatch
            key={`${group}-${index}`}
            swatch={swatch}
            name={swatchNames?.[variant][start + index]}
            role={SWATCH_ROLES[variant][group][index] ?? ''}
            background={background}
            labelColors={labelColors}
            seed={seedIn(group, index)}
          />
        ))}
      </div>
    );
  });

  return (
    <Tooltip.Provider delay={100}>
      <figure
        aria-label={`The 16 colors of ${names.palette}`}
        className={twMerge('flex gap-1.5 sm:gap-3', className)}
        {...props}
      >
        {groups}
      </figure>
    </Tooltip.Provider>
  );
}
