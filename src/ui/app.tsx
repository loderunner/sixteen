import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from './routes';

const router = createBrowserRouter(routes);

/** The Nord-like SPA: one palette per path. */
export function App() {
  return <RouterProvider router={router} />;
}
