import { Link } from 'react-router';

import { DEFAULT_SEED, pathOfSeed } from '@/palette';

/** Shown for any path that is not a palette. */
export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-2">
        No palette here
      </h1>
      <p className="text-ink-0">
        A palette&apos;s address is its seed color in hex, like{' '}
        <code className="font-mono">/7ab4c8</code>.
      </p>
      <p>
        <Link to={pathOfSeed(DEFAULT_SEED)}>Open the default palette</Link>
      </p>
    </main>
  );
}
