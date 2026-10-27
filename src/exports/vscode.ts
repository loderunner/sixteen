import { type Variant } from '@/palette';

import { creditOf, type ExportFile, type ExportInput, slugOf } from './roles';
import {
  ansiColors,
  colorResolver,
  COMMENT,
  type ThemeColor,
  TOKEN_RULES,
} from './syntax';

const NONE: ThemeColor = 'surface-0/00';

/**
 * Workbench colors by role, following the shape of Nord's VS Code theme:
 * surfaces for chrome and panels, the primary accent for focus and badges,
 * signals for diagnostics and source control.
 */
const WORKBENCH: Record<string, ThemeColor> = {
  // Base
  foreground: 'ink-0',
  descriptionForeground: 'ink-0/e6',
  errorForeground: 'signal-red',
  focusBorder: 'surface-1',
  'selection.background': 'hue-1/99',
  'widget.shadow': 'surface-0/66',
  'scrollbar.shadow': 'surface-0/66',
  'textLink.foreground': 'hue-1',
  'textLink.activeForeground': 'hue-1',
  'textBlockQuote.border': 'hue-2',
  'textBlockQuote.background': 'surface-1',
  'textCodeBlock.background': 'surface-3',
  'textPreformat.foreground': 'hue-0',
  'textSeparator.foreground': 'ink-2',
  'icon.foreground': 'ink-0',

  // Activity bar, side bar, title bar, status bar
  'activityBar.background': 'surface-0',
  'activityBar.foreground': 'ink-0',
  'activityBar.inactiveForeground': 'ink-0/66',
  'activityBar.activeBorder': 'hue-1',
  'activityBar.activeBackground': 'surface-1',
  'activityBarBadge.background': 'hue-1',
  'activityBarBadge.foreground': 'surface-0',
  'badge.background': 'hue-1',
  'badge.foreground': 'surface-0',
  'sideBar.background': 'surface-0',
  'sideBar.foreground': 'ink-0',
  'sideBar.border': 'surface-1',
  'sideBarTitle.foreground': 'ink-0',
  'sideBarSectionHeader.background': 'surface-1',
  'sideBarSectionHeader.foreground': 'ink-0',
  'titleBar.activeBackground': 'surface-0',
  'titleBar.activeForeground': 'ink-0',
  'titleBar.inactiveBackground': 'surface-0',
  'titleBar.inactiveForeground': 'ink-0/66',
  'titleBar.border': NONE,
  'statusBar.background': 'surface-1',
  'statusBar.foreground': 'ink-0',
  'statusBar.border': NONE,
  'statusBar.debuggingBackground': 'hue-3',
  'statusBar.debuggingForeground': 'ink-2',
  'statusBar.noFolderBackground': 'surface-1',
  'statusBar.noFolderForeground': 'ink-0',
  'statusBarItem.hoverBackground': 'surface-2',
  'statusBarItem.activeBackground': 'surface-3',
  'statusBarItem.prominentBackground': 'surface-1',
  'statusBarItem.prominentHoverBackground': 'surface-2',
  'statusBarItem.errorBackground': 'surface-1',
  'statusBarItem.errorForeground': 'signal-red',
  'statusBarItem.warningBackground': 'signal-yellow',
  'statusBarItem.warningForeground': 'surface-0',
  'statusBarItem.remoteBackground': 'hue-1',
  'statusBarItem.remoteForeground': 'surface-0',

  // Editor groups and tabs
  'editorGroup.border': 'surface-1/01',
  'editorGroup.dropBackground': 'surface-1/99',
  'editorGroupHeader.tabsBackground': 'surface-0',
  'editorGroupHeader.noTabsBackground': 'surface-0',
  'editorGroupHeader.tabsBorder': 'surface-1/00',
  'tab.activeBackground': 'surface-1',
  'tab.activeForeground': 'ink-0',
  'tab.activeBorder': 'hue-1/00',
  'tab.activeBorderTop': 'hue-1/00',
  'tab.inactiveBackground': 'surface-0',
  'tab.inactiveForeground': 'ink-0/66',
  'tab.border': 'surface-1/00',
  'tab.hoverBackground': 'surface-1/cc',
  'tab.unfocusedActiveForeground': 'ink-0/99',
  'tab.unfocusedInactiveForeground': 'ink-0/66',
  'tab.unfocusedHoverBackground': 'surface-1/b3',
  'tab.lastPinnedBorder': 'surface-3',

  // Editor
  'editor.background': 'surface-0',
  'editor.foreground': 'ink-0',
  'editorCursor.foreground': 'ink-0',
  'editor.lineHighlightBackground': 'surface-1',
  'editor.lineHighlightBorder': 'surface-1',
  'editor.selectionBackground': 'surface-2/cc',
  'editor.inactiveSelectionBackground': 'surface-2/cc',
  'editor.selectionHighlightBackground': 'surface-2/cc',
  'editor.wordHighlightBackground': 'hue-2/66',
  'editor.wordHighlightStrongBackground': 'hue-2/99',
  'editor.findMatchBackground': 'hue-1/66',
  'editor.findMatchHighlightBackground': 'hue-1/33',
  'editor.findRangeHighlightBackground': 'hue-1/33',
  'editor.hoverHighlightBackground': 'surface-1',
  'editor.rangeHighlightBackground': 'surface-2/52',
  'editor.foldBackground': 'surface-1',
  'editorLineNumber.foreground': 'surface-3',
  'editorLineNumber.activeForeground': 'ink-0',
  'editorIndentGuide.background1': 'surface-2/b3',
  'editorIndentGuide.activeBackground1': 'surface-3',
  'editorWhitespace.foreground': 'surface-3/b3',
  'editorRuler.foreground': 'surface-2',
  'editorCodeLens.foreground': 'surface-3',
  'editorBracketMatch.background': 'surface-0/00',
  'editorBracketMatch.border': 'hue-1',
  'editorBracketHighlight.foreground1': 'hue-0',
  'editorBracketHighlight.foreground2': 'hue-1',
  'editorBracketHighlight.foreground3': 'hue-2',
  'editorBracketHighlight.foreground4': 'hue-3',
  'editorBracketHighlight.foreground5': 'hue-0',
  'editorBracketHighlight.foreground6': 'hue-1',
  'editorBracketHighlight.unexpectedBracket.foreground': 'signal-red',
  'editorLink.activeForeground': 'hue-1',
  'editorInlayHint.background': 'surface-2',
  'editorInlayHint.foreground': 'ink-0',
  'editorGutter.background': 'surface-0',
  'editorGutter.addedBackground': 'signal-green',
  'editorGutter.modifiedBackground': 'signal-yellow',
  'editorGutter.deletedBackground': 'signal-red',
  'editorError.foreground': 'signal-red',
  'editorError.border': 'signal-red/00',
  'editorWarning.foreground': 'signal-yellow',
  'editorWarning.border': 'signal-yellow/00',
  'editorInfo.foreground': 'hue-1',
  'editorHint.foreground': 'signal-yellow',
  'editorHint.border': 'signal-yellow/00',
  'editorOverviewRuler.border': 'surface-1',
  'editorOverviewRuler.addedForeground': 'signal-green',
  'editorOverviewRuler.modifiedForeground': 'signal-yellow',
  'editorOverviewRuler.deletedForeground': 'signal-red',
  'editorOverviewRuler.errorForeground': 'signal-red',
  'editorOverviewRuler.warningForeground': 'signal-yellow',
  'editorOverviewRuler.infoForeground': 'hue-2',
  'editorOverviewRuler.findMatchForeground': 'hue-1/66',
  'editorOverviewRuler.selectionHighlightForeground': 'hue-1/66',

  // Widgets: suggest, hover, peek, find
  'editorWidget.background': 'surface-0',
  'editorWidget.border': 'surface-1',
  'editorWidget.foreground': 'ink-0',
  'editorSuggestWidget.background': 'surface-0',
  'editorSuggestWidget.border': 'surface-1',
  'editorSuggestWidget.foreground': 'ink-0',
  'editorSuggestWidget.selectedBackground': 'surface-2',
  'editorSuggestWidget.selectedForeground': 'ink-0',
  'editorSuggestWidget.highlightForeground': 'hue-1',
  'editorSuggestWidget.focusHighlightForeground': 'hue-1',
  'editorHoverWidget.background': 'surface-1',
  'editorHoverWidget.border': 'surface-1',
  'peekView.border': 'surface-3',
  'peekViewEditor.background': 'surface-0',
  'peekViewEditor.matchHighlightBackground': 'hue-1/4d',
  'peekViewEditorGutter.background': 'surface-0',
  'peekViewResult.background': 'surface-0',
  'peekViewResult.fileForeground': 'hue-1',
  'peekViewResult.lineForeground': 'ink-0/66',
  'peekViewResult.matchHighlightBackground': 'hue-1/cc',
  'peekViewResult.selectionBackground': 'surface-2',
  'peekViewResult.selectionForeground': 'ink-0',
  'peekViewTitle.background': 'surface-1',
  'peekViewTitleDescription.foreground': 'ink-0',
  'peekViewTitleLabel.foreground': 'hue-1',
  'editorMarkerNavigation.background': 'hue-3/c0',
  'editorMarkerNavigationError.background': 'signal-red/c0',
  'editorMarkerNavigationWarning.background': 'signal-yellow/c0',

  // Diff and merge
  'diffEditor.insertedTextBackground': 'signal-green/33',
  'diffEditor.removedTextBackground': 'signal-red/4d',
  'merge.border': 'surface-1/00',
  'merge.currentContentBackground': 'hue-2/4d',
  'merge.currentHeaderBackground': 'hue-2/66',
  'merge.incomingContentBackground': 'hue-0/4d',
  'merge.incomingHeaderBackground': 'hue-0/66',

  // Lists and trees
  'list.activeSelectionBackground': 'hue-1',
  'list.activeSelectionForeground': 'surface-0',
  'list.inactiveSelectionBackground': 'surface-2',
  'list.inactiveSelectionForeground': 'ink-0',
  'list.inactiveFocusBackground': 'surface-2/cc',
  'list.hoverBackground': 'surface-1',
  'list.hoverForeground': 'ink-2',
  'list.focusBackground': 'hue-1/99',
  'list.focusForeground': 'ink-0',
  'list.highlightForeground': 'hue-1',
  'list.focusHighlightForeground': 'ink-2',
  'list.dropBackground': 'hue-1/99',
  'list.errorForeground': 'signal-red',
  'list.warningForeground': 'signal-yellow',
  'tree.indentGuidesStroke': 'surface-3',
  'pickerGroup.border': 'surface-1',
  'pickerGroup.foreground': 'hue-1',

  // Inputs and buttons
  'input.background': 'surface-1',
  'input.border': 'surface-1',
  'input.foreground': 'ink-0',
  'input.placeholderForeground': 'ink-0/99',
  'inputOption.activeBackground': 'hue-3',
  'inputOption.activeBorder': 'hue-3',
  'inputOption.activeForeground': 'ink-2',
  'inputValidation.errorBackground': 'signal-red',
  'inputValidation.errorBorder': 'signal-red',
  'inputValidation.infoBackground': 'hue-2',
  'inputValidation.infoBorder': 'hue-2',
  'inputValidation.warningBackground': 'signal-orange',
  'inputValidation.warningBorder': 'signal-orange',
  'dropdown.background': 'surface-1',
  'dropdown.border': 'surface-1',
  'dropdown.foreground': 'ink-0',
  'button.background': 'hue-1/ee',
  'button.foreground': 'surface-0',
  'button.hoverBackground': 'hue-1',
  'button.secondaryBackground': 'surface-2',
  'button.secondaryForeground': 'ink-0',
  'button.secondaryHoverBackground': 'surface-3',
  'checkbox.background': 'surface-1',
  'checkbox.border': 'surface-1',
  'checkbox.foreground': 'ink-0',
  'keybindingLabel.background': 'surface-3',
  'keybindingLabel.border': 'surface-3',
  'keybindingLabel.bottomBorder': 'surface-3',
  'keybindingLabel.foreground': 'ink-0',

  // Panels, terminal, notifications
  'panel.background': 'surface-0',
  'panel.border': 'surface-1',
  'panelTitle.activeBorder': 'hue-1/00',
  'panelTitle.activeForeground': 'hue-1',
  'panelTitle.inactiveForeground': 'ink-0',
  'terminal.background': 'surface-0',
  'terminal.foreground': 'ink-0',
  'terminalCursor.foreground': 'ink-0',
  'terminal.selectionBackground': 'surface-2/cc',
  'notificationCenterHeader.background': 'surface-0',
  'notificationCenterHeader.foreground': 'hue-1',
  'notifications.background': 'surface-1',
  'notifications.foreground': 'ink-0',
  'notifications.border': 'surface-0',
  'notificationLink.foreground': 'hue-1',
  'notificationsErrorIcon.foreground': 'signal-red',
  'notificationsWarningIcon.foreground': 'signal-yellow',
  'notificationsInfoIcon.foreground': 'hue-1',
  'debugToolBar.background': 'surface-1',
  'debugConsole.errorForeground': 'signal-red',
  'debugConsole.warningForeground': 'signal-yellow',
  'debugConsole.infoForeground': 'hue-1',
  'debugConsole.sourceForeground': COMMENT,

  // Source control, breadcrumbs, minimap, scrollbars
  'gitDecoration.addedResourceForeground': 'signal-green',
  'gitDecoration.untrackedResourceForeground': 'signal-green',
  'gitDecoration.modifiedResourceForeground': 'signal-yellow',
  'gitDecoration.stageModifiedResourceForeground': 'signal-yellow',
  'gitDecoration.deletedResourceForeground': 'signal-red',
  'gitDecoration.stageDeletedResourceForeground': 'signal-red',
  'gitDecoration.conflictingResourceForeground': 'hue-3',
  'gitDecoration.ignoredResourceForeground': 'ink-0/66',
  'gitDecoration.submoduleResourceForeground': 'hue-0',
  'breadcrumb.foreground': 'ink-0/99',
  'breadcrumb.focusForeground': 'ink-0',
  'breadcrumb.activeSelectionForeground': 'hue-1',
  'breadcrumbPicker.background': 'surface-1',
  'minimap.background': 'surface-0',
  'minimap.findMatchHighlight': 'hue-1',
  'minimap.selectionHighlight': 'hue-1/cc',
  'minimap.errorHighlight': 'signal-red/cc',
  'minimap.warningHighlight': 'signal-yellow/cc',
  'minimapGutter.addedBackground': 'signal-green',
  'minimapGutter.modifiedBackground': 'signal-yellow',
  'minimapGutter.deletedBackground': 'signal-red',
  'minimapSlider.background': 'surface-2/99',
  'minimapSlider.hoverBackground': 'surface-2/aa',
  'minimapSlider.activeBackground': 'surface-2/aa',
  'scrollbarSlider.background': 'surface-2/99',
  'scrollbarSlider.hoverBackground': 'surface-2/aa',
  'scrollbarSlider.activeBackground': 'surface-2/aa',
  'charts.foreground': 'ink-0',
  'charts.lines': 'hue-1',
  'charts.red': 'signal-red',
  'charts.orange': 'signal-orange',
  'charts.yellow': 'signal-yellow',
  'charts.green': 'signal-green',
  'charts.blue': 'hue-2',
  'charts.purple': 'signal-rare',
};

const ANSI_NAMES = [
  'Black',
  'Red',
  'Green',
  'Yellow',
  'Blue',
  'Magenta',
  'Cyan',
  'White',
  'BrightBlack',
  'BrightRed',
  'BrightGreen',
  'BrightYellow',
  'BrightBlue',
  'BrightMagenta',
  'BrightCyan',
  'BrightWhite',
] as const;

/** A VS Code color theme, as its JSON file holds it. */
export type VSCodeTheme = {
  /** Shown in the theme picker. */
  name: string;
  /** `dark` or `light`: which built-in theme VS Code falls back to. */
  type: Variant;
  /** Workbench colors by key. */
  colors: Record<string, string>;
  /** Syntax highlighting rules. */
  tokenColors: {
    /** TextMate scopes. */
    scope: string[];
    /** Colors and font style. */
    settings: { foreground?: string; background?: string; fontStyle?: string };
  }[];
};

/**
 * One palette as a VS Code color theme. Every color in it is one of the
 * palette's 16, with or without an alpha channel.
 *
 * @param input - The palette to export.
 * @param variant - Which palette of the pair.
 */
export function vscodeTheme(
  { pair, names }: ExportInput,
  variant: Variant,
): VSCodeTheme {
  const palette = pair[variant];
  const resolve = colorResolver(palette);
  const colors: Record<string, string> = {};
  for (const [key, color] of Object.entries(WORKBENCH)) {
    colors[key] = resolve(color);
  }
  ansiColors(variant).forEach((color, index) => {
    colors[`terminal.ansi${ANSI_NAMES[index]}`] = resolve(color);
  });
  return {
    name: `${names.palette} ${variant === 'dark' ? 'Dark' : 'Light'}`,
    type: variant,
    colors,
    tokenColors: TOKEN_RULES.map(
      ({ scope, foreground, background, fontStyle }) => ({
        scope,
        settings: {
          ...(foreground === undefined
            ? {}
            : { foreground: resolve(foreground) }),
          ...(background === undefined
            ? {}
            : { background: resolve(background) }),
          ...(fontStyle === undefined ? {} : { fontStyle }),
        },
      }),
    ),
  };
}

/**
 * One palette as a VS Code color theme file, ready for a theme extension's
 * `themes/` folder.
 *
 * @param input - The palette to export.
 * @param variant - Which palette of the pair.
 */
export function vscodeFile(input: ExportInput, variant: Variant): ExportFile {
  const theme = vscodeTheme(input, variant);
  const content = JSON.stringify(
    { $comment: creditOf(input), ...theme },
    null,
    2,
  );
  return {
    filename: `${slugOf(input.names.palette)}-${variant}-color-theme.json`,
    mime: 'application/json',
    content: `${content}\n`,
  };
}
