import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from './routes';

// The build's base path (`vite build --base`), so the app works when served
// from a sub-path, like a GitHub Pages project site.
const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

/** The Sixteen SPA: one palette per path. */
export function App() {
  return <RouterProvider router={router} />;
}
