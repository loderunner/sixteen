import { useLayoutEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router';

import {
  generatePalette,
  namePalette,
  pathOfSeed,
  type PalettePair,
  seedOfSegment,
} from '@/palette';
import { applyPalette, PaletteProvider, useSeed } from '@/ui/palette';
import { ThemeToggle } from '@/ui/theme';

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

  // Before paint, so the page never shows the previous palette.
  useLayoutEffect(() => {
    applyPalette(pair);
  }, [pair]);

  return (
    <PaletteProvider value={{ pair, names, setSeed }}>
      <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-4 py-8 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <h1 className="text-5xl font-semibold tracking-tight text-ink-2 sm:text-7xl">
            {names.palette}
          </h1>
          <ThemeToggle className="mt-3" />
        </header>
      </main>
    </PaletteProvider>
  );
}

const generateOrThrow = (seed: string): PalettePair => {
  const pair = generatePalette(seed);
  if (pair === undefined) {
    throw new Error(`Not a hex color: ${seed}`);
  }
  return pair;
};
