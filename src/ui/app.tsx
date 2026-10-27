import { ThemeToggle } from './theme';

/** The Nord-like SPA. */
export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-2">
          Nord-like
        </h1>
        <ThemeToggle />
      </header>
      <p className="text-ink-0">
        Pick a color, get a 16-swatch palette in Nord&apos;s structure.
      </p>
    </main>
  );
}
