import { classifySeed, type SeedSlot } from './classify';
import {
  contrast,
  gamutMap,
  hueDistance,
  normalizeHex,
  normalizeHue,
  type OKLCH,
  parseHex,
  toHex,
} from './color';
import {
  ACHROMATIC_CHROMA,
  ACHROMATIC_HUE,
  GROUPS,
  HUE_OFFSETS,
  type HueWindow,
  LIGHT_ACCENT_CHROMA_BOOST,
  LIGHT_ACCENT_CONTRAST,
  NEUTRAL_CHROMA,
  NEUTRAL_HUE_OFFSET,
  NEUTRAL_LIGHTNESS,
  NEUTRAL_TINT_CAP,
  PRIMARY_CHROMA,
  PRIMARY_LIGHTNESS,
  SIGNAL_CLEARANCE,
  SIGNAL_ROLES,
  SIGNAL_TONES,
  SIGNAL_WINDOWS,
  type Variant,
} from './structure';

/** One color of a palette. */
export type Swatch = {
  /** Lowercase `#rrggbb`. */
  hex: string;
  /** The same color in OKLCH. */
  color: OKLCH;
};

/**
 * Sixteen swatches in four groups. See `Group` for the roles; `signal` is in
 * `SIGNAL_ROLES` order (red, orange, yellow, green, rare).
 */
export type Palette = {
  /** 4 background neutrals. */
  surface: Swatch[];
  /** 3 foreground neutrals. */
  ink: Swatch[];
  /** 4 accents in the seed's hue; #1 is the primary. */
  hue: Swatch[];
  /** 5 accents out of the seed's hue. */
  signal: Swatch[];
};

/** A generated dark and light pair, and where the seed sits in it. */
export type PalettePair = {
  /** The seed, as lowercase `#rrggbb`. */
  seed: string;
  /** The swatch that is the seed, exactly. */
  slot: SeedSlot;
  /** Dark backgrounds, light text. */
  dark: Palette;
  /** Light backgrounds, dark text. */
  light: Palette;
};

/** Everything the two palettes are built from, solved from the seed. */
type Anchor = {
  /** The primary accent of the dark variant. */
  primary: OKLCH;
  /** Which way round the wheel the in-hue accents spread. */
  direction: 1 | -1;
  /** Hue of the neutrals. */
  neutralHue: number;
  /** How strongly neutrals are tinted; 1 is the structure's chroma. */
  tint: number;
  /** How saturated signals are; 1 is the structure's chroma. */
  vividness: number;
  /** Neutral lightness, shifted when the seed is a neutral. */
  ladders: Ladders;
  /** The neutral group of the seed, which alone takes its full tint. */
  tintedGroup?: { variant: Variant; group: NeutralGroup };
};

type NeutralGroup = 'surface' | 'ink';

type Ladders = {
  [V in Variant]: { surface: number[]; ink: number[] };
};

/** Neighbours of a neutral seed move this much of the seed's shift. */
const LADDER_FOLLOW = 0.4;

/** Above this chroma, in-hue neighbours are never more saturated than the primary. */
const VIVID_PRIMARY = 0.12;

/** Lightness range of the primary accent of the dark variant. */
const PRIMARY_RANGE = { min: 0.62, max: 0.9 };

/**
 * How far in lightness a signal that can't clear the in-hue band stands from
 * the accent it would be mistaken for, and the range it may move within.
 */
type Clearance = { gap: number; min: number; max: number };

const SIGNAL_SPACING = {
  dark: { gap: 0.09, min: 0.5, max: 0.92 },
  light: { gap: 0.07, min: 0.35, max: 0.75 },
} as const satisfies Record<Variant, Clearance>;

/** Lightness range of in-hue accents of the dark variant. */
const DARK_ACCENT_LIGHTNESS = { min: 0.45, max: 0.97 };

/**
 * Generates the dark and light palettes of a seed color. The seed is one of
 * the 32 swatches exactly (see `slot`); the rest follow from it.
 *
 * @param seedHex - A 3- or 6-digit hex color, with or without `#`.
 * @param picked - The variant the seed was picked for, which holds it when
 *   it can (see `classifySeed`).
 * @returns The pair, or `undefined` when `seedHex` is not a hex color.
 *
 * @example
 * const pair = generatePalette('#7ab4c8');
 * pair?.dark.hue[1].hex; // '#7ab4c8': the seed is the dark primary
 */
export function generatePalette(
  seedHex: string,
  picked?: Variant,
): PalettePair | undefined {
  const seed = normalizeHex(seedHex);
  const color = seed === undefined ? undefined : parseHex(seed);
  if (seed === undefined || color === undefined) {
    return undefined;
  }
  const slot = classifySeed(color, picked);
  const anchor = solveAnchor(color, slot);
  const dark = darkPalette(anchor);
  const light = lightPalette(anchor, dark);
  const pair = { seed, slot, dark, light };
  pair[slot.variant][slot.group][slot.index] = { hex: seed, color };
  return pair;
}

/**
 * The 16 swatches of a palette in order: surface, ink, hue, then signal.
 *
 * @param palette - A generated palette.
 */
export function swatchesOf(palette: Palette): Swatch[] {
  return GROUPS.flatMap((group) => palette[group]);
}

// Solving the anchor -----------------------------------------------------

const solveAnchor = (seed: OKLCH, slot: SeedSlot): Anchor =>
  slot.group === 'hue' ? accentAnchor(seed, slot) : neutralAnchor(seed, slot);

const accentAnchor = (seed: OKLCH, { variant, index }: SeedSlot): Anchor => {
  const offset = HUE_OFFSETS[index] ?? HUE_OFFSETS[1];
  const direction = pickDirection((side) => seed.h - side * offset.hue);
  const primaryHue = normalizeHue(seed.h - direction * offset.hue);
  const neutralHue = normalizeHue(primaryHue + direction * NEUTRAL_HUE_OFFSET);
  const ladders = baseLadders();

  // In the light variant, the seed is a mirrored accent: find the dark accent
  // it mirrors, by running the contrast mapping backwards.
  let darkSeed = seed;
  if (variant === 'light') {
    const chroma = seed.c / LIGHT_ACCENT_CHROMA_BOOST;
    const tint = tintOfPrimary(chroma / offset.chroma);
    const lightBackground = neutral('light', 'surface', 0, ladders, {
      tint,
      neutralHue,
    });
    const darkBackground = neutral('dark', 'surface', 0, ladders, {
      tint,
      neutralHue,
    });
    const target = darkContrast(contrast(seed, lightBackground));
    const l = solveLightness({
      chroma,
      hue: seed.h,
      background: darkBackground,
      target,
      range: [darkBackground.l, 1],
    });
    darkSeed = { l, c: chroma, h: seed.h };
  }

  const primary = {
    l: clamp(
      darkSeed.l - offset.lightness,
      PRIMARY_RANGE.min,
      PRIMARY_RANGE.max,
    ),
    c: darkSeed.c / offset.chroma,
    h: primaryHue,
  };
  return {
    primary,
    direction,
    neutralHue,
    tint: tintOfPrimary(primary.c),
    vividness: vividnessOfPrimary(primary.c),
    ladders,
  };
};

const neutralAnchor = (seed: OKLCH, slot: SeedSlot): Anchor => {
  const { variant, index } = slot;
  const group = slot.group === 'ink' ? 'ink' : 'surface';
  const achromatic = seed.c < ACHROMATIC_CHROMA;
  const neutralHue = achromatic ? ACHROMATIC_HUE : seed.h;
  const direction = pickDirection(
    (side) => neutralHue - side * NEUTRAL_HUE_OFFSET,
  );
  const baseChroma = NEUTRAL_CHROMA[variant][group][index] ?? 0.02;
  const tint = achromatic ? 0 : Math.min(seed.c / baseChroma, 5);
  const primaryChroma = achromatic
    ? PRIMARY_CHROMA * 0.9
    : PRIMARY_CHROMA * clamp(Math.sqrt(tint), 0.6, 2.2);

  const ladders = baseLadders();
  const ladder = ladders[variant][group];
  const shift = seed.l - (ladder[index] ?? seed.l);
  // The light comment gray stands apart from the light backgrounds: moving
  // it moves nothing else.
  const follow =
    variant === 'light' && group === 'surface' && index === 3
      ? 0
      : LADDER_FOLLOW;
  ladders[variant][group] = ladder.map((lightness, position) =>
    position === index ? seed.l : clamp(lightness + shift * follow, 0, 1),
  );

  return {
    primary: {
      l: PRIMARY_LIGHTNESS,
      c: primaryChroma,
      h: normalizeHue(neutralHue - direction * NEUTRAL_HUE_OFFSET),
    },
    direction,
    neutralHue,
    tint,
    vividness: vividnessOfPrimary(primaryChroma),
    ladders,
    tintedGroup: { variant, group },
  };
};

const tintOfPrimary = (chroma: number) =>
  clamp(chroma / PRIMARY_CHROMA, 0.25, 1.5);

const vividnessOfPrimary = (chroma: number) =>
  clamp(Math.sqrt(chroma / PRIMARY_CHROMA), 0.85, 1.5);

const baseLadders = (): Ladders => ({
  dark: {
    surface: [...NEUTRAL_LIGHTNESS.dark.surface],
    ink: [...NEUTRAL_LIGHTNESS.dark.ink],
  },
  light: {
    surface: [...NEUTRAL_LIGHTNESS.light.surface],
    ink: [...NEUTRAL_LIGHTNESS.light.ink],
  },
});

/**
 * The spread direction that keeps the in-hue accents clear of the most
 * signal windows. Clockwise (+1) on a tie.
 *
 * @param primaryHueFor - The primary's hue for a given direction.
 */
const pickDirection = (primaryHueFor: (side: 1 | -1) => number): 1 | -1 => {
  const collisions = (side: 1 | -1) => {
    const band = bandHues(primaryHueFor(side), side);
    return Object.values(SIGNAL_WINDOWS).filter((window) =>
      band.some((hue) => hueDistance(hue, window.ideal) < SIGNAL_CLEARANCE),
    ).length;
  };
  return collisions(-1) < collisions(1) ? -1 : 1;
};

const bandHues = (primaryHue: number, direction: 1 | -1): number[] =>
  HUE_OFFSETS.map((offset) =>
    normalizeHue(primaryHue + direction * offset.hue),
  );

// The dark variant ---------------------------------------------------------

const darkPalette = (anchor: Anchor): Palette => {
  const hue = darkHueAccents(anchor);
  return {
    surface: neutrals('dark', 'surface', anchor),
    ink: neutrals('dark', 'ink', anchor),
    hue: hue.map(swatch),
    signal: darkSignals(anchor, hue).map(swatch),
  };
};

const darkHueAccents = ({ primary, direction }: Anchor): OKLCH[] =>
  HUE_OFFSETS.map((offset) => {
    const ratio =
      primary.c > VIVID_PRIMARY ? Math.min(offset.chroma, 1) : offset.chroma;
    return gamutMap({
      l: clamp(
        primary.l + offset.lightness,
        DARK_ACCENT_LIGHTNESS.min,
        DARK_ACCENT_LIGHTNESS.max,
      ),
      c: primary.c * ratio,
      h: normalizeHue(primary.h + direction * offset.hue),
    });
  });

const darkSignals = (
  { primary, direction, vividness }: Anchor,
  accents: OKLCH[],
): OKLCH[] => {
  const band = bandHues(primary.h, direction);
  const semantic = {
    red: signalHue(SIGNAL_WINDOWS.red, band),
    orange: signalHue(SIGNAL_WINDOWS.orange, band),
    yellow: signalHue(SIGNAL_WINDOWS.yellow, band),
    green: signalHue(SIGNAL_WINDOWS.green, band),
  };
  const hues = {
    ...semantic,
    rare: largestGap([...band, ...Object.values(semantic)]),
  };
  return SIGNAL_ROLES.map((role) => {
    const h = hues[role];
    const l = clearLightness(SIGNAL_TONES[role].lightness, h, accents);
    return gamutMap({ l, c: SIGNAL_TONES[role].chroma * vividness, h });
  });
};

/**
 * A signal's lightness, moved away from the in-hue accent it would otherwise
 * be mistaken for: one of a close hue and a close lightness.
 */
const clearLightness = (
  lightness: number,
  hue: number,
  accents: OKLCH[],
  { gap, min, max }: Clearance = SIGNAL_SPACING.dark,
): number => {
  const twin = accents.find(
    (accent) =>
      hueDistance(accent.h, hue) < SIGNAL_CLEARANCE &&
      Math.abs(accent.l - lightness) < gap,
  );
  if (twin === undefined) {
    return lightness;
  }
  const candidates = [twin.l - gap, twin.l + gap].filter(
    (candidate) => candidate >= min && candidate <= max,
  );
  const closest = candidates.toSorted(
    (a, b) => Math.abs(a - lightness) - Math.abs(b - lightness),
  );
  return closest[0] ?? lightness;
};

/**
 * The hue in a role's window closest to its ideal among those at least
 * `SIGNAL_CLEARANCE` from every in-hue accent; when none is, the one farthest
 * from them.
 */
const signalHue = (window: HueWindow, band: number[]): number => {
  let best = window.ideal;
  let bestScore = -Infinity;
  for (let hue = window.from; hue <= window.to; hue++) {
    const clearance = Math.min(...band.map((other) => hueDistance(hue, other)));
    const score =
      Math.min(clearance, SIGNAL_CLEARANCE) * 1000 -
      Math.abs(hue - window.ideal);
    if (score > bestScore) {
      best = hue;
      bestScore = score;
    }
  }
  return best;
};

/** The middle of the widest empty arc between the given hues. */
const largestGap = (hues: number[]): number => {
  const sorted = hues.map(normalizeHue).toSorted((a, b) => a - b);
  let middle = 0;
  let widest = -1;
  sorted.forEach((hue, index) => {
    const next = sorted[(index + 1) % sorted.length] ?? hue;
    // A lone hue (next === hue) leaves the whole circle free.
    const gap = normalizeHue(next - hue);
    const width = gap === 0 ? 360 : gap;
    if (width > widest) {
      widest = width;
      middle = normalizeHue(hue + width / 2);
    }
  });
  return middle;
};

// The light variant ------------------------------------------------------

const lightPalette = (anchor: Anchor, dark: Palette): Palette => {
  const background = neutral('light', 'surface', 0, anchor.ladders, anchor);
  const darkBackground = dark.surface[0]?.color ?? background;
  const mirror = ({ color }: Swatch) =>
    mirrorAccent(color, darkBackground, background);
  const hue = dark.hue.map(mirror);
  // Mirroring compresses lightness: clear the signals again.
  const signal = dark.signal.map(mirror).map((color) =>
    gamutMap({
      ...color,
      l: clearLightness(color.l, color.h, hue, SIGNAL_SPACING.light),
    }),
  );
  return {
    surface: neutrals('light', 'surface', anchor),
    ink: neutrals('light', 'ink', anchor),
    hue: hue.map(swatch),
    signal: signal.map(swatch),
  };
};

/**
 * The light-variant twin of a dark accent: same hue, a little more chroma, and
 * the lightness that gives it the same contrast on the light background as the
 * dark accent has on the dark one, within the light accent limits.
 */
const mirrorAccent = (
  accent: OKLCH,
  darkBackground: OKLCH,
  lightBackground: OKLCH,
): OKLCH => {
  const target = lightContrast(contrast(accent, darkBackground));
  const chroma = accent.c * LIGHT_ACCENT_CHROMA_BOOST;
  const l = solveLightness({
    chroma,
    hue: accent.h,
    background: lightBackground,
    target,
    range: [0.1, lightBackground.l],
  });
  return gamutMap({ l, c: chroma, h: accent.h });
};

/** Maps a dark accent's contrast to its light twin's (see `LIGHT_ACCENT_CONTRAST`). */
const lightContrast = (dark: number): number => {
  const [darkLow, darkHigh] = LIGHT_ACCENT_CONTRAST.dark;
  const [lightLow, lightHigh] = LIGHT_ACCENT_CONTRAST.light;
  const position = clamp(
    Math.log(dark / darkLow) / Math.log(darkHigh / darkLow),
    0,
    1,
  );
  return lightLow * (lightHigh / lightLow) ** position;
};

/** The inverse of `lightContrast`, for a seed of the light variant. */
const darkContrast = (light: number): number => {
  const [darkLow, darkHigh] = LIGHT_ACCENT_CONTRAST.dark;
  const [lightLow, lightHigh] = LIGHT_ACCENT_CONTRAST.light;
  const position = clamp(
    Math.log(light / lightLow) / Math.log(lightHigh / lightLow),
    0,
    1,
  );
  return darkLow * (darkHigh / darkLow) ** position;
};

type SolveLightnessParams = {
  /** Chroma of the color, before gamut mapping. */
  chroma: number;
  /** Hue of the color. */
  hue: number;
  /** The color it must contrast with. */
  background: OKLCH;
  /** The contrast ratio to reach. */
  target: number;
  /** Lightness range to search; contrast must be monotonic over it. */
  range: [number, number];
};

/** Bisects for the lightness at which a color reaches a contrast ratio. */
const solveLightness = ({
  chroma,
  hue,
  background,
  target,
  range: [low, high],
}: SolveLightnessParams): number => {
  const contrastAt = (l: number) =>
    contrast(gamutMap({ l, c: chroma, h: hue }), background);
  // Contrast grows from the end nearest the background to the far end.
  let near =
    Math.abs(low - background.l) < Math.abs(high - background.l) ? low : high;
  let far = near === low ? high : low;
  for (let step = 0; step < 32; step++) {
    const middle = (near + far) / 2;
    if (contrastAt(middle) < target) {
      near = middle;
    } else {
      far = middle;
    }
  }
  return (near + far) / 2;
};

// Neutrals -----------------------------------------------------------------

type Tinting = Pick<Anchor, 'tint' | 'neutralHue' | 'tintedGroup'>;

const neutrals = (
  variant: Variant,
  group: NeutralGroup,
  anchor: Anchor,
): Swatch[] =>
  anchor.ladders[variant][group].map((_, index) =>
    swatch(neutral(variant, group, index, anchor.ladders, anchor)),
  );

const neutral = (
  variant: Variant,
  group: NeutralGroup,
  index: number,
  ladders: Ladders,
  { tint, neutralHue, tintedGroup }: Tinting,
): OKLCH => {
  const own = tintedGroup?.variant === variant && tintedGroup.group === group;
  const strength = own ? tint : Math.min(tint, NEUTRAL_TINT_CAP);
  return gamutMap({
    l: ladders[variant][group][index] ?? 0.5,
    c: (NEUTRAL_CHROMA[variant][group][index] ?? 0) * strength,
    h: neutralHue,
  });
};

// Helpers ------------------------------------------------------------------

const swatch = (color: OKLCH): Swatch => ({ hex: toHex(color), color });

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
