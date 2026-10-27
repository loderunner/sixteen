import { useSyncExternalStore } from 'react';

import { type Theme } from './use-theme';

const read = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

const subscribe = (listener: () => void) => {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => {
    observer.disconnect();
  };
};

/**
 * The theme applied to the page right now, `light` or `dark`: the resolved
 * value of the preference, read from `data-theme` on `<html>`.
 */
export function useResolvedTheme(): Theme {
  return useSyncExternalStore(subscribe, read, (): Theme => 'light');
}
