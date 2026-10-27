import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generatePalette, namePalette } from '@/palette';

import { routes } from '.';

const renderAt = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('routes', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style');
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirects / to a random palette', async () => {
    const router = renderAt('/');

    expect(await screen.findByRole('heading', { level: 1 })).toBeVisible();
    expect(router.state.location.pathname).toMatch(/^\/[0-9a-f]{6}$/);
  });

  it('shows the palette of the seed in the path', async () => {
    const pair = generatePalette('#e06c75');
    if (pair === undefined) {
      throw new Error('No palette');
    }
    renderAt('/e06c75');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: namePalette(pair).palette,
      }),
    ).toBeVisible();
  });

  it('themes the page with both variants', async () => {
    renderAt('/e06c75');
    await screen.findByRole('heading', { level: 1 });

    const { style } = document.documentElement;

    expect(style.getPropertyValue('--dark-hue-1')).toBe('#e06c75');
    expect(style.getPropertyValue('--light-surface-0')).toMatch(/^#/);
  });

  it('redirects a seed spelled another way to its canonical path', async () => {
    const router = renderAt('/E06C75');

    await screen.findByRole('heading', { level: 1 });

    expect(router.state.location.pathname).toBe('/e06c75');
  });

  it('shows not found for a path that is not a seed', async () => {
    renderAt('/teal');

    expect(
      await screen.findByRole('heading', { name: 'No palette here' }),
    ).toBeVisible();
  });
});

describe('the hex field', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('changes the palette and then the path', async () => {
    const router = renderAt('/7ab4c8');
    const field = await screen.findByRole('textbox', { name: 'Hex' });

    await userEvent.clear(field);
    await userEvent.type(field, 'e06c75');

    expect(
      document.documentElement.style.getPropertyValue('--dark-hue-1'),
    ).toBe('#e06c75');
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/e06c75');
    });
  });
});

describe('the export section', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloads a file named after the palette', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:palette');
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }),
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const pair = generatePalette('#7ab4c8');
    if (pair === undefined) {
      throw new Error('No palette');
    }
    const slug = namePalette(pair).palette.toLowerCase().replace(/ /g, '-');
    renderAt('/7ab4c8');

    await userEvent.click(
      await screen.findByRole('button', { name: `${slug}.css` }),
    );

    expect(click).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(await blob.text()).toContain('--surface-0: var(');
  });
});

describe('sharing', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('copies the palette link and confirms it', async () => {
    const user = userEvent.setup();
    renderAt('/7ab4c8');

    // The hero's; the sticky bar has its own.
    const buttons = await screen.findAllByRole('button', { name: 'Copy link' });
    await user.click(buttons[0]);

    expect(await navigator.clipboard.readText()).toBe(
      `${window.location.origin}/7ab4c8`,
    );
    expect(await screen.findByText('Link copied')).toBeVisible();
  });
});
