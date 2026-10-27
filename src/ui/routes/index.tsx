import { Navigate, type RouteObject } from 'react-router';

import { DEFAULT_SEED, pathOfSeed } from '@/palette';

import { NotFoundPage } from './not-found-page';
import { PalettePage } from './palette-page';

/** Every route of the app: a palette is a path, `/<seed>`. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={pathOfSeed(DEFAULT_SEED)} replace />,
  },
  { path: '/:seed', element: <PalettePage /> },
  { path: '*', element: <NotFoundPage /> },
];
