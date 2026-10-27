/**
 * One metaphor names a palette and its four groups, the way one arctic scene
 * names Nord's. Every metaphor is a place or a scene with:
 *
 * - something dark (the dark neutrals),
 * - something pale (the light neutrals),
 * - something in the palette's hue (the in-hue accents),
 * - something many-colored (the out-of-hue accents).
 */
export type Metaphor = {
  /** Name of the palette. */
  name: string;
  /** Name of the dark neutrals: backgrounds when dark, text when light. */
  dark: string;
  /** Name of the light neutrals: text when dark, backgrounds when light. */
  pale: string;
  /** Name of the four accents in the palette's hue. */
  hue: string;
  /** Name of the five accents out of it. */
  many: string;
};

/** Metaphors for a range of primary hues (OKLCH degrees, `from` inclusive). */
export type MetaphorFamily = {
  /** First hue of the range. */
  from: number;
  /** End of the range, exclusive. May wrap past 360. */
  to: number;
  /** The metaphors to pick from. */
  metaphors: readonly Metaphor[];
};

/** Families by the hue of the primary accent. Together they cover the wheel. */
export const METAPHOR_FAMILIES: readonly MetaphorFamily[] = [
  {
    from: 345,
    to: 395,
    metaphors: [
      {
        name: 'Caldera',
        dark: 'Basalt',
        pale: 'Ash Fall',
        hue: 'Magma',
        many: 'Mineral Springs',
      },
      {
        name: 'Hearth',
        dark: 'Soot',
        pale: 'Woodsmoke',
        hue: 'Embers',
        many: 'Sparks',
      },
      {
        name: 'Red Planet',
        dark: 'Night Side',
        pale: 'Dust Storm',
        hue: 'Iron Plains',
        many: 'Dawn Bands',
      },
    ],
  },
  {
    from: 35,
    to: 70,
    metaphors: [
      {
        name: 'Mesa',
        dark: 'Canyon Shadow',
        pale: 'Dune',
        hue: 'Sandstone',
        many: 'Desert Bloom',
      },
      {
        name: 'Equinox',
        dark: 'Long Night',
        pale: 'Hoarfrost',
        hue: 'Falling Leaves',
        many: 'Harvest Market',
      },
      {
        name: 'Lantern',
        dark: 'Back Alley',
        pale: 'Paper Shade',
        hue: 'Lamplight',
        many: 'Festival',
      },
    ],
  },
  {
    from: 70,
    to: 105,
    metaphors: [
      {
        name: 'Apiary',
        dark: 'Hive Shadow',
        pale: 'Beeswax',
        hue: 'Honeycomb',
        many: 'Clover Field',
      },
      {
        name: 'Solstice',
        dark: 'Shortest Night',
        pale: 'Heat Haze',
        hue: 'Noon Sun',
        many: 'Flower Fields',
      },
      {
        name: 'Saffron',
        dark: 'Clay Pot',
        pale: 'Rice',
        hue: 'Saffron Threads',
        many: 'Spice Market',
      },
    ],
  },
  {
    from: 105,
    to: 165,
    metaphors: [
      {
        name: 'Woodland',
        dark: 'Forest Floor',
        pale: 'Morning Mist',
        hue: 'Canopy',
        many: 'Toadstools',
      },
      {
        name: 'Tea House',
        dark: 'Lacquer',
        pale: 'Rice Paper',
        hue: 'Matcha',
        many: 'Koi Pond',
      },
      {
        name: 'Fen',
        dark: 'Peat',
        pale: 'Fog Bank',
        hue: 'Reeds',
        many: 'Dragonflies',
      },
    ],
  },
  {
    from: 165,
    to: 205,
    metaphors: [
      {
        name: 'Lagoon',
        dark: 'Abyss',
        pale: 'Sea Foam',
        hue: 'Shallows',
        many: 'Coral Reef',
      },
      {
        name: 'Tidepool',
        dark: 'Wet Rock',
        pale: 'Salt Spray',
        hue: 'Kelp',
        many: 'Anemones',
      },
      {
        name: 'Verdigris',
        dark: 'Slate Eaves',
        pale: 'Limewash',
        hue: 'Copper Roofs',
        many: 'Stained Glass',
      },
    ],
  },
  {
    from: 205,
    to: 255,
    metaphors: [
      {
        name: 'Glacier',
        dark: 'Crevasse',
        pale: 'Firn',
        hue: 'Meltwater',
        many: 'Sundogs',
      },
      {
        name: 'Harbor',
        dark: 'Night Tide',
        pale: 'Sailcloth',
        hue: 'Open Water',
        many: 'Signal Flags',
      },
      {
        name: 'Contrail',
        dark: 'Upper Dark',
        pale: 'Cirrus',
        hue: 'High Sky',
        many: 'Sunset Bands',
      },
    ],
  },
  {
    from: 255,
    to: 300,
    metaphors: [
      {
        name: 'Deep Field',
        dark: 'Void',
        pale: 'Stardust',
        hue: 'Nebula',
        many: 'Star Clusters',
      },
      {
        name: 'Blue Hour',
        dark: 'Nightfall',
        pale: 'Moonlight',
        hue: 'Twilight',
        many: 'City Lights',
      },
      {
        name: 'Geode',
        dark: 'Bedrock',
        pale: 'Quartz',
        hue: 'Amethyst',
        many: 'Mineral Veins',
      },
    ],
  },
  {
    from: 300,
    to: 345,
    metaphors: [
      {
        name: 'Conservatory',
        dark: 'Potting Soil',
        pale: 'Frosted Glass',
        hue: 'Orchids',
        many: 'Butterflies',
      },
      {
        name: 'Arcade',
        dark: 'Back Room',
        pale: 'Screen Glare',
        hue: 'Neon',
        many: 'Pixels',
      },
      {
        name: 'Patisserie',
        dark: 'Cocoa',
        pale: 'Meringue',
        hue: 'Raspberry',
        many: 'Sprinkles',
      },
    ],
  },
];

/** Metaphors for a seed with no hue at all: the palette's accents are borrowed. */
export const ACHROMATIC_METAPHORS: readonly Metaphor[] = [
  {
    name: 'Quarry',
    dark: 'Slate',
    pale: 'Chalk',
    hue: 'Granite',
    many: 'Lichen',
  },
  {
    name: 'Darkroom',
    dark: 'Blackout',
    pale: 'Contact Sheet',
    hue: 'Silver Halide',
    many: 'Test Strips',
  },
  {
    name: 'Letterpress',
    dark: 'Lead Type',
    pale: 'Cotton Paper',
    hue: 'Ink Wash',
    many: 'Proof Marks',
  },
];
