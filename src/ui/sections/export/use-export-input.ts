import { type ExportInput } from '@/exports';
import { pathOfSeed } from '@/palette';
import { usePalette } from '@/ui/palette';

/** What the exporters need, for the palette on screen. */
export function useExportInput(): ExportInput {
  const { pair, names, swatchNames } = usePalette();
  return {
    pair,
    names,
    swatchNames,
    url: `${window.location.origin}${pathOfSeed(pair.seed)}`,
  };
}
