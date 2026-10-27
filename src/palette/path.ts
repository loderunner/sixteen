import { normalizeHex } from './color';

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
 * The canonical path of a palette.
 *
 * @param seed - The seed as `#rrggbb`.
 *
 * @example
 * pathOfSeed('#7ab4c8'); // '/7ab4c8'
 */
export function pathOfSeed(seed: string): string {
  return `/${seed.replace('#', '')}`;
}
