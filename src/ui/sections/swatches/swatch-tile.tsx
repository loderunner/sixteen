import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { contrast, type OKLCH, type Swatch } from '@/palette';
import { CopyButton } from '@/ui/components/copy-button';
import { SwatchValues } from '@/ui/components/swatch-values';

/** Props of `SwatchTile`. */
export type SwatchTileProps = ComponentProps<'li'> & {
  /** The swatch to show. */
  swatch: Swatch;
  /** Its name, once known. */
  name: string | undefined;
  /** What it is for, e.g. `Primary`. */
  role: string;
  /** The page background, to show the swatch's contrast on it. */
  background: OKLCH;
  /** Text colors to pick from for the label on the swatch. */
  labelColors: Swatch[];
  /** Whether this swatch is the seed. */
  seed: boolean;
};

/** One swatch: its color, name, role, hex, OKLCH and contrast on the page. */
export function SwatchTile({
  swatch,
  name,
  role,
  background,
  labelColors,
  seed,
  className,
  ...props
}: SwatchTileProps) {
  const label = labelColors.reduce((best, candidate) =>
    contrast(candidate.color, swatch.color) > contrast(best.color, swatch.color)
      ? candidate
      : best,
  );

  return (
    <li
      className={twMerge('flex min-w-0 flex-col gap-2', className)}
      {...props}
    >
      <div
        className="relative flex aspect-4/3 items-end rounded-md p-3 ring-1 ring-surface-2 ring-inset"
        style={{ background: swatch.hex, color: label.hex }}
      >
        {seed && <span className="text-sm font-medium">Your color</span>}
      </div>
      <div className="flex min-w-0 items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-1">
            {name ?? ' '}
          </p>
          <p className="text-sm text-ink-0">{role}</p>
        </div>
        <CopyButton text={swatch.hex} label={`Copy ${swatch.hex}`} />
      </div>
      <SwatchValues swatch={swatch} background={background} />
    </li>
  );
}
