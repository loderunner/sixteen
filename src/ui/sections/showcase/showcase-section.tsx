import { Checkbox } from '@base-ui/react/checkbox';
import { Switch } from '@base-ui/react/switch';
import { CheckIcon, PlusIcon } from '@phosphor-icons/react';
import { type ComponentProps, useId } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button } from '@/ui/components/button';
import { usePalette } from '@/ui/palette';

import { Alert } from './alerts';
import { ColumnChart } from './column-chart';
import { Sparkline } from './sparkline';

const BUILDS = [
  { label: 'Mon', value: 142 },
  { label: 'Tue', value: 188 },
  { label: 'Wed', value: 171 },
  { label: 'Thu', value: 236 },
  { label: 'Fri', value: 204 },
  { label: 'Sat', value: 64 },
  { label: 'Sun', value: 91 },
];

const SHARES = [
  820, 870, 845, 910, 960, 1010, 990, 1080, 1120, 1150, 1210, 1284,
];

const DEPLOYS = [
  {
    service: 'palette-api',
    version: 'v2.4.1',
    status: 'Live',
    when: '4 min ago',
  },
  {
    service: 'exporter',
    version: 'v1.9.0',
    status: 'Building',
    when: '12 min ago',
  },
  { service: 'names', version: 'v0.8.3', status: 'Failed', when: '1 hour ago' },
] as const;

const STATUS_BADGE = {
  Live: 'bg-signal-green/15 text-ink-1 before:bg-signal-green',
  Building: 'bg-signal-yellow/15 text-ink-1 before:bg-signal-yellow',
  Failed: 'bg-signal-red/15 text-ink-1 before:bg-signal-red',
} as const;

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={twMerge(
        'flex flex-col gap-4 rounded-lg border border-surface-2 bg-surface-1 p-5',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Everyday interface pieces in the palette: a dashboard card with a chart,
 * alerts, form controls, buttons and a table.
 */
export function ShowcaseSection() {
  const { names } = usePalette();
  const emailId = useId();
  const followId = useId();
  const lightId = useId();

  return (
    <section aria-labelledby="showcase" className="flex flex-col gap-6">
      <div>
        <h2
          id="showcase"
          className="text-3xl font-semibold tracking-tight text-ink-2"
        >
          In an interface
        </h2>
        <p className="mt-1 max-w-2xl text-ink-0">
          {names.palette} on everyday components: surfaces for depth, text in
          three steps, the primary accent for action, signals for state.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-6">
        <Card className="lg:col-span-2">
          <p className="text-sm text-ink-0">Palettes shared this week</p>
          <p className="text-5xl font-semibold tracking-tight text-ink-2">
            1,284
          </p>
          <p className="text-sm text-ink-0">
            <span className="font-medium text-ink-1">+12%</span> on last week
          </p>
          <Sparkline values={SHARES} className="mt-auto h-8 w-full" />
        </Card>
        <Card className="lg:col-span-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-medium text-ink-2">Builds per day</h3>
            <p className="text-sm text-ink-0">Thursday was the busiest</p>
          </div>
          <ColumnChart title="Builds per day" columns={BUILDS} highlight={3} />
        </Card>
        <div className="flex flex-col gap-3 lg:col-span-3">
          <Alert tone="error" title="Export failed">
            The terminal theme could not be written. Check that the folder
            exists.
          </Alert>
          <Alert tone="warning" title="Low contrast">
            Comments sit at 3.1:1 on panels. Fine for code, short of body text.
          </Alert>
          <Alert tone="success" title="Theme installed">
            Reload the window to see it everywhere.
          </Alert>
          <Alert tone="info" title="New variant">
            A light palette is ready alongside the dark one.
          </Alert>
        </div>
        <Card className="lg:col-span-3">
          <h3 className="font-medium text-ink-2">Share settings</h3>
          <div className="flex flex-col gap-1">
            <label htmlFor={emailId} className="text-sm text-ink-0">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              placeholder="you@example.com"
              className="rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-ink-1 outline-none placeholder:text-ink-0/60 focus:border-hue-1"
            />
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-ink-1">
            <span id={followId}>Follow the system appearance</span>
            <Switch.Root
              aria-labelledby={followId}
              defaultChecked
              className="relative flex h-6 w-10 cursor-pointer rounded-full bg-surface-3 p-0.5 transition-colors data-checked:bg-hue-1"
            >
              <Switch.Thumb className="size-5 rounded-full bg-surface-0 transition-transform data-checked:translate-x-4" />
            </Switch.Root>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-1">
            <Checkbox.Root
              aria-labelledby={lightId}
              defaultChecked
              className="flex size-5 cursor-pointer items-center justify-center rounded-sm border border-surface-3 bg-surface-0 data-checked:border-hue-1 data-checked:bg-hue-1"
            >
              <Checkbox.Indicator>
                <CheckIcon
                  className="size-3.5 text-surface-0"
                  aria-hidden="true"
                />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <span id={lightId}>Include the light palette</span>
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            <Button variant="primary" size="small">
              <PlusIcon className="size-4" aria-hidden="true" />
              Share palette
            </Button>
            <Button size="small">Preview</Button>
            <Button variant="danger" size="small">
              Delete
            </Button>
            <Button size="small" disabled>
              Publish
            </Button>
          </div>
        </Card>
        <Card className="overflow-x-auto p-0 lg:col-span-6">
          <table className="w-full text-left text-sm">
            <caption className="px-5 pt-5 text-left font-medium text-ink-2">
              Deploys
            </caption>
            <thead className="text-ink-0">
              <tr className="border-b border-surface-2">
                <th scope="col" className="px-5 py-3 font-normal">
                  Service
                </th>
                <th scope="col" className="px-5 py-3 font-normal">
                  Version
                </th>
                <th scope="col" className="px-5 py-3 font-normal">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-right font-normal">
                  When
                </th>
              </tr>
            </thead>
            <tbody>
              {DEPLOYS.map((deploy) => (
                <tr
                  key={deploy.service}
                  className="border-b border-surface-2 last:border-0 hover:bg-surface-2/50"
                >
                  <td className="px-5 py-3 font-medium text-ink-1">
                    {deploy.service}
                  </td>
                  <td className="px-5 py-3 font-mono text-ink-0">
                    {deploy.version}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={twMerge(
                        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs before:size-1.5 before:rounded-full',
                        STATUS_BADGE[deploy.status],
                      )}
                    >
                      {deploy.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-ink-0">
                    {deploy.when}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}
