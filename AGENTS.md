# Sixteen

Sixteen generates a 16-color palette from any color the user picks, in the
structure of the [Nord](https://www.nordtheme.com/docs/colors-and-palettes)
palette: 4 background neutrals, 3 foreground neutrals, 4 accents in the seed's
hue and 5 accents out of it. It never reuses Nord's colors, only its
proportions. Each palette comes as a tuned dark and light pair, gets a name and
group names from one metaphor, is previewed (components, terminal, code editor),
exports to 7 formats and is shared by its path (`/7ab4c8`).

---

# Tech stack

| Concern         | Choice                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Shape           | Client-only **Vite + React 19 + TypeScript SPA**. No backend, no SSR                                  |
| Routing         | **React Router** as a library (declarative mode). The palette is the path: `/:seed`                   |
| Color math      | `culori` (OKLCH/OKLab, CSS Color 4 gamut mapping, ΔE, contrast), imported from `culori/fn`            |
| Color names     | `color-name-list` (`bestof`), loaded lazily                                                           |
| Code preview    | **Shiki** (`shiki/core`, JavaScript regex engine) over a `<textarea>`; no Monaco                      |
| Styling         | Tailwind CSS v4 (`@tailwindcss/vite`) utility classes, role tokens in `src/ui/styles.css`             |
| UI primitives   | **Base UI** (`@base-ui/react`) for menus, selects, sliders, tabs, toasts, …                           |
| Icons and fonts | `@phosphor-icons/react`; `@fontsource/geist` and `@fontsource/geist-mono` (bundled, works offline)    |
| Package manager | pnpm — always use `pnpm add`/`pnpm remove`, never edit dependencies in `package.json`. Exact versions |
| Test runner     | Vitest (projects: `core` = node for `palette` and `exports`, `ui` = jsdom)                            |
| Formatter       | oxfmt — `pnpm format:fix` (or `pnpm fix` to format and lint together)                                 |
| Lint            | oxlint (type-aware via `oxlint-tsgolint`) — `pnpm lint`                                               |
| Typecheck       | TypeScript 7, `tsc -b` over `tsconfig.core.json`, `tsconfig.ui.json` and `tsconfig.node.json`         |
| Node            | `.nvmrc`; `engines.node` is `>=24`                                                                    |

TypeScript 7 ships no editor plugin API. Install the dedicated **TypeScript 7**
extension (`TypeScriptTeam.native-preview`, recommended in
`.vscode/extensions.json`) for editor language support.

## Rules agents tend to break

- **Never use any TanStack package.** Routing goes through React Router.
- **No shadcn.** Interactive primitives come from Base UI, styled with Tailwind
  utility classes inline. No component library on top.
- **No Next.js, no React Router framework mode, no SSR.** The app is static
  files.
- **No Monaco.** The editor is Shiki-rendered so the preview is the exported VS
  Code theme.
- **Never reuse Nord's colors.** Nord's structure and proportions inform the
  generator's rules; its hex values never appear in source or tests.
- `src/palette/**` imports nothing local. `src/exports/**` imports only
  `src/palette/`. `src/ui/**` may import both. The oxlint config enforces this.
- Every color the UI paints is one of the 16 swatches, through the role tokens
  (`surface-*`, `ink-*`, `hue-*`, `signal-*`), optionally with alpha. Exported
  themes follow the same rule.

---

# CI philosophy

1. CI calls `package.json` scripts and may only extend them with flags. If a
   check needs different behavior, change the script, not the workflow.
2. Pull request titles must be Conventional Commits (`pr-title.yml`).
3. Before every commit, `pnpm format`, `pnpm lint`, `pnpm typecheck`,
   `pnpm test` and `pnpm build` pass. Commit each small shippable increment as
   soon as it is ready.

---

# Architecture

## Code layout

```
src/
  palette/      pure, no DOM: color helpers, seed classification, generation,
                names, path codec
  exports/      pure: one module per export format, plus the shared role maps
  ui/
    index.html, main.tsx, app.tsx, styles.css
    theme/      dark/light/system preference (which variant the page shows)
    components/ shared only when used by 2+ unrelated sections
    sections/   one directory per page section; components colocated
```

## Palette state

- The seed is the canonical state and lives in the path (`/7ab4c8`). The
  generator is deterministic: a path always means the same palette. Golden tests
  pin generator output; an intentional change needs a new path version prefix
  (`/v2/…`), with unversioned paths keeping their meaning.
- A color picked on screen is picked for the variant the page shows, which holds
  it when one of its slots fits. When that moves the seed out of its usual
  variant, the path says so (`/light/2a0040`); otherwise it stays `/2a0040`.
- The app writes both variants as `--dark-*` and `--light-*` custom properties
  on `<html>`; `data-theme` selects one. Switching the theme never re-renders.

## Multi-file modules export through a barrel

When a module spans multiple files, expose its public API through a single
barrel (`index.ts`). Consumers import from the module directory, not from
internal files. The barrel re-exports only the public contract.

## File colocation in `src/ui/sections/`

Section-specific components and hooks live directly in the section directory —
no `_components/` subdirectory. Move a file to `src/ui/components/` only when
two or more unrelated sections use it.

## Testing

Tests live alongside the source files they exercise: `src/palette/foo.ts` has
its tests in `src/palette/foo.test.ts`.

- **Unit tests** test a single module in isolation. Mock imports from outside
  the module under test with `vi.mock()` when they get in the way; pure
  `palette` and `exports` code rarely needs mocks.
- Prefer **property tests over a grid of seeds** for the generator, plus golden
  outputs for a few fixed seeds.

---

# Coding standards

## Guiding principle

> Clear is better than clever.
>
> — Rob Pike, Go Proverbs

## Naming conventions

### Boolean variables

Use adjective-based names for `boolean` variables, not verb-based.

```ts
// correct
const hidden = true;
const outdated = false;
const closing = true;

// incorrect
const isHidden = true;
const shouldUpdate = false;
const willClose = true;
```

### Acronyms in camelCase and PascalCase

Put acronyms in all uppercase, except when the acronym starts a camelCase name.

```ts
// camelCase
(url, urlError, handleURL, encodeURLComponent, jsonSchema, parseYAML);

// PascalCase
(URL, URLHandler, EncryptedURL, JSONSchema, YAMLParser);

// incorrect
(handleUrl, createUrlHandler, JsonSchema, YamlParser);
```

## Functions

### Closures

When defining a closure inside a function body, prefer assigning an arrow
function to a `const` variable over a nested `function` declaration.

An inline arrow callback is fine when the whole callback is three lines or fewer
(counting the line that contains `=>` and any continuation lines), for example
in `filter`, `map`, `reduce`, or Vitest `expect` helpers. If it grows past that,
assign it to a `const` (or extract a named function) instead of inlining.

```ts
// correct — short enough to inline
function processItems(items: string[]) {
  return items.map((item: string) => item.trim().toLowerCase());
}

// correct — named when you want a stable reference or clearer call site
function processItems(items: string[]) {
  const format = (item: string) => item.trim().toLowerCase();
  return items.map(format);
}

// incorrect — nested function declaration
function processItems(items: string[]) {
  function format(item: string) {
    return item.trim().toLowerCase();
  }
  return items.map(format);
}
```

### Arguments & return types

When a function takes or returns an object, define it as a named type rather
than inlining the shape at the call site. Named types are easier to document,
reuse, and refactor.

```ts
// correct
type CreateUserParams = {
  name: string;
  email: string;
  role: "admin" | "student";
};

type CreateUserResult = {
  id: string;
  createdAt: Date;
};

function createUser(params: CreateUserParams): CreateUserResult { ... }

// incorrect
function createUser(params: {
  name: string;
  email: string;
  role: "admin" | "student";
}): { id: string; createdAt: Date } { ... }
```

Destructure object parameters in the function signature, not the body.

```ts
// correct
function createUser({ name, email, role }: CreateUserParams): CreateUserResult { ... }

// incorrect
function createUser(params: CreateUserParams): CreateUserResult {
  const { name, email, role } = params;
  ...
}
```

## Component composition

When a component accepts content that ends up in the DOM, accept it as
**children** (or as a named-slot subcomponent), not as a string prop. String
props that render into DOM elements are a leaky interface — the parent ends up
reaching across the primitive to customize a grandchild's text, icon, or class.

```tsx
// incorrect — leaky string props
<Button label="Start journey" icon={ArrowRightIcon} onClick={…} />
<Header title="Limits and continuity" />

// correct — children-based composition
<Button onClick={…}>
  <ArrowRightIcon size={15} weight="bold" />
  {t('startJourney')}
</Button>

<ChatPageShell.Header>
  <Title>{chapter.title}</Title>
</ChatPageShell.Header>
```

When composition gets complex enough to warrant explicit slots, use the
**named-slot subcomponent pattern**:

```tsx
<Shell>
  <Shell.Header>…</Shell.Header>
  <Shell.Sidebar>…</Shell.Sidebar>
  <Shell.Content>…</Shell.Content>
</Shell>
```

Slots are exposed as static properties on the parent (e.g.
`Shell.Header = function ShellHeader(…)`), and the parent inspects its children
— or simply renders the subcomponents in fixed positions — to lay them out.

Data-driven props are still fine where the content is intrinsically structured
(e.g. a list of chapters, a table of rows). Rendering each item via `children`
would push every caller into hand-rolling the same item markup, which is the
duplication this rule exists to prevent.

## Reusable components

Every reusable component (anything in `src/ui/components/`) must:

- accept `className` and merge it into the top-level element's classes with
  `twMerge` (from `tailwind-merge`), the caller's classes last so they win;
- accept `ref` and forward it to the top-level element. React 19 passes `ref` as
  a regular prop, so extend `ComponentProps<'tag'>` and spread the rest onto the
  element; no `forwardRef`.

## Type narrowing

Do not cast with `as`. Use type predicates (`value is Foo`) or type assertion
functions (`asserts value is Foo`) instead.

## Types and definitions

Do not create `types.ts` files. Define types close to their point of usage.

## Project structure

Organize files around feature concerns, not code categories. Prefer directories
named after what the code _does_ (`auth/`, `billing/`) over what it _is_
(`components/`, `hooks/`, `adapters/`).

### Source directory boundary

No source files live outside `src/`. Config and setup files (`*.config.ts`,
`vitest.setup.ui.ts`, `oxlint-plugin.ts`, etc.) may remain at the repository
root, but all application source belongs under `src/palette/`, `src/exports/` or
`src/ui/`.

## Documentation

Document exported TypeScript symbols with JSDoc. Document properties
individually on object types. Document function parameters. Add examples where
useful. Do not document unexported symbols.

## JSX

Keep JSX clean. Inline JavaScript is fine for simple expressions — string
interpolation, short ternaries, mapping a list to simple elements. When the
logic gets heavy, pull it out.

Two signals that logic belongs outside the JSX:

- It would span more than ~5 lines inside the expression.
- It produces nested component structure (conditionally rendered subtrees, lists
  of lists, etc.).

In those cases, extract a named `const` above the `return`, or a separate
component.

```tsx
// ✅ simple interpolation — fine inline
<p>Hello, {user.name}</p>

// ✅ short ternary — fine inline
<button>{loading ? 'Loading...' : 'Submit'}</button>

// ✅ list of simple elements — fine inline
<ul>
  {items.map((item) => (
    <li key={item.id}>{item.label}</li>
  ))}
</ul>

// ❌ conditional subtree with nesting — extract it
<div>
  {user.role === "admin" ? (
    <div>
      <h2>Admin panel</h2>
      <p>{user.email}</p>
      <button onClick={handleRevoke}>Revoke access</button>
    </div>
  ) : (
    <div>
      <h2>Member</h2>
      <p>{user.email}</p>
    </div>
  )}
</div>

// ✅ extracted — readable
const panel =
  user.role === "admin" ? (
    <AdminPanel email={user.email} onRevoke={handleRevoke} />
  ) : (
    <MemberPanel email={user.email} />
  );

return <div>{panel}</div>;
```

## CSS

Do not use `!important`.

## Icons

Size Phosphor icons with Tailwind `size-*` classes in `className`, never with
the numeric `size` prop.

```tsx
// correct
<TrashIcon className="size-4" aria-hidden="true" />

// incorrect
<TrashIcon size={16} aria-hidden="true" />
```

## Logging

Log levels:

- `error` — something went wrong, the program could not function correctly
- `warning` — functioned as expected, but something warrants attention
- `info` — the program did something as expected
- `debug` — extra detail, or "the program is about to do something"

Never emit an `error`-level log and then rethrow. Either handle the error or
throw it — not both. Logging before rethrowing causes duplicate log lines for
the same error and false positives when errors are caught higher in the stack.

## Testing

### Test structure

Group tests by exported symbol, then by method or scenario, using nested
`describe` blocks. Each `it` block must be fully independent — no test may rely
on state left behind by a sibling.

```ts
describe('UserService', () => {
  describe('createUser', () => {
    it('creates a user with valid input', async () => { ... });
    it('throws when email is already taken', async () => { ... });
  });

  describe('deleteUser', () => {
    it('deletes an existing user', async () => { ... });
  });
});
```

Use `beforeEach` to produce a fresh instance or mock for every test. Use
`beforeAll`/`afterAll` only for expensive shared resources that are genuinely
read-only within the suite (e.g. a started server).

### Mocking in unit tests

Declare all `vi.mock()` calls at the top of the file, after all imports. Extract
mocked exports into named `const mock*` variables with `vi.mocked()`, then call
mock function methods on those variables. Prefer this over returning a mock
object from the `vi.mock` factory — it keeps setup close to the test and avoids
hidden state.

```ts
import { send } from './mailer';

vi.mock('./mailer');

const mockSend = vi.mocked(send);

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a welcome email on creation', async () => {
    mockSend.mockResolvedValueOnce({ messageId: 'abc' });

    await new UserService().createUser('a@b.com');

    expect(mockSend).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ to: 'a@b.com' }),
    );
  });
});
```

Rules:

plain objects or functions.

- Extract mocked exports into `const mock*` variables with `vi.mocked()`; prefer
  calling mock function methods on those over returning a mock object from the
  `vi.mock` factory.
- Name mock variables with a `mock` prefix: `mockDB`, `mockClient`, `mockUser`.
- Call `vi.clearAllMocks()` in `beforeEach` to prevent state bleed between
  tests.
- Use `vi.useFakeTimers()` / `vi.useRealTimers()` in `beforeAll`/`afterAll` when
  the module under test uses `Date`, `setTimeout`, or `setInterval`.

### Assertions

Use `expect` from Vitest. Prefer the most specific matcher available — it
produces a better failure message than a generic `toBe(true)`.

```ts
// correct
expect(result).toEqual({ id: 1, name: 'Dan' });
expect(fn).toHaveBeenCalledExactlyOnceWith('arg');
await expect(promise).rejects.toThrow('error message');
expect(items).toHaveLength(3);
expect(str).toContain('substring');

// incorrect — prefer specific matchers
expect(result !== null).toBe(true);
expect(fn.mock.calls.length).toBe(1);
```

## Git

Keep commit messages to a single line, maximum 80 characters.
