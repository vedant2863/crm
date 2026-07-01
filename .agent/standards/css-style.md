# CSS Style Guidelines

- **Tailwind-First:** Prefer Tailwind utility classes. Use custom CSS only when Tailwind utilities are insufficient.
- **Naming Convention:** Use BEM naming conventions for custom classes (e.g. `.card`, `.card__title`, `.card--active`).
- **Grouping Properties:** Group custom CSS properties by category and place one property per line:
  ```css
  .custom-element {
    /* Layout */
    display: flex;
    flex-direction: column;
    
    /* Spacing & Size */
    margin: 1rem 0;
    padding: 1.5rem;
    width: 100%;
    
    /* Aesthetics */
    background-color: var(--card-bg);
    border-radius: var(--radius);
  }
  ```
- **CSS Variables:** Define design tokens under `:root` and read them with `var(...)`.
- **Indentation:** 2-space indentation.
- **Avoid Overrides:** Do not use `!important` unless strictly required for third-party widget overwrites.
