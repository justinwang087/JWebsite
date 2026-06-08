Justin's personal site — static HTML/CSS/JS

Structure:
- public/: contains the static site (index.html, about.html, projects.html)
- public/assets/css/style.css
- public/assets/js/main.js

To preview locally: open public/index.html in a browser.
To publish: push to main — GitHub Actions will deploy the contents of /public to GitHub Pages via the workflow in .github/workflows/gh-pages.yml.

Notes:
- No frameworks used. Keep edits in public/ and assets/.
- Replace placeholders (GitHub link, email) with your details.
