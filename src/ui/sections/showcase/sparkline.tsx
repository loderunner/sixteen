import { type ComponentProps } from 'react';

import { useWidth } from './use-width';

/** Props of `Sparkline`. */
export type SparklineProps = Omit<ComponentProps<'svg'>, 'values'> & {
  /** The values, oldest first. */
  values: number[];
};

const HEIGHT = 32;

/**
 * A small trend line: the past in the deep accent, the current point marked
 * in the primary. Decorative; the figure it sits by carries the number.
 */
export function Sparkline({ values, ...props }: SparklineProps) {
  const [svg, width] = useWidth<SVGSVGElement>(120);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const point = (value: number, index: number): [number, number] => [
    4 + (index / (values.length - 1)) * (width - 8),
    4 + (1 - (value - min) / (max === min ? 1 : max - min)) * (HEIGHT - 8),
  ];
  const points = values.map(point);
  const last = points.at(-1) ?? [0, 0];

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      aria-hidden="true"
      {...props}
    >
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-hue-3"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r={4}
        strokeWidth={2}
        className="fill-hue-1 stroke-surface-1"
      />
    </svg>
  );
}
