import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { pathOfSeed } from '@/palette';

/** How long the path waits for the seed to settle, in milliseconds. */
const PATH_DELAY = 250;

/**
 * The seed on screen, starting from the one in the path. Changing it updates
 * the screen at once and replaces the path once the seed settles, so dragging
 * a slider doesn't flood the history. Navigating to another path (back,
 * forward, a pasted link) resets it.
 *
 * @param pathSeed - The seed in the current path, as `#rrggbb`.
 */
export function useSeed(pathSeed: string): [string, (seed: string) => void] {
  const navigate = useNavigate();
  const [seed, setLocalSeed] = useState(pathSeed);
  const [syncedPathSeed, setSyncedPathSeed] = useState(pathSeed);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (pathSeed !== syncedPathSeed) {
    setSyncedPathSeed(pathSeed);
    setLocalSeed(pathSeed);
  }

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const setSeed = (next: string) => {
    setLocalSeed(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void navigate(pathOfSeed(next), { replace: true });
    }, PATH_DELAY);
  };

  return [seed, setSeed];
}
