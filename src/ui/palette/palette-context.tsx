import { createContext, type ReactNode, use } from 'react';

import { type PaletteNames, type PalettePair } from '@/palette';

/** The palette on screen, and how to change it. */
export type PaletteState = {
  /** The generated pair for the current seed. */
  pair: PalettePair;
  /** Names of the palette and its groups. */
  names: PaletteNames;
  /** Changes the seed. The path follows shortly after. */
  setSeed: (seed: string) => void;
};

const PaletteContext = createContext<PaletteState | null>(null);

/** Props of `PaletteProvider`. */
export type PaletteProviderProps = {
  /** The palette to provide. */
  value: PaletteState;
  /** The sections that use it. */
  children: ReactNode;
};

/** Provides the palette on screen to the sections below. */
export function PaletteProvider({ value, children }: PaletteProviderProps) {
  return <PaletteContext value={value}>{children}</PaletteContext>;
}

/** The palette on screen. Must be used under a `PaletteProvider`. */
export function usePalette(): PaletteState {
  const state = use(PaletteContext);
  if (state === null) {
    throw new Error('usePalette must be used under a PaletteProvider');
  }
  return state;
}
