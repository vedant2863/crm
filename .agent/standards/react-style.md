# React Style Guidelines

- **Component Division:** Mark client-interactive components with `"use client"` at the top. Server components should contain data-fetching and database queries.
- **Props Typing:** Declare interfaces for component properties. Avoid implicit any. Use `React.ReactNode` for elements/children.
- **Hooks Conventions:** Domain-specific hooks live in `src/features/<domain>/hooks/`. Use stable dependencies inside dependency arrays (e.g. wrap callback functions in `useCallback` or `useMemo`).
- **Pagination & Search Hooks:** Re-use common hooks like `usePaginated` and `useDebounce` to manage grid lists.
- **Hot-Toast:** Call `toast.success` / `toast.error` from `react-hot-toast` to render standard operations feedback.
