import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom lays nothing out, so it has no ResizeObserver or IntersectionObserver:
// observers that never fire. Not `vi.stubGlobal`: tests that unstub their own
// globals would remove them.
class InertObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
for (const name of ['ResizeObserver', 'IntersectionObserver']) {
  if (!(name in globalThis)) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: InertObserver,
    });
  }
}
