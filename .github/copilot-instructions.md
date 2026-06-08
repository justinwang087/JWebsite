# Copilot instructions for this repository

This repository hosts a small static personal website (plain HTML, CSS, and vanilla JavaScript) under the `public/` directory. Use these notes to help Copilot sessions act efficiently in this repo.

1) Build / preview
- No build step required. Open `public/index.html` in a browser to preview locally.
- For a simple quick preview from the command line (if you have Python 3):
  - python -m http.server --directory public 8000
  - Then visit http://localhost:8000

2) Tests & Lint
- There are no automated tests or linters configured in this repository. Add tooling if desired.
- To run a single page check, open the page in a browser and use browser devtools (console, accessibility, and network panels).

3) High-level architecture
- public/
  - index.html — Home / Hero / Interests
  - about.html — Longer about page and anecdotes
  - projects.html — Placeholder project cards
  - assets/css/style.css — All styles; responsive and dark-theme-first
  - assets/js/main.js — Minimal JS: canvas background and small interactivity
- .github/workflows/gh-pages.yml — GitHub Actions workflow that publishes `public/` to GitHub Pages on pushes to `main`.

4) Key conventions and patterns
- Static-first: Keep all site sources in `public/` so the deploy workflow is simple.
- Small JS footprint: The site uses a single `main.js` that handles only the background canvas and minimal UI hooks. Avoid adding heavy libs.
- Tooltips: Use the `data-tooltip` attribute and `.hint` class for small hover anecdotes — Copilot should reuse this pattern for inline notes.
- Accessibility: Respect `prefers-reduced-motion` for motion-sensitive features; keep content readable without JS.

5) Where to customize
- Replace placeholder links (GitHub, email) in the pages and README.
- Add project details in `projects.html` by editing the `.project` cards.

6) Files to inspect for changes
- public/index.html
- public/about.html
- public/projects.html
- public/assets/css/style.css
- public/assets/js/main.js
- .github/workflows/gh-pages.yml

When making changes, prefer small, surgical edits and verify the site by opening the modified HTML locally. Commit messages should be concise and describe what changed.
