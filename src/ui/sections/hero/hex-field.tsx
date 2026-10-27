import { type ComponentProps, useId, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { normalizeHex } from '@/palette';

/** Props of `HexField`. */
export type HexFieldProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  /** The current color, as `#rrggbb`. */
  value: string;
  /** Called with a valid color as `#rrggbb` as soon as one is typed. */
  onChange: (value: string) => void;
};

/**
 * A text field for a hex color. Each valid color applies as it is typed;
 * an invalid one is flagged when the field loses focus and reverts.
 * `className` is merged over the wrapper's classes; `ref` is the wrapper.
 */
export function HexField({
  value,
  onChange,
  className,
  ...props
}: HexFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value.slice(1));
  const [shown, setShown] = useState(value);
  const [invalid, setInvalid] = useState(false);

  // The color changed elsewhere (a slider, the path): show it.
  if (value !== shown) {
    setShown(value);
    if (normalizeHex(draft) !== value) {
      setDraft(value.slice(1));
      setInvalid(false);
    }
  }

  return (
    <div className={twMerge('flex flex-col gap-1', className)} {...props}>
      <label htmlFor={id} className="text-sm text-ink-0">
        Hex
      </label>
      <div
        className="flex items-center rounded-md border border-surface-3 bg-surface-1 px-2 focus-within:border-hue-1 aria-invalid:border-signal-red"
        aria-invalid={invalid}
      >
        <span aria-hidden="true" className="font-mono text-ink-0">
          #
        </span>
        <input
          id={id}
          value={draft}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent py-1.5 pl-0.5 font-mono text-ink-1 outline-none"
          onChange={(event) => {
            const text = event.target.value.replace('#', '');
            setDraft(text);
            const color = normalizeHex(text);
            setInvalid(false);
            if (color !== undefined && text.length === 6) {
              onChange(color);
            }
          }}
          onBlur={() => {
            const color = normalizeHex(draft);
            if (color === undefined) {
              setInvalid(true);
              return;
            }
            onChange(color);
            setDraft(color.slice(1));
          }}
        />
      </div>
      {invalid && (
        <p id={`${id}-error`} className="text-sm text-signal-red">
          Use 3 or 6 hex digits, like 7ab4c8.
        </p>
      )}
    </div>
  );
}
