import { Menu } from '@base-ui/react/menu';
import { Toast } from '@base-ui/react/toast';
import { DownloadSimpleIcon, LinkIcon } from '@phosphor-icons/react';
import { type ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

import { EXPORT_FORMATS } from '@/exports';
import { buttonClasses } from '@/ui/components/button';
import { usePalette } from '@/ui/palette';

import { downloadFile } from './download';
import { useExportInput } from './use-export-input';

/**
 * Copy the palette's link, and download it in any format (single-palette
 * formats in the variant on screen). `className` is merged over the group's
 * classes; `ref` is the group.
 */
export function PaletteActions({ className, ...props }: ComponentProps<'div'>) {
  const { variant } = usePalette();
  const input = useExportInput();
  const toasts = Toast.useToastManager();

  const share = async () => {
    await navigator.clipboard.writeText(input.url ?? window.location.href);
    toasts.add({
      title: 'Link copied',
      description: `Anyone with it sees ${input.names.palette}.`,
    });
  };

  return (
    <div className={twMerge('flex items-center gap-2', className)} {...props}>
      <button
        type="button"
        onClick={share}
        className={buttonClasses('primary', 'small')}
      >
        <LinkIcon className="size-4" aria-hidden="true" />
        Copy link
      </button>
      <Menu.Root>
        <Menu.Trigger className={buttonClasses('secondary', 'small')}>
          <DownloadSimpleIcon className="size-4" aria-hidden="true" />
          Download
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={6} align="end" className="z-30">
            <Menu.Popup className="min-w-56 rounded-lg border border-surface-2 bg-surface-1 py-1 text-sm text-ink-1 shadow-lg">
              {EXPORT_FORMATS.map((format) => {
                const file = format.build(input, variant);
                return (
                  <Menu.Item
                    key={format.id}
                    onClick={() => {
                      downloadFile(file);
                    }}
                    className="flex cursor-pointer flex-col px-3 py-1.5 outline-none data-highlighted:bg-surface-2"
                  >
                    <span>{format.name}</span>
                    <span className="font-mono text-xs text-ink-0">
                      {file.filename}
                    </span>
                  </Menu.Item>
                );
              })}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
