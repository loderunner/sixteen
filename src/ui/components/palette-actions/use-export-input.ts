import { useHref } from 'react-router';

import { type ExportInput } from '@/exports';
import { pathOfSeed } from '@/palette';
import { usePalette } from '@/ui/palette';

/** What the exporters need, for the palette on screen. */
export function useExportInput(): ExportInput {
  const { pair, names, swatchNames } = usePalette();
  const href = useHref(pathOfSeed(pair.seed));
  return {
    pair,
    names,
    swatchNames,
    url: `${window.location.origin}${href}`,
  };
}
