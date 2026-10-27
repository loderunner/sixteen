import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { contrast, type OKLCH, type Swatch } from '@/palette';
import { CopyButton } from '@/ui/components/copy-button';

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
  const { l, c, h } = swatch.color;
  const ratio = contrast(swatch.color, background);

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
      <dl className="font-mono text-xs text-ink-0">
        <dt className="sr-only">Hex</dt>
        <dd className="text-ink-1">{swatch.hex}</dd>
        <dt className="sr-only">OKLCH</dt>
        <dd className="truncate">
          oklch({(l * 100).toFixed(1)}% {c.toFixed(3)} {h.toFixed(0)})
        </dd>
        <dt className="sr-only">Contrast on the page</dt>
        <dd className="truncate">{ratio.toFixed(1)}:1 on the page</dd>
      </dl>
    </li>
  );
}
