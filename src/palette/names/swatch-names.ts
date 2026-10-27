import { deltaE, type OKLCH, parseHex } from '../color';
import { type PalettePair, swatchesOf } from '../generate';
import { GROUP_SIZES, GROUPS, type Variant } from '../structure';

/** A named color, as listed by `color-name-list`. */
export type ColorName = {
  /** The name, e.g. `Sea Serpent`. */
  name: string;
  /** Its color as `#rrggbb`. */
  hex: string;
};

/** Each swatch's name, in palette order (see `swatchesOf`). */
export type SwatchNames = Record<Variant, string[]>;

type Entry = { name: string; color: OKLCH };

const entriesByList = new WeakMap<readonly ColorName[], Entry[]>();

const entriesOf = (names: readonly ColorName[]): Entry[] => {
  let entries = entriesByList.get(names);
  if (entries === undefined) {
    entries = names.flatMap(({ name, hex }) => {
      const color = parseHex(hex);
      return color === undefined ? [] : [{ name, color }];
    });
    entriesByList.set(names, entries);
  }
  return entries;
};

/**
 * Names every swatch of a pair after the closest color in `names` (ΔE in
 * OKLab). No name is used twice within a variant. The seed is named first,
 * so it gets its best match.
 *
 * @param pair - A generated palette pair.
 * @param names - The color names to choose from; see `loadColorNames`.
 */
export function nameSwatches(
  pair: PalettePair,
  names: readonly ColorName[],
): SwatchNames {
  const entries = entriesOf(names);
  const nameVariant = (variant: Variant): string[] => {
    const swatches = swatchesOf(pair[variant]);
    const result: string[] = Array.from({ length: swatches.length }, () => '');
    const used = new Set<string>();
    const seedIndex =
      pair.slot.variant === variant ? indexOfSlot(pair.slot) : undefined;
    const order = swatches.map((_, index) => index);
    if (seedIndex !== undefined) {
      order.splice(order.indexOf(seedIndex), 1);
      order.unshift(seedIndex);
    }
    for (const index of order) {
      const best = closest(swatches[index].color, entries, used);
      if (best !== undefined) {
        used.add(best);
        result[index] = best;
      }
    }
    return result;
  };
  return { dark: nameVariant('dark'), light: nameVariant('light') };
}

/**
 * Loads the curated list of about 5000 color names. It is a separate chunk of
 * about 200 kB, fetched on first call.
 */
export async function loadColorNames(): Promise<readonly ColorName[]> {
  const { colornames } = await import('color-name-list/bestof');
  return colornames;
}

const closest = (
  color: OKLCH,
  entries: Entry[],
  used: Set<string>,
): string | undefined => {
  let best: Entry | undefined;
  let bestDistance = Infinity;
  for (const entry of entries) {
    if (used.has(entry.name)) {
      continue;
    }
    const distance = deltaE(color, entry.color);
    if (distance < bestDistance) {
      best = entry;
      bestDistance = distance;
    }
  }
  return best?.name;
};

const indexOfSlot = ({ group, index }: PalettePair['slot']): number => {
  const before = GROUPS.slice(0, GROUPS.indexOf(group));
  return (
    before.reduce((total, previous) => total + GROUP_SIZES[previous], 0) + index
  );
};
