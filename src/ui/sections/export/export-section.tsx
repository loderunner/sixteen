import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { EXPORT_FORMATS, type ExportFormat } from '@/exports';
import { type Variant } from '@/palette';
import { Button } from '@/ui/components/button';
import { CopyButton } from '@/ui/components/copy-button';
import { downloadFile, useExportInput } from '@/ui/components/palette-actions';
import { usePalette } from '@/ui/palette';
import { tw } from '@/ui/tw';

const option = tw`cursor-pointer rounded-md px-3 py-1 text-sm text-ink-0 data-checked:bg-surface-2 data-checked:text-ink-2`;

/** Every export format, each with a download and a copy action. */
export function ExportSection() {
  const { variant: shown, names } = usePalette();
  const [chosen, setChosen] = useState<Variant>();
  const variant = chosen ?? shown;
  const perVariant = EXPORT_FORMATS.some(({ variants }) => variants === 'each');

  return (
    <section aria-labelledby="export" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="export"
            className="text-3xl font-semibold tracking-tight text-ink-2"
          >
            Export
          </h2>
          <p className="mt-1 text-ink-0">
            Take {names.palette} to your editor, your terminal or your CSS.
          </p>
        </div>
        {perVariant && (
          <RadioGroup
            aria-label="Palette for single-palette files"
            value={variant}
            onValueChange={(value: Variant) => {
              setChosen(value);
            }}
            className="inline-flex gap-1 rounded-lg border border-surface-2 p-1"
          >
            <Radio.Root value="dark" className={option}>
              Dark
            </Radio.Root>
            <Radio.Root value="light" className={option}>
              Light
            </Radio.Root>
          </RadioGroup>
        )}
      </div>
      <ul className="flex flex-col">
        {EXPORT_FORMATS.map((format) => (
          <ExportRow key={format.id} format={format} variant={variant} />
        ))}
      </ul>
    </section>
  );
}

type ExportRowProps = {
  /** The format of this row. */
  format: ExportFormat;
  /** Which palette single-palette formats export. */
  variant: Variant;
};

function ExportRow({ format, variant }: ExportRowProps) {
  const input = useExportInput();
  const file = format.build(input, variant);
  const setup = format.setup?.(input);

  return (
    <li className="flex flex-col gap-3 border-t border-surface-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-medium text-ink-2">{format.name}</h3>
        <p className="text-sm text-ink-0">{format.description}</p>
        {setup !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            <code className="rounded-sm bg-surface-1 px-2 py-1 font-mono text-xs text-ink-1">
              {setup}
            </code>
            <CopyButton text={setup} label="Copy the config line" />
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="small"
          onClick={() => {
            downloadFile(file);
          }}
        >
          <DownloadSimpleIcon className="size-4" aria-hidden="true" />
          <span className="font-mono">{file.filename}</span>
        </Button>
        <CopyButton
          text={file.content}
          label={`Copy ${format.name}`}
          className="self-center"
        />
      </div>
    </li>
  );
}
