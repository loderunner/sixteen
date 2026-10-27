import { GROUP_SIZES, GROUPS, type Group } from '@/palette';
import { GROUP_DESCRIPTIONS, SWATCH_ROLES } from '@/ui/components/swatch-roles';
import { usePalette } from '@/ui/palette';
import { tw } from '@/ui/tw';

import { SwatchTile } from './swatch-tile';

const GRID: Record<Group, string> = {
  surface: tw`grid-cols-2 sm:grid-cols-4`,
  ink: tw`grid-cols-2 sm:grid-cols-4`,
  hue: tw`grid-cols-2 sm:grid-cols-4`,
  signal: tw`grid-cols-2 sm:grid-cols-5`,
};

/** The 16 swatches of the palette on screen, in their four named groups. */
export function SwatchesSection() {
  const { pair, palette, variant, names, swatchNames } = usePalette();
  const background = palette.surface[0].color;
  const labelColors = [palette.surface[0], palette.ink[2]];

  const groups = GROUPS.map((group, position) => {
    const start = GROUPS.slice(0, position).reduce(
      (total, previous) => total + GROUP_SIZES[previous],
      0,
    );
    return (
      <section
        key={group}
        aria-labelledby={`group-${group}`}
        className="grid gap-4 border-t border-surface-2 pt-6 lg:grid-cols-[14rem_1fr] lg:gap-8"
      >
        <div>
          <h3
            id={`group-${group}`}
            className="text-xl font-semibold text-ink-2"
          >
            {names.groups[variant][group]}
          </h3>
          <p className="mt-1 text-sm text-ink-0">{GROUP_DESCRIPTIONS[group]}</p>
        </div>
        <ul className={tw`grid gap-4 ${GRID[group]}`}>
          {palette[group].map((swatch, index) => (
            <SwatchTile
              key={SWATCH_ROLES[variant][group][index]}
              swatch={swatch}
              name={swatchNames?.[variant][start + index]}
              role={SWATCH_ROLES[variant][group][index] ?? ''}
              background={background}
              labelColors={labelColors}
              seed={
                pair.slot.variant === variant &&
                pair.slot.group === group &&
                pair.slot.index === index
              }
            />
          ))}
        </ul>
      </section>
    );
  });

  return (
    <section aria-labelledby="swatches" className="flex flex-col gap-8">
      <h2
        id="swatches"
        className="text-3xl font-semibold tracking-tight text-ink-2"
      >
        Swatches
      </h2>
      {groups}
    </section>
  );
}
