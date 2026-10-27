import {
  FilesIcon,
  GitBranchIcon,
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { type ComponentProps, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { type VSCodeTheme } from '@/exports';

/** Props of `WorkbenchFrame`. */
export type WorkbenchFrameProps = ComponentProps<'div'> & {
  /** The theme whose workbench colors paint the frame. */
  theme: VSCodeTheme;
  /** Name of the open file, on its tab. */
  file: string;
  /** Language shown in the status bar. */
  language: string;
  /** Caret position shown in the status bar. */
  caret: { line: number; column: number };
  /** The editor. */
  children: ReactNode;
};

/**
 * The chrome of a VS Code window around the editor, painted with the theme's
 * workbench colors: activity bar, tabs and status bar. Decorative: it mirrors
 * what the exported theme looks like. `className` is merged over the frame's
 * classes; `ref` is the frame.
 */
export function WorkbenchFrame({
  theme,
  file,
  language,
  caret,
  children,
  className,
  ...props
}: WorkbenchFrameProps) {
  const { colors } = theme;
  const icon = 'size-5';

  return (
    <div
      className={twMerge(
        'grid grid-cols-[3rem_1fr] grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg text-[13px] ring-1 ring-surface-2',
        className,
      )}
      style={{ background: colors['editor.background'] }}
      {...props}
    >
      <div
        aria-hidden="true"
        className="row-span-2 flex flex-col items-center gap-5 pt-3"
        style={{
          background: colors['activityBar.background'],
          color: colors['activityBar.inactiveForeground'],
        }}
      >
        <span
          className="flex w-full justify-center border-l-2"
          style={{
            borderColor: colors['activityBar.activeBorder'],
            color: colors['activityBar.foreground'],
          }}
        >
          <FilesIcon className={icon} />
        </span>
        <MagnifyingGlassIcon className={icon} />
        <GitBranchIcon className={icon} />
        <span className="relative">
          <PuzzlePieceIcon className={icon} />
          <span
            className="absolute -right-1.5 -bottom-1 rounded-full px-1 text-[9px]/3.5"
            style={{
              background: colors['activityBarBadge.background'],
              color: colors['activityBarBadge.foreground'],
            }}
          >
            3
          </span>
        </span>
      </div>
      <div
        aria-hidden="true"
        className="flex"
        style={{ background: colors['editorGroupHeader.tabsBackground'] }}
      >
        <span
          className="px-4 py-2"
          style={{
            background: colors['tab.activeBackground'],
            color: colors['tab.activeForeground'],
          }}
        >
          {file}
        </span>
        <span
          className="px-4 py-2"
          style={{
            background: colors['tab.inactiveBackground'],
            color: colors['tab.inactiveForeground'],
          }}
        >
          palette.css
        </span>
      </div>
      <div className="min-h-0 min-w-0">{children}</div>
      <div
        aria-hidden="true"
        className="col-span-2 flex items-center gap-4 px-3 py-1 text-xs"
        style={{
          background: colors['statusBar.background'],
          color: colors['statusBar.foreground'],
        }}
      >
        <span className="flex items-center gap-1">
          <GitBranchIcon className="size-3.5" />
          main
        </span>
        <span className="flex items-center gap-1">
          <XCircleIcon
            className="size-3.5"
            style={{ color: colors['editorError.foreground'] }}
          />
          0
          <WarningIcon
            className="ml-1 size-3.5"
            style={{ color: colors['editorWarning.foreground'] }}
          />
          2
        </span>
        <span className="ml-auto">
          Ln {caret.line}, Col {caret.column}
        </span>
        <span>{language}</span>
      </div>
    </div>
  );
}
