import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type HighlighterCore, type ThemedToken } from 'shiki/core';
import { twMerge } from 'tailwind-merge';

import { type VSCodeTheme } from '@/exports';

import { prepareLanguage, tokenize } from './highlighter';
import { type Language } from './languages';

/** Props of `CodeEditor`. */
export type CodeEditorProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  /** The code. */
  value: string;
  /** Called with the whole code after each edit. */
  onChange: (value: string) => void;
  /** Its language. */
  language: Language;
  /** The VS Code theme to color it with. */
  theme: VSCodeTheme;
  /** Called with the caret's line and column, from 1. */
  onCaretChange?: (line: number, column: number) => void;
};

const LINE_HEIGHT = 20;
const PADDING = 12;

// Shiki's font style flags.
const ITALIC = 1;
const BOLD = 2;
const UNDERLINE = 4;

/**
 * An editable code view colored by Shiki with a VS Code theme: a transparent
 * `<textarea>` over the highlighted code, so typing, selection and undo are
 * the browser's own. Line numbers, the current line, the caret and the
 * selection take the theme's colors. `className` is merged over the wrapper's
 * classes; `ref` is the wrapper.
 */
export function CodeEditor({
  value,
  onChange,
  language,
  theme,
  onCaretChange,
  className,
  ...props
}: CodeEditorProps) {
  const [core, setCore] = useState<{ id: string; core: HighlighterCore }>();
  const [caretLine, setCaretLine] = useState(1);

  useEffect(() => {
    let current = true;
    void prepareLanguage(language).then((ready) => {
      if (current) {
        setCore({ id: language.id, core: ready });
      }
    });
    return () => {
      current = false;
    };
  }, [language]);

  const ready = core?.id === language.id ? core.core : undefined;
  const lines = useMemo(
    () =>
      ready === undefined
        ? value
            .split('\n')
            .map((content): ThemedToken[] => [{ content, offset: 0 }])
        : tokenize(ready, value, language, theme),
    [ready, value, language, theme],
  );

  const { colors } = theme;
  const longest = Math.max(...value.split('\n').map((line) => line.length));
  const gutter = `${String(lines.length).length + 2}ch`;

  const trackCaret = (textarea: HTMLTextAreaElement) => {
    const before = textarea.value.slice(0, textarea.selectionStart);
    const line = before.split('\n').length;
    const column = before.length - before.lastIndexOf('\n');
    setCaretLine(line);
    onCaretChange?.(line, column);
  };

  return (
    <div
      className={twMerge('overflow-auto font-mono text-[13px]', className)}
      style={{
        background: colors['editor.background'],
        color: colors['editor.foreground'],
        lineHeight: `${LINE_HEIGHT}px`,
      }}
      {...props}
    >
      <div
        className="relative grid min-w-max"
        style={{ gridTemplateColumns: `${gutter} 1fr` }}
      >
        <div
          aria-hidden="true"
          className="sticky left-0 z-10 pr-3 text-right select-none"
          style={{
            background: colors['editorGutter.background'],
            paddingBlock: PADDING,
          }}
        >
          {lines.map((_, index) => (
            <div
              // Lines have no identity beyond their position.
              // oxlint-disable-next-line react/no-array-index-key
              key={index}
              style={{
                color:
                  index + 1 === caretLine
                    ? colors['editorLineNumber.activeForeground']
                    : colors['editorLineNumber.foreground'],
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="relative" style={{ paddingBlock: PADDING }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: PADDING + (caretLine - 1) * LINE_HEIGHT,
              height: LINE_HEIGHT,
              background: colors['editor.lineHighlightBackground'],
            }}
          />
          <pre aria-hidden="true" className="relative m-0 pr-4 pl-1 font-mono">
            {lines.map((tokens, index) => (
              // oxlint-disable-next-line react/no-array-index-key
              <div key={index} className="min-h-5 whitespace-pre">
                {tokens.map((token) => (
                  <span key={token.offset} style={tokenStyle(token)}>
                    {token.content}
                  </span>
                ))}
              </div>
            ))}
          </pre>
          <textarea
            aria-label={`${language.name} code`}
            value={value}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            onChange={(event) => {
              onChange(event.target.value);
              trackCaret(event.target);
            }}
            onSelect={(event) => {
              trackCaret(event.currentTarget);
            }}
            className="absolute inset-0 resize-none overflow-hidden bg-transparent pr-4 pl-1 font-mono code-editor-input text-transparent outline-none"
            style={{
              paddingBlock: PADDING,
              lineHeight: `${LINE_HEIGHT}px`,
              minWidth: `${longest + 4}ch`,
              caretColor: colors['editorCursor.foreground'],
              '--selection': colors['editor.selectionBackground'],
            }}
          />
        </div>
      </div>
    </div>
  );
}

const tokenStyle = ({ color, fontStyle = 0 }: ThemedToken): CSSProperties => ({
  color,
  fontStyle: (fontStyle & ITALIC) === 0 ? undefined : 'italic',
  fontWeight: (fontStyle & BOLD) === 0 ? undefined : 600,
  textDecoration: (fontStyle & UNDERLINE) === 0 ? undefined : 'underline',
});
