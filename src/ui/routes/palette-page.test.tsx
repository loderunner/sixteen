import { render, screen } from '@testing-library/react';
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

  it('redirects / to the default palette', async () => {
    const router = renderAt('/');

    expect(await screen.findByRole('heading', { level: 1 })).toBeVisible();
    expect(router.state.location.pathname).toBe('/7ab4c8');
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
