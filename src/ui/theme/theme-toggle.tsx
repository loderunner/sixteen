import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { MonitorIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { tw } from '@/ui/tw';

import { type ThemePreference, useTheme } from './use-theme';

const option = tw`flex size-5 cursor-pointer items-center justify-center rounded-md text-ink-0 opacity-70 hover:opacity-100 data-checked:bg-surface-2 data-checked:text-ink-2 data-checked:opacity-100`;

/** Props of `ThemeToggle`. */
export type ThemeToggleProps = Omit<
  ComponentProps<typeof RadioGroup>,
  'value' | 'defaultValue' | 'onValueChange' | 'children' | 'className'
> & {
  /** Merged over the toggle's own classes. */
  className?: string;
};

/**
 * A System / Light / Dark switch for the theme preference.
 * `className` is merged over the toggle styles; `ref` is the group element.
 */
export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { preference, setPreference } = useTheme();

  return (
    <RadioGroup
      aria-label="Theme"
      value={preference}
      onValueChange={(value: ThemePreference) => {
        setPreference(value);
      }}
      className={twMerge(
        'inline-flex gap-0.5 rounded-lg border border-surface-2 p-0.5',
        className,
      )}
      {...props}
    >
      <Radio.Root value="system" aria-label="System theme" className={option}>
        <MonitorIcon className="size-4" aria-hidden="true" />
      </Radio.Root>
      <Radio.Root value="light" aria-label="Light theme" className={option}>
        <SunIcon className="size-4" aria-hidden="true" />
      </Radio.Root>
      <Radio.Root value="dark" aria-label="Dark theme" className={option}>
        <MoonIcon className="size-4" aria-hidden="true" />
      </Radio.Root>
    </RadioGroup>
  );
}
