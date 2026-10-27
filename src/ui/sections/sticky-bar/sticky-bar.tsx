import { type RefObject, useEffect, useState } from 'react';

import { PaletteActions } from '@/ui/components/palette-actions';
import { usePalette } from '@/ui/palette';
import { ThemeToggle } from '@/ui/theme';

/** Props of `StickyBar`. */
export type StickyBarProps = {
  /** The element whose leaving the screen brings the bar in: the hero. */
  watch: RefObject<HTMLElement | null>;
};

/**
 * A slim bar pinned to the top once the hero scrolls away: the seed, the
 * palette's name, and the theme, share and download controls.
 */
export function StickyBar({ watch }: StickyBarProps) {
  const { pair, names } = usePalette();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = watch.current;
    if (element === null) {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const { isIntersecting } of entries) {
        setShown(!isIntersecting);
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [watch]);

  return (
    <div
      inert={!shown}
      className="fixed inset-x-0 top-0 z-20 border-b border-surface-2 bg-surface-0/90 backdrop-blur-sm transition-[translate,opacity] duration-200 data-hidden:-translate-y-full data-hidden:opacity-0 motion-reduce:transition-none"
      data-hidden={shown ? undefined : ''}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-8">
        <span
          aria-hidden="true"
          className="size-5 shrink-0 rounded-sm ring-1 ring-surface-2 ring-inset"
          style={{ background: pair.seed }}
        />
        <span className="truncate font-semibold text-ink-2">
          {names.palette}
        </span>
        <span className="hidden font-mono text-sm text-ink-0 sm:inline">
          {pair.seed}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <PaletteActions className="hidden sm:flex" />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
