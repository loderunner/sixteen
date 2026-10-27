import { Toast } from '@base-ui/react/toast';
import { useState } from 'react';
import { Navigate, Outlet, type RouteObject } from 'react-router';

import { pathOfSeed, randomSeed } from '@/palette';
import { Toasts } from '@/ui/components/toasts';
import { useResolvedTheme } from '@/ui/theme';

import { NotFoundPage } from './not-found-page';
import { PalettePage } from './palette-page';

/**
 * Every route of the app: a palette is a path, `/<seed>` or
 * `/<variant>/<seed>`; `/` picks one.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <RandomPalette /> },
      { path: '/:variant?/:seed', element: <PalettePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

/** Every page: the routed content, and the toasts over it. */
function RootLayout() {
  return (
    <Toast.Provider>
      <Outlet />
      <Toasts />
    </Toast.Provider>
  );
}

/**
 * Sends a visit without a seed to a new random palette, whose seed sits in the
 * variant the page shows.
 */
function RandomPalette() {
  const theme = useResolvedTheme();
  // Drawn once, so a re-render before the redirect keeps the same seed.
  const [seed] = useState(() => randomSeed(theme));
  return <Navigate to={pathOfSeed(seed)} replace />;
}
