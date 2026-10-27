import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { pathOfSeed, type Variant } from '@/palette';

/** How long the path waits for the seed to settle, in milliseconds. */
const PATH_DELAY = 250;

/** A seed, and the variant it was picked for. */
export type PickedSeed = {
  /** The seed, as `#rrggbb`. */
  seed: string;
  /** The variant it was picked for, if any (see `classifySeed`). */
  picked?: Variant;
};

/**
 * The seed on screen, starting from the one in the path. Changing it updates
 * the screen at once and replaces the path once the seed settles, so dragging
 * a slider doesn't flood the history. Navigating to another path (back,
 * forward, a pasted link) resets it.
 *
 * @param fromPath - The seed in the current path.
 */
export function useSeed(
  fromPath: PickedSeed,
): [PickedSeed, (next: PickedSeed) => void] {
  const navigate = useNavigate();
  const path = pathOfSeed(fromPath.seed, fromPath.picked);
  const [seed, setLocalSeed] = useState(fromPath);
  const [syncedPath, setSyncedPath] = useState(path);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (path !== syncedPath) {
    setSyncedPath(path);
    setLocalSeed(fromPath);
  }

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const setSeed = (next: PickedSeed) => {
    setLocalSeed(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void navigate(pathOfSeed(next.seed, next.picked), { replace: true });
    }, PATH_DELAY);
  };

  return [seed, setSeed];
}
