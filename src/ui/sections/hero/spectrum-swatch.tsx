import { Tooltip } from '@base-ui/react/tooltip';
import { CheckIcon, CopyIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import { type OKLCH, type Swatch } from '@/palette';
import { SwatchValues } from '@/ui/components/swatch-values';

/** Props of `SpectrumSwatch`. */
export type SpectrumSwatchProps = {
  /** The swatch to show. */
  swatch: Swatch;
  /** Its name, once known. */
  name: string | undefined;
  /** What it is for, e.g. `Primary`. */
  role: string;
  /** The page background, to show the swatch's contrast on it. */
  background: OKLCH;
  /** Whether this swatch is the seed. */
  seed: boolean;
};

/**
 * One swatch of the band. Hovering or focusing it shows its name, role and
 * values; clicking it copies its hex.
 */
export function SpectrumSwatch({
  swatch,
  name,
  role,
  background,
  seed,
}: SpectrumSwatchProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => {
      setCopied(false);
    }, 1500);
    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  const copy = async () => {
    await navigator.clipboard.writeText(swatch.hex);
    setCopied(true);
  };

  return (
    <Tooltip.Root>
      <div className="relative flex-1">
        <Tooltip.Trigger
          closeOnClick={false}
          onClick={copy}
          aria-label={`Copy ${swatch.hex}, ${name ?? role}`}
          className="block size-full cursor-copy rounded-sm ring-1 ring-surface-2 ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-2"
          style={{ background: swatch.hex }}
        />
        {seed && (
          <div className="absolute inset-x-0 -bottom-3 mx-auto size-1.5 rounded-full bg-ink-2" />
        )}
      </div>
      <Tooltip.Portal>
        <Tooltip.Positioner side="bottom" sideOffset={16} className="z-30">
          <Tooltip.Popup className="flex w-56 flex-col gap-2 rounded-lg border border-surface-2 bg-surface-1 p-3 shadow-lg transition-opacity duration-100 data-ending-style:opacity-0 data-instant:transition-none data-starting-style:opacity-0">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-1">
                  {name ?? ' '}
                </p>
                <p className="text-sm text-ink-0">
                  {seed ? `${role} · Your color` : role}
                </p>
              </div>
              {copied ? (
                <CheckIcon
                  aria-label="Copied"
                  className="mt-1 size-3.5 shrink-0 text-signal-green"
                />
              ) : (
                <CopyIcon
                  aria-hidden="true"
                  className="mt-1 size-3.5 shrink-0 text-ink-0"
                />
              )}
            </div>
            <SwatchValues swatch={swatch} background={background} />
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
