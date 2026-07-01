# Tailwind CSS Style Guidelines

- **Utility Ordering:** Order classes consistently:
  `Layout` → `Flex/Grid` → `Spacing` → `Sizing` → `Typography` → `Background` → `Border` → `Effects` → `Animation` → `Responsive` → `State`
  
  *Example:*
  ```html
  <button className="inline-flex items-center justify-center px-4 py-2 w-full text-sm font-medium text-white bg-primary rounded-xl shadow hover:bg-primary/95 transition-all duration-300 focus:ring-2">
    Save Contact
  </button>
  ```
- **Responsive Classes:** Always apply responsive modifiers starting from smallest to largest (`w-full sm:w-1/2 md:w-1/3 lg:w-1/4`).
- **State Grouping:** Keep state modifiers grouped together at the end of classes (e.g. `focus:border-primary focus:ring-2 disabled:opacity-50`).
- **Premium Aesthetics:** Enforce glassmorphic UI patterns (`backdrop-blur-md bg-card/45 border border-border/50 shadow-xl`) to align with the application design system.
