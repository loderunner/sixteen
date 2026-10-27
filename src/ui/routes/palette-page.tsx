import { lazy, Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { Navigate, useParams } from 'react-router';

import {
  generatePalette,
  namePalette,
  pathOfSeed,
  type PalettePair,
  seedOfSegment,
  type Variant,
  variantOfSegment,
} from '@/palette';
import {
  applyPalette,
  PaletteProvider,
  type PickedSeed,
  useSeed,
  useSwatchNames,
} from '@/ui/palette';
import { ExportSection } from '@/ui/sections/export/export-section';
import { Hero } from '@/ui/sections/hero/hero';
import { ShowcaseSection } from '@/ui/sections/showcase/showcase-section';
import { StickyBar } from '@/ui/sections/sticky-bar/sticky-bar';
import { SwatchesSection } from '@/ui/sections/swatches/swatches-section';
import { TerminalSection } from '@/ui/sections/terminal/terminal-section';
import { useResolvedTheme } from '@/ui/theme';

import { NotFoundPage } from './not-found-page';

/**
 * The page of one palette, at `/<seed>`, or `/<variant>/<seed>` for a seed
 * picked for a variant. A seed spelled another way (uppercase, 3 digits), or
 * a variant that doesn't move it, redirects to the canonical path.
 */
export function PalettePage() {
  const { variant: variantSegment, seed: seedSegment = '' } = useParams();
  const seed = seedOfSegment(seedSegment);
  const picked =
    variantSegment === undefined ? undefined : variantOfSegment(variantSegment);

  if (
    seed === undefined ||
    (variantSegment !== undefined && picked === undefined)
  ) {
    return <NotFoundPage />;
  }
  const path =
    variantSegment === undefined
      ? `/${seedSegment}`
      : `/${variantSegment}/${seedSegment}`;
  if (pathOfSeed(seed, picked) !== path) {
    return <Navigate to={pathOfSeed(seed, picked)} replace />;
  }
  return <Palette fromPath={{ seed, picked }} />;
}

type PaletteProps = {
  /** The seed in the path. */
  fromPath: PickedSeed;
};

function Palette({ fromPath }: PaletteProps) {
  const [{ seed, picked }, setPickedSeed] = useSeed(fromPath);
  const pair = useMemo(() => generateOrThrow(seed, picked), [seed, picked]);
  const names = useMemo(() => namePalette(pair), [pair]);
  const swatchNames = useSwatchNames(pair);
  const variant = useResolvedTheme();
  // A color picked on screen is picked for the variant the page shows.
  const setSeed = (next: string) => {
    setPickedSeed({ seed: next, picked: variant });
  };
  const hero = useRef<HTMLElement>(null);

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
      <StickyBar watch={hero} />
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-20 px-4 py-6 sm:px-8 sm:py-10">
        <Hero ref={hero} />
        <SwatchesSection />
        <ShowcaseSection />
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

const generateOrThrow = (seed: string, picked?: Variant): PalettePair => {
  const pair = generatePalette(seed, picked);
  if (pair === undefined) {
    throw new Error(`Not a hex color: ${seed}`);
  }
  return pair;
};
