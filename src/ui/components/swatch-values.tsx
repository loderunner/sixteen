import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { contrast, type OKLCH, type Swatch } from '@/palette';

/** Props of `SwatchValues`. */
export type SwatchValuesProps = ComponentProps<'dl'> & {
  /** The swatch to describe. */
  swatch: Swatch;
  /** The page background, to show the swatch's contrast on it. */
  background: OKLCH;
};

/**
 * A swatch's hex, OKLCH and contrast on the page, in monospace lines.
 * `className` is merged over the list's classes; `ref` is the `<dl>`.
 */
export function SwatchValues({
  swatch,
  background,
  className,
  ...props
}: SwatchValuesProps) {
  const { l, c, h } = swatch.color;
  const ratio = contrast(swatch.color, background);

  return (
    <dl
      className={twMerge('font-mono text-xs text-ink-0', className)}
      {...props}
    >
      <dt className="sr-only">Hex</dt>
      <dd className="text-ink-1">{swatch.hex}</dd>
      <dt className="sr-only">OKLCH</dt>
      <dd className="truncate">
        oklch({(l * 100).toFixed(1)}% {c.toFixed(3)} {h.toFixed(0)})
      </dd>
      <dt className="sr-only">Contrast on the page</dt>
      <dd className="truncate">{ratio.toFixed(1)}:1 on the page</dd>
    </dl>
  );
}
