import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { type ComponentProps, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { tw } from '@/ui/tw';

/** What an alert reports, which picks its color and icon. */
export type AlertTone = 'error' | 'warning' | 'success' | 'info';

const TONES: Record<AlertTone, { box: string; icon: ReactNode }> = {
  error: {
    box: tw`border-signal-red bg-signal-red/10`,
    icon: <XCircleIcon className="size-5 text-signal-red" aria-hidden="true" />,
  },
  warning: {
    box: tw`border-signal-yellow bg-signal-yellow/10`,
    icon: (
      <WarningIcon className="size-5 text-signal-yellow" aria-hidden="true" />
    ),
  },
  success: {
    box: tw`border-signal-green bg-signal-green/10`,
    icon: (
      <CheckCircleIcon
        className="size-5 text-signal-green"
        aria-hidden="true"
      />
    ),
  },
  info: {
    box: tw`border-hue-1 bg-hue-1/10`,
    icon: <InfoIcon className="size-5 text-hue-1" aria-hidden="true" />,
  },
};

/** Props of `Alert`. */
export type AlertProps = ComponentProps<'div'> & {
  /** What it reports. */
  tone: AlertTone;
  /** Short title. */
  title: string;
};

/**
 * A message in a status color, carried by its icon and edge: the text stays
 * in the text colors. `className` is merged over the alert's classes; `ref`
 * is the alert.
 */
export function Alert({
  tone,
  title,
  children,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={twMerge(
        'flex gap-3 rounded-md border-l-4 px-4 py-3',
        TONES[tone].box,
        className,
      )}
      {...props}
    >
      {TONES[tone].icon}
      <div>
        <p className="font-medium text-ink-2">{title}</p>
        <p className="text-sm text-ink-0">{children}</p>
      </div>
    </div>
  );
}
