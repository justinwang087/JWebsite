# Copilot Instructions for JWebsite

This repository hosts a personal static website built with vanilla HTML, CSS, and JavaScript.

## Build, Test, and Preview

**No build step required.** The site is entirely static.

- **Local preview:** Open `index.html` in a browser, or run `python -m http.server 8000` from the repo root and visit `http://localhost:8000`
- **Deploy:** Push to `main` — GitHub Actions (`.github/workflows/gh-pages.yml`) automatically publishes the entire repository root to GitHub Pages

There are no automated tests or linters configured. Manual checks via browser DevTools (console, accessibility, and network panels) are sufficient.

## High-Level Architecture

**File Structure:**
- `index.html` — Home page with hero section, about preview, and interests
- `about.html` — Extended biography and anecdotes
- `projects.html` — Project showcase (currently placeholder cards)
- `assets/css/style.css` — All styles; responsive, dark-theme-first, CSS variables for theming
- `assets/js/main.js` — Two independent canvas systems:
  1. **Background canvas** (`#bg-canvas`) — Full-screen animated particle system with mouse interactivity and physics
  2. **Geometric button animations** — Rotating 2D/3D shapes that appear when buttons scroll into view
- `assets/images/` — SVG icons (GitHub, email)

**Deployment:**
- GitHub Actions workflow (`.github/workflows/gh-pages.yml`) publishes everything in the repo root to GitHub Pages on pushes to `main`

## Key Canvas Systems

### Background Particle System
- Fixed full-screen canvas (`#bg-canvas`) at z-index 0 behind all content
- Spawns ~60 particles that drift, bounce off edges, and connect via lines
- **Mouse interaction:** Particles are attracted to cursor within 160px radius (smoother motion, not sudden snapping)
- **Reduced motion:** When `prefers-reduced-motion` is detected, switches to a static field of faint dots
- All geometry calculations include global alpha blending for subtle transparency
- Logs initialization and errors to console with `[main.js]` prefix

### Geometric Button Animations
- Each `.geom-btn` element contains an embedded canvas that renders rotating geometric shapes
- **Lazy initialization:** Shapes are created and animated only when a button scrolls into view (IntersectionObserver)
- **Text scramble animation:** Before revealing the button label, each character randomly shifts through special characters, then resolves to the final text
- **Four shape templates:** star (5-sided), frame (4-sided), complex (6-sided), tesseract (8-sided)
  - Each shape is randomly selected and mutated with variations in radius, rotation speed, and alpha
  - Shapes layer and rotate independently; proximity to cursor accelerates rotation
- **Also respects reduced motion** — skips animation if user preference detected
- Logs initialization details to console with `[geom]` prefix

## Key Conventions and Patterns

### Styling
- **CSS variables** (`:root`) define the theme: `--bg` (background), `--accent` (teal), `--muted` (light grey), `--glass` (transparency), `--max-width`
- **Dark-theme-first:** Near-black backgrounds with light grey text
- **Responsive grids:** Cards use `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`
- Single serif font (`Lora`) for all text

### Accessibility
- All decorative canvases have `aria-hidden="true"`
- Use semantic HTML (`<article>`, `<section>`, `<header>`, `<footer>`)
- Buttons are `.geom-btn` wrappers around `.geom-shape` (canvas) and `.geom-label` (text)
- Motion-sensitive features use `@media (prefers-reduced-motion: reduce)`

### Tooltips and Anecdotes
- Use `<span class="anecdote" data-tooltip="Hover text here">word</span>` for inline hints
- `.anecdote` class provides underline and cursor feedback (no JS required)
- Kept in HTML; no external framework

### Naming
- Canvas IDs: `#bg-canvas` (background), `.geom-canvas` (button shapes)
- Button classes: `.geom-btn`, `.geom-shape`, `.geom-label`, `.btn-back` (for back buttons on subpages)
- Sections: Semantic HTML tags with optional `.card` class for visual styling

### Console Debugging
- Events prefixed with `[main.js]` and `[geom]` for easy filtering
- Logs particle counts, device pixel ratio (DPR), shape initialization, and errors
- Inline diagnostics in `index.html` test that `main.js` is reachable (safe to remove if not needed)

## Files to Inspect When Making Changes

- **Page content:** `.html` files (index, about, projects)
- **Styling:** `assets/css/style.css` — use CSS variables for colors/spacing
- **Interactivity:** `assets/js/main.js` — particle physics and geometric animations
- **Deployment:** `.github/workflows/gh-pages.yml`

## Guidelines for New Features

1. **New sections/pages:** Create an `.html` file; include header nav, footer, and `<script src="assets/js/main.js" defer></script>` at the bottom
2. **Styling:** Add rules to `assets/css/style.css`; leverage CSS variables for consistency
3. **Canvas effects:** Extend `main.js` following existing patterns (self-contained IIFE functions); keep animations lightweight
4. **Keep static-first:** No frameworks; no external JS libraries. All sources live in the repository root for simplicity
5. **Content updates:** Replace placeholders in `.html` files (e.g., project cards in `projects.html`)

When making changes, prefer small, surgical edits and verify locally by opening the HTML files in a browser. Use browser DevTools to check console logs and verify animations run smoothly.
