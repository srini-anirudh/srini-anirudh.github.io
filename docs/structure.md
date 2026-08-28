# Website Structure

This is a static GitHub Pages site. Keep root-level HTML files for clean URLs on the user site:

- `index.html` - landing page and news
- `about.html` - about, education, and experience
- `research.html` - publications and paper resources
- `projects.html` - applied project pages and demos
- `blogs/` - blog index and self-contained blog articles

Shared files live in `assets/`:

- `assets/css/` - site styles and visual effects
- `assets/js/` - shared browser behavior
- `assets/images/` - profile, paper figures, paper thumbnails, logos, and favicon
- `assets/data/` - small media/data files used by the site
- `assets/data/citations/` - source BibTeX records used by publication copy and preview controls
- `assets/pdfs/` - resume, project problem statements, and project artifacts

When adding a new page, copy the existing page head/nav/footer pattern so dark mode, stars, and mobile navigation keep working consistently.

For a new blog post, add a standalone HTML file in `blogs/` and add its title, summary, date, and tags to `blogs/index.html`.

See `docs/style-guide.md` for the visual and interaction rules. Copy `docs/blog-template.html` into `blogs/` when starting an article.
