import { Toast } from '@base-ui/react/toast';
import { Navigate, Outlet, type RouteObject } from 'react-router';

import { DEFAULT_SEED, pathOfSeed } from '@/palette';
import { Toasts } from '@/ui/components/toasts';

import { NotFoundPage } from './not-found-page';
import { PalettePage } from './palette-page';

/** Every route of the app: a palette is a path, `/<seed>`. */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to={pathOfSeed(DEFAULT_SEED)} replace />,
      },
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
