import { type ComponentProps, useId, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useWidth } from './use-width';

/** One column of a `ColumnChart`. */
export type Column = {
  /** Category, shown on the axis. */
  label: string;
  /** Value. */
  value: number;
};

/** Props of `ColumnChart`. */
export type ColumnChartProps = ComponentProps<'figure'> & {
  /** What the chart shows, as its accessible name and table caption. */
  title: string;
  /** The columns, left to right. */
  columns: Column[];
  /** The column the story is about: drawn in the accent and labeled. */
  highlight: number;
  /** Formats a value for labels, ticks and the tooltip. */
  format?: (value: number) => string;
};

const HEIGHT = 200;
const AXIS = 28;
const LEFT = 36;
const COLUMN = 22;
const RADIUS = 4;

const niceMax = (max: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
};

/** A column path rounded at the data end and square at the baseline. */
const columnPath = (x: number, y: number, height: number) => {
  const radius = Math.min(RADIUS, height);
  return [
    `M${x},${y + height}`,
    `V${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `H${x + COLUMN - radius}`,
    `Q${x + COLUMN},${y} ${x + COLUMN},${y + radius}`,
    `V${y + height}`,
    'Z',
  ].join(' ');
};

/**
 * One series of columns in the palette's accents: the highlighted column in
 * the primary, the rest in the deep accent. Hover or focus a column for its
 * value; the data is also in a table for screen readers. `className` is
 * merged over the figure's classes; `ref` is the figure.
 */
export function ColumnChart({
  title,
  columns,
  highlight,
  format = (value) => value.toLocaleString('en'),
  className,
  ...props
}: ColumnChartProps) {
  const id = useId();
  const [svg, width] = useWidth<SVGSVGElement>(480);
  const [active, setActive] = useState<number>();
  const max = niceMax(Math.max(...columns.map(({ value }) => value)));
  const ticks = [0, max / 2, max];
  const plot = HEIGHT - AXIS;
  const band = (width - LEFT) / columns.length;
  const yOf = (value: number) => plot - (value / max) * (plot - 8);
  const shown = active ?? highlight;
  const tip = columns[shown];

  return (
    <figure
      className={twMerge('relative', className)}
      aria-labelledby={`${id}-caption`}
      {...props}
    >
      <svg
        ref={svg}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="h-50 w-full overflow-visible"
        aria-hidden="true"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={LEFT}
              x2={width}
              y1={yOf(tick)}
              y2={yOf(tick)}
              className="stroke-surface-2"
              strokeWidth={1}
            />
            <text
              x={LEFT - 8}
              y={yOf(tick)}
              dy="0.32em"
              textAnchor="end"
              className="fill-ink-0 text-[11px]"
            >
              {format(tick)}
            </text>
          </g>
        ))}
        {columns.map((column, index) => {
          const x = LEFT + band * index + (band - COLUMN) / 2;
          const y = yOf(column.value);
          return (
            <g key={column.label}>
              <path
                d={columnPath(x, y, plot - y)}
                className={index === highlight ? 'fill-hue-1' : 'fill-hue-3'}
                opacity={active === undefined || active === index ? 1 : 0.6}
              />
              {index === highlight && (
                <text
                  x={x + COLUMN / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-ink-1 text-[11px] font-medium"
                >
                  {format(column.value)}
                </text>
              )}
              <text
                x={x + COLUMN / 2}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="fill-ink-0 text-[11px]"
              >
                {column.label}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Hit targets: the whole band of each column, focusable. */}
      <div
        className="absolute inset-y-0 right-0 flex"
        style={{
          left: `${(LEFT / width) * 100}%`,
          bottom: `${(AXIS / HEIGHT) * 100}%`,
        }}
      >
        {columns.map((column, index) => (
          <button
            key={column.label}
            type="button"
            aria-label={`${column.label}: ${format(column.value)}`}
            className="flex-1 cursor-default rounded-sm outline-offset-0"
            onPointerEnter={() => {
              setActive(index);
            }}
            onPointerLeave={() => {
              setActive(undefined);
            }}
            onFocus={() => {
              setActive(index);
            }}
            onBlur={() => {
              setActive(undefined);
            }}
          />
        ))}
      </div>
      {active !== undefined && (
        <output
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-surface-2 bg-surface-0 px-2 py-1 text-xs shadow-sm"
          style={{
            left: `${((LEFT + band * (shown + 0.5)) / width) * 100}%`,
          }}
        >
          <span className="font-semibold text-ink-2">{format(tip.value)}</span>{' '}
          <span className="text-ink-0">{tip.label}</span>
        </output>
      )}
      <figcaption id={`${id}-caption`} className="sr-only">
        {title}
      </figcaption>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {columns.map((column) => (
            <tr key={column.label}>
              <th scope="row">{column.label}</th>
              <td>{format(column.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
