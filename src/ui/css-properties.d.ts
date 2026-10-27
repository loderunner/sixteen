import 'react';

declare module 'react' {
  /** Lets `style` set CSS custom properties, like `{ '--selection': '#fff' }`. */
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
