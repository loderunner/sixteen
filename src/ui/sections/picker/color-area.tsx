import { type ComponentProps, type PointerEvent } from 'react';
import { twMerge } from 'tailwind-merge';

import { HSV } from './spaces';

/** Props of `ColorArea`. */
export type ColorAreaProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  /** Hue in degrees: the color at the area's top right. */
  hue: number;
  /** Saturation in percent: left to right. */
  saturation: number;
  /** Brightness in percent: bottom to top. */
  brightness: number;
  /** Called with the new saturation and brightness. */
  onChange: (saturation: number, brightness: number) => void;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/**
 * The square of a hue's saturations (left to right) and brightnesses (bottom
 * to top). Drag or click to pick. From the keyboard, two range inputs (hidden,
 * focusable) move saturation and brightness.
 * `className` is merged over the area's classes; `ref` is the area.
 */
export function ColorArea({
  hue,
  saturation,
  brightness,
  onChange,
  className,
  ...props
}: ColorAreaProps) {
  const pure = HSV.toHex([hue, 100, 100]);

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    onChange(
      clampPercent(((event.clientX - box.left) / box.width) * 100),
      clampPercent(100 - ((event.clientY - box.top) / box.height) * 100),
    );
  };

  return (
    <div
      className={twMerge(
        'relative h-40 touch-none rounded-md ring-1 ring-surface-2 select-none ring-inset',
        className,
      )}
      style={{
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pure})`,
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          pick(event);
        }
      }}
      {...props}
    >
      <input
        type="range"
        aria-label="Saturation"
        min={0}
        max={100}
        value={Math.round(saturation)}
        onChange={(event) => {
          onChange(Number(event.target.value), brightness);
        }}
        className="peer/saturation sr-only"
      />
      <input
        type="range"
        aria-label="Brightness"
        min={0}
        max={100}
        value={Math.round(brightness)}
        onChange={(event) => {
          onChange(saturation, Number(event.target.value));
        }}
        className="peer/brightness sr-only"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-5 -translate-1/2 rounded-full border-2 border-[white] shadow-[0_0_0_1.5px_rgb(0_0_0/0.5)] peer-focus-visible/brightness:outline-2 peer-focus-visible/brightness:outline-offset-2 peer-focus-visible/brightness:outline-hue-1 peer-focus-visible/saturation:outline-2 peer-focus-visible/saturation:outline-offset-2 peer-focus-visible/saturation:outline-hue-1"
        style={{ left: `${saturation}%`, top: `${100 - brightness}%` }}
      />
    </div>
  );
}
