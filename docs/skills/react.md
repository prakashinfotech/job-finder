---

name: react-production-react19
description: Industry-grade playbook for building React 19 applications with Zustand for state, Actions, Server Components compatibility, modern hooks, TypeScript, and production patterns. Use this skill whenever the user is writing, reviewing, refactoring, or debugging React 19 code — including components, custom hooks, state stores, forms, server actions, performance optimizations, suspense/error boundaries, data fetching, or project structure.
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# React 19 + Zustand Production Playbook

Opinionated, production-grade patterns for React 19+. Priorities: **correctness first, readability second, performance third**.

---

# 0. Core Principles

1. **Derive, don't duplicate.**
2. **One source of truth** per state domain.
3. **Effects synchronize external systems only.**
4. **Actions replace boilerplate form/event async state.**
5. **Server Components by default where supported (Next.js/App Router).**
6. **Refs are standard props** (`forwardRef` is deprecated for most app code).
7. **Type everything.**
8. **Prefer compiler-friendly pure components.**

---

# 1. What's New in React 19

## Major Additions

| Feature                   | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `Actions`                 | Async transitions with built-in pending/error handling |
| `useActionState`          | Form + async mutation state management                 |
| `useFormStatus`           | Native form pending states                             |
| `useOptimistic`           | Optimistic UI updates                                  |
| `ref as prop`             | `forwardRef` often unnecessary                         |
| Document metadata support | Native `<title>`, `<meta>` management                  |
| Improved Suspense         | Better async rendering                                 |
| React Compiler readiness  | Auto memoization support                               |

---

## Standard Root API

```tsx
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(<App />);
```

`StrictMode` remains recommended in development.

---

# 2. New React 19 Hooks

## `useActionState`

Best for forms or async mutations:

```tsx
const [state, submitAction, isPending] = useActionState(
  async (_prevState, formData) => {
    const res = await createUser(formData);
    return res;
  },
  initialState
);
```

### Use when:

* Forms
* Mutations
* Async submissions
* Server actions

---

## `useOptimistic`

```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (state, newTodo) => [...state, newTodo]
);
```

### Use when:

* Instant UI before server confirmation
* Chat apps
* Task creation
* Likes/votes

---

## `useFormStatus`

```tsx
const { pending } = useFormStatus();
```

Perfect for submit buttons inside forms.

---

# 3. Forms in React 19

## Recommended Default

**Native forms + Actions first**

```tsx
<form action={submitAction}>
  <input name="email" />
  <SubmitButton />
</form>
```

## When to still use RHF + Zod

* Complex enterprise validation
* Dynamic field arrays
* Multi-step forms
* Large dashboards

---

# 4. Ref Changes

## Old:

```tsx
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
```

## React 19:

```tsx
type Props = {
  ref?: React.Ref<HTMLInputElement>;
};

function Input(props: Props) {
  return <input {...props} />;
}
```

### Guidance:

* Existing `forwardRef` still works
* New code should prefer direct `ref`
* Cleaner typing

---

# 5. Zustand in React 19

Zustand remains ideal for:

* Auth
* Theme
* Client-only state
* Dashboard UI state
* Cross-page interactions

## Updated Rule:

**Do NOT use Zustand for server data** — use:

* Server Components
* TanStack Query
* Actions
* Route loaders

---

## Store Pattern

```tsx
export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

---

# 6. Performance in React 19

## React Compiler Era

React Compiler may reduce manual need for:

* `useMemo`
* `useCallback`
* `React.memo`

### New Rule:

Write pure code first.
Optimize manually only when:

* External libs require stable refs
* Profiling proves bottlenecks
* Large virtualization cases

---

## Priority Order

1. Server Components
2. Code splitting
3. Suspense boundaries
4. Pure components
5. Compiler optimization
6. Manual memoization

---

# 7. Server Components (Important)

## Default guidance:

### Use Server Components for:

* Data fetching
* SEO pages
* Dashboards
* Static layouts
* Product listings

### Use Client Components for:

* Zustand
* Event handlers
* Browser APIs
* Interactive UI

---

## Rule:

```tsx
'use client';
```

Only where necessary.

Less client JS = better performance.

---

# 8. Suspense + Async UX

React 19 improves async rendering.

## Pattern:

```tsx
<Suspense fallback={<Skeleton />}>
  <Products />
</Suspense>
```

## Combine with:

* `useOptimistic`
* `useActionState`
* Server Components
* Streaming SSR

---

# 9. TypeScript Best Practices

## Continue:

* No `React.FC`
* Use explicit prop types
* `React.ReactNode` for children
* `ComponentProps<'button'>`
* `satisfies` for strict object validation

---

# 10. Recommended Stack (React 19)

## Best Production Stack:

* **Framework:** Next.js 15+
* **Language:** TypeScript 5+
* **State:** Zustand
* **Server State:** TanStack Query / Actions
* **Forms:** Native Actions or RHF + Zod
* **Styling:** Tailwind CSS 4
* **UI:** shadcn/ui + Radix
* **Auth:** Clerk / Auth.js
* **DB:** PostgreSQL + Prisma
* **Testing:** Vitest + Playwright
* **Lint:** ESLint + Prettier

---

# 11. Anti-Patterns (React 19)

## Reject:

* Fetching in `useEffect` when Server Components can do it
* Overusing Zustand for server state
* Manual loading states instead of Actions
* `forwardRef` for new components
* Excessive `useMemo/useCallback`
* Large client bundles
* Missing Suspense boundaries
* Treating all components as client components

---

# 12. Migration Checklist (18 → 19)

* [ ] Upgrade `react` and `react-dom`
* [ ] Replace heavy form state with `useActionState`
* [ ] Add `useOptimistic` where useful
* [ ] Reduce unnecessary `forwardRef`
* [ ] Audit `useEffect` data fetching
* [ ] Shift fetches to Server Components
* [ ] Reassess memoization
* [ ] Improve Suspense boundaries
* [ ] Validate third-party library compatibility
* [ ] Enable compiler when stable

---

# 13. Mental Model

## React 19:

### Server-first

* Fetch on server
* Stream UI
* Minimize JS

### Client-only when needed

* Zustand
* Events
* Browser APIs

### Async UX built-in

* Actions
* Optimistic updates
* Native forms

---

# Final Philosophy

**React 19 favors simpler code:**

* Less boilerplate
* Fewer effects
* Better forms
* Native async flows
* Smaller bundles
* Better UX

## Golden Rule:

**Server where possible. Client where necessary. Effects rarely. Actions often.**
