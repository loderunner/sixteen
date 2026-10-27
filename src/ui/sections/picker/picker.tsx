import { Tabs } from '@base-ui/react/tabs';
import { EyedropperIcon, ShuffleIcon } from '@phosphor-icons/react';
import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { randomSeed } from '@/palette';
import { Button } from '@/ui/components/button';
import { usePalette } from '@/ui/palette';

import { HexField } from '../hero/hex-field';
import { ChannelSlider } from './channel-slider';
import { ColorArea } from './color-area';
import { channelGradient, type ColorSpace, HSV, SLIDER_SPACES } from './spaces';
import { useChannels } from './use-channels';

type EyeDropperResult = { sRGBHex: string };
type EyeDropperConstructor = new () => {
  open: () => Promise<EyeDropperResult>;
};

const hasEyeDropper = (
  scope: object,
): scope is { EyeDropper: EyeDropperConstructor } => 'EyeDropper' in scope;

/**
 * Picks the seed: a saturation and brightness area with a hue strip, sliders
 * in OKLCH, HSL or RGB, a hex field, an eyedropper where the browser has one,
 * and a random pick. `className` is merged over the wrapper's classes; `ref`
 * is the wrapper.
 */
export function Picker({ className, ...props }: ComponentProps<'div'>) {
  const { pair, variant, setSeed } = usePalette();
  const [hsv, setHSV] = useChannels(HSV, pair.seed, setSeed);
  const [hue, saturation, brightness] = hsv;

  const pickFromScreen = async () => {
    if (!hasEyeDropper(window)) {
      return;
    }
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      setSeed(sRGBHex);
    } catch {
      // The user pressed Escape: keep the color.
    }
  };

  return (
    <div className={twMerge('flex flex-col gap-4', className)} {...props}>
      <ColorArea
        hue={hue}
        saturation={saturation}
        brightness={brightness}
        onChange={(nextSaturation, nextBrightness) => {
          setHSV([hue, nextSaturation, nextBrightness]);
        }}
      />
      <ChannelSlider
        channel={HSV.channels[0]}
        value={hue}
        labeled={false}
        track={channelGradient(HSV, [hue, 100, 100], 0)}
        onChange={(nextHue) => {
          setHSV([nextHue, saturation, brightness]);
        }}
      />
      <Tabs.Root defaultValue={SLIDER_SPACES[0].name}>
        <Tabs.List
          aria-label="Color space"
          className="relative flex gap-1 border-b border-surface-2"
        >
          {SLIDER_SPACES.map((space) => (
            <Tabs.Tab
              key={space.name}
              value={space.name}
              className="cursor-pointer px-2 pb-2 text-sm text-ink-0 data-active:text-ink-2"
            >
              {space.name}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="absolute bottom-0 left-(--active-tab-left) h-0.5 w-(--active-tab-width) bg-hue-1 transition-all" />
        </Tabs.List>
        {SLIDER_SPACES.map((space) => (
          <Tabs.Panel key={space.name} value={space.name} className="pt-3">
            <SpaceSliders space={space} />
          </Tabs.Panel>
        ))}
      </Tabs.Root>
      <div className="flex items-end gap-2">
        <HexField
          value={pair.seed}
          onChange={setSeed}
          className="min-w-0 flex-1"
        />
        {hasEyeDropper(window) && (
          <Button
            size="small"
            aria-label="Pick a color from the screen"
            title="Pick a color from the screen"
            onClick={pickFromScreen}
            className="mb-px"
          >
            <EyedropperIcon className="size-4" aria-hidden="true" />
          </Button>
        )}
        <Button
          size="small"
          aria-label="Random color"
          title="Random color"
          onClick={() => {
            setSeed(randomSeed(variant));
          }}
          className="mb-px"
        >
          <ShuffleIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

type SpaceSlidersProps = {
  /** The space to edit in. */
  space: ColorSpace;
};

function SpaceSliders({ space }: SpaceSlidersProps) {
  const { pair, setSeed } = usePalette();
  const [values, setValues] = useChannels(space, pair.seed, setSeed);

  return (
    <div className="flex flex-col gap-3">
      {space.channels.map((channel, index) => (
        <ChannelSlider
          key={channel.label}
          channel={channel}
          value={values[index] ?? channel.min}
          track={channelGradient(space, values, index)}
          onChange={(next) => {
            const updated = [...values];
            updated[index] = next;
            setValues([updated[0] ?? 0, updated[1] ?? 0, updated[2] ?? 0]);
          }}
        />
      ))}
    </div>
  );
}
