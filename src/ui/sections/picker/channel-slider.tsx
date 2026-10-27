import { Slider } from '@base-ui/react/slider';
import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { type Channel } from './spaces';

/** Props of `ChannelSlider`. */
export type ChannelSliderProps = Omit<
  ComponentProps<'div'>,
  'onChange' | 'children'
> & {
  /** The channel the slider moves. */
  channel: Channel;
  /** Its value. */
  value: number;
  /** Called as the value moves. */
  onChange: (value: number) => void;
  /** CSS background of the track: the colors along the channel. */
  track: string;
  /** Show the channel's name and value above the track. Default: true. */
  labeled?: boolean;
};

/**
 * A slider for one color channel, its track painted with the colors it
 * reaches. `className` is merged over the wrapper's classes; `ref` is the
 * wrapper.
 */
export function ChannelSlider({
  channel,
  value,
  onChange,
  track,
  labeled = true,
  className,
  ...props
}: ChannelSliderProps) {
  return (
    <div className={twMerge('flex flex-col gap-1.5', className)} {...props}>
      <Slider.Root
        value={value}
        min={channel.min}
        max={channel.max}
        step={channel.step}
        onValueChange={(next: number) => {
          onChange(next);
        }}
        className="flex flex-col gap-1.5"
      >
        {labeled && (
          <div className="flex justify-between text-sm">
            <Slider.Label className="text-ink-0">{channel.label}</Slider.Label>
            <span className="font-mono text-ink-1">
              {channel.format(value)}
            </span>
          </div>
        )}
        <Slider.Control className="flex h-5 w-full touch-none items-center select-none">
          <Slider.Track
            className="h-3 w-full rounded-full ring-1 ring-surface-2 ring-inset"
            style={{ background: track }}
          >
            <Slider.Thumb
              aria-label={labeled ? undefined : channel.label}
              getAriaValueText={(_, current) => channel.format(current)}
              className="size-5 rounded-full border-2 border-surface-0 bg-transparent shadow-[0_0_0_1.5px_var(--ink-2)] outline-offset-2 has-focus-visible:outline-2 has-focus-visible:outline-hue-1"
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
