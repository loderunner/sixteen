import { Select } from '@base-ui/react/select';
import { CaretUpDownIcon, CheckIcon } from '@phosphor-icons/react';
import { useDeferredValue, useMemo, useState } from 'react';

import { vscodeTheme } from '@/exports';
import { usePalette } from '@/ui/palette';

import { CodeEditor } from './code-editor';
import { type Language, LANGUAGES } from './languages';
import { WorkbenchFrame } from './workbench-frame';

const ITEMS = Object.fromEntries(LANGUAGES.map(({ id, name }) => [id, name]));

const languageOf = (id: string): Language =>
  LANGUAGES.find((language) => language.id === id) ?? LANGUAGES[0];

/**
 * The palette's VS Code theme at work: an editable code sample in a choice of
 * languages, in a VS Code window painted by the same theme the export holds.
 */
export function EditorSection() {
  const { pair, names, variant } = usePalette();
  const [languageId, setLanguageId] = useState(LANGUAGES[0].id);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [caret, setCaret] = useState({ line: 1, column: 1 });
  // Recoloring trails the picker a little, so dragging stays smooth.
  const deferredPair = useDeferredValue(pair);
  const theme = useMemo(
    () => vscodeTheme({ pair: deferredPair, names }, variant),
    [deferredPair, names, variant],
  );

  const language = languageOf(languageId);
  const code = edits[language.id] ?? language.sample;

  return (
    <section aria-labelledby="editor" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="editor"
            className="text-3xl font-semibold tracking-tight text-ink-2"
          >
            In the editor
          </h2>
          <p className="mt-1 max-w-2xl text-ink-0">
            The exported editor theme, colored by the same grammars your editor
            uses. Edit the code to try your own.
          </p>
        </div>
        <Select.Root
          items={ITEMS}
          value={languageId}
          onValueChange={(value: string | null) => {
            if (value !== null) {
              setLanguageId(value);
            }
          }}
        >
          <Select.Label className="sr-only">Language</Select.Label>
          <Select.Trigger className="inline-flex min-h-9 min-w-40 cursor-pointer items-center justify-between gap-3 rounded-lg border border-surface-2 bg-surface-1 px-3 text-sm text-ink-1 hover:bg-surface-2">
            <Select.Value />
            <Select.Icon>
              <CaretUpDownIcon className="size-4" aria-hidden="true" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={6} className="z-20">
              <Select.Popup className="max-h-(--available-height) overflow-y-auto rounded-lg border border-surface-2 bg-surface-1 py-1 text-sm text-ink-1 shadow-lg">
                {LANGUAGES.map(({ id, name }) => (
                  <Select.Item
                    key={id}
                    value={id}
                    className="flex cursor-pointer items-center gap-2 py-1.5 pr-4 pl-2 outline-none data-highlighted:bg-surface-2"
                  >
                    <Select.ItemIndicator className="w-4">
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </Select.ItemIndicator>
                    <Select.ItemText className="col-start-2">
                      {name}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </div>
      <WorkbenchFrame
        theme={theme}
        file={language.file}
        language={language.name}
        caret={caret}
        className="h-136"
      >
        <CodeEditor
          value={code}
          onChange={(next) => {
            setEdits((previous) => ({ ...previous, [language.id]: next }));
          }}
          language={language}
          theme={theme}
          onCaretChange={(line, column) => {
            setCaret({ line, column });
          }}
          className="h-full"
        />
      </WorkbenchFrame>
    </section>
  );
}
