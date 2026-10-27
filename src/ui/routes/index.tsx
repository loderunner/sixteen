import { Toast } from '@base-ui/react/toast';
import { useState } from 'react';
import { Navigate, Outlet, type RouteObject } from 'react-router';

import { pathOfSeed, randomSeed } from '@/palette';
import { Toasts } from '@/ui/components/toasts';

import { NotFoundPage } from './not-found-page';
import { PalettePage } from './palette-page';

/** Every route of the app: a palette is a path, `/<seed>`; `/` picks one. */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <RandomPalette /> },
      { path: '/:seed', element: <PalettePage /> },
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

/** Sends a visit without a seed to a new random palette. */
function RandomPalette() {
  // Drawn once, so a re-render before the redirect keeps the same seed.
  const [seed] = useState(randomSeed);
  return <Navigate to={pathOfSeed(seed)} replace />;
}
