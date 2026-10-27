import { lazy, Suspense, useLayoutEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router';

import {
  generatePalette,
  namePalette,
  pathOfSeed,
  type PalettePair,
  seedOfSegment,
} from '@/palette';
import {
  applyPalette,
  PaletteProvider,
  useSeed,
  useSwatchNames,
} from '@/ui/palette';
import { ExportSection } from '@/ui/sections/export/export-section';
import { Hero } from '@/ui/sections/hero/hero';
import { SwatchesSection } from '@/ui/sections/swatches/swatches-section';
import { TerminalSection } from '@/ui/sections/terminal/terminal-section';
import { useResolvedTheme } from '@/ui/theme';

import { NotFoundPage } from './not-found-page';

/**
 * The page of one palette, at `/<seed>`. A seed spelled another way
 * (uppercase, 3 digits) redirects to its canonical path.
 */
export function PalettePage() {
  const { seed: segment = '' } = useParams();
  const pathSeed = seedOfSegment(segment);

  if (pathSeed === undefined) {
    return <NotFoundPage />;
  }
  if (pathOfSeed(pathSeed) !== `/${segment}`) {
    return <Navigate to={pathOfSeed(pathSeed)} replace />;
  }
  return <Palette pathSeed={pathSeed} />;
}

type PaletteProps = {
  /** The seed in the path, as `#rrggbb`. */
  pathSeed: string;
};

function Palette({ pathSeed }: PaletteProps) {
  const [seed, setSeed] = useSeed(pathSeed);
  const pair = useMemo(() => generateOrThrow(seed), [seed]);
  const names = useMemo(() => namePalette(pair), [pair]);
  const swatchNames = useSwatchNames(pair);
  const variant = useResolvedTheme();

  // Before paint, so the page never shows the previous palette.
  useLayoutEffect(() => {
    applyPalette(pair);
  }, [pair]);

  return (
    <PaletteProvider
      value={{
        pair,
        names,
        setSeed,
        variant,
        palette: pair[variant],
        swatchNames,
      }}
    >
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-20 px-4 py-6 sm:px-8 sm:py-10">
        <Hero />
        <SwatchesSection />
        <Suspense fallback={<div className="h-160" />}>
          <EditorSection />
        </Suspense>
        <TerminalSection />
        <ExportSection />
      </main>
    </PaletteProvider>
  );
}

// Below the fold, and the heaviest section: Shiki, samples, a select.
const EditorSection = lazy(async () => {
  const module = await import('@/ui/sections/editor/editor-section');
  return { default: module.EditorSection };
});

const generateOrThrow = (seed: string): PalettePair => {
  const pair = generatePalette(seed);
  if (pair === undefined) {
    throw new Error(`Not a hex color: ${seed}`);
  }
  return pair;
};
