# UI Patterns

## Glassmorphic Styling
The visual identity of CRM OS relies on clean glassmorphism:
- Classes: `backdrop-blur-md bg-card/45 border border-border/50 shadow-xl`
- Textures: Smooth gradients and glowing blobs mapped behind cards using absolute overlays (`pointer-events-none absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl`).
- Dynamic Hover Animations: Transitions for buttons and list items to improve responsiveness.

## Layout Grids
- **(auth):** Onboarding screens use center-aligned cards on a dark backdrop layout.
- **(main):** Main console uses a top navigation bar (Navbar) and responsive sidebar list containers.
- **Dashboards:** Widgets render in grid lists with Recharts visualizer charts.
