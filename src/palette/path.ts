import { classifySeed } from './classify';
import { normalizeHex, parseHex } from './color';
import { type Variant } from './structure';

const SEGMENT = /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * The seed of a palette path segment, as lowercase `#rrggbb`. A palette's path
 * is its seed without `#`: `/7ab4c8`. 3-digit and uppercase hex are accepted;
 * `pathOfSeed` gives the canonical path to redirect them to.
 *
 * Paths carry no version: the generator's output for a seed is pinned by
 * golden tests. If it ever has to change, new paths get a `/v2/` prefix and
 * these keep meaning what they mean today.
 *
 * @param segment - The path segment, e.g. `7ab4c8`.
 * @returns The seed, or `undefined` when the segment is not a hex color.
 *
 * @example
 * seedOfSegment('7AB'); // '#77aabb'
 * seedOfSegment('#7ab4c8'); // undefined: no `#` in paths
 */
export function seedOfSegment(segment: string): string | undefined {
  return SEGMENT.test(segment) ? normalizeHex(segment) : undefined;
}

/**
 * The variant of a palette path's first segment: `/light/2a3f8f` is the
 * palette of a seed picked for the light variant.
 *
 * @param segment - The path segment, e.g. `light`.
 * @returns The variant, or `undefined` when the segment names none.
 *
 * @example
 * variantOfSegment('light'); // 'light'
 * variantOfSegment('Light'); // undefined: paths are lowercase
 */
export function variantOfSegment(segment: string): Variant | undefined {
  return segment === 'dark' || segment === 'light' ? segment : undefined;
}

/**
 * The canonical path of a palette. A seed picked for a variant carries it in
 * the path only when it moved the seed there; otherwise the path is the seed
 * alone, which the same palette already has.
 *
 * @param seed - The seed as `#rrggbb`.
 * @param picked - The variant the seed was picked for, if any.
 *
 * @example
 * pathOfSeed('#7ab4c8'); // '/7ab4c8'
 * pathOfSeed('#7ab4c8', 'light'); // '/7ab4c8': too light to sit there
 * pathOfSeed('#2a0040', 'light'); // '/light/2a0040'
 */
export function pathOfSeed(seed: string, picked?: Variant): string {
  const hex = seed.replace('#', '');
  const color = parseHex(seed);
  if (picked === undefined || color === undefined) {
    return `/${hex}`;
  }
  const moved =
    classifySeed(color, picked).variant !== classifySeed(color).variant;
  return moved ? `/${picked}/${hex}` : `/${hex}`;
}
