import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import {
  type ColorName,
  loadColorNames,
  nameSwatches,
  type PalettePair,
  type SwatchNames,
} from '@/palette';

let loading: Promise<readonly ColorName[]> | undefined;

/**
 * The name of each swatch of a pair, or `undefined` while the list of color
 * names loads. Names follow the palette a moment behind, so dragging a slider
 * stays smooth.
 *
 * @param pair - The palette pair on screen.
 */
export function useSwatchNames(pair: PalettePair): SwatchNames | undefined {
  const [list, setList] = useState<readonly ColorName[]>();
  const deferred = useDeferredValue(pair);

  useEffect(() => {
    let current = true;
    loading ??= loadColorNames();
    void loading.then((names) => {
      if (current) {
        setList(names);
      }
    });
    return () => {
      current = false;
    };
  }, []);

  return useMemo(
    () => (list === undefined ? undefined : nameSwatches(deferred, list)),
    [deferred, list],
  );
}
