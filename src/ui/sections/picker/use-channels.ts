import { useState } from 'react';

import { type Channels, type ColorSpace } from './spaces';

/**
 * The channel values of a color in one space, kept locally so that values
 * the hex can't express survive: the hue of a gray, a chroma past the sRGB
 * edge. They reset whenever the color changes from elsewhere.
 *
 * @param space - The space to edit in.
 * @param color - The current color as `#rrggbb`.
 * @param onChange - Called with the new color when a channel moves.
 * @returns The values and a setter for all three.
 */
export function useChannels(
  space: ColorSpace,
  color: string,
  onChange: (color: string) => void,
): [Channels, (values: Channels) => void] {
  const [values, setValues] = useState(() => space.fromHex(color));
  const [known, setKnown] = useState(color);

  if (color !== known) {
    setKnown(color);
    setValues(space.fromHex(color));
  }

  const change = (next: Channels) => {
    const hex = space.toHex(next);
    setValues(next);
    setKnown(hex);
    onChange(hex);
  };

  return [values, change];
}
