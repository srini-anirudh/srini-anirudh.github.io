# Website Structure

This is a static GitHub Pages site. Keep root-level HTML files for clean URLs on the user site:

- `index.html` - landing page and news
- `about.html` - about, education, and experience
- `research.html` - publications and paper resources
- `projects.html` - applied project pages and demos
- `blogs/` - blog index and one folder per self-contained blog article
- `robots.txt` - crawler permissions and sitemap discovery
- `sitemap.xml` - the complete canonical, indexable URL set
- `feed.xml` - the RSS archive of published articles
- `.github/workflows/indexnow.yml` - submits canonical URLs to IndexNow after relevant pushes

Shared files live in `assets/`:

- `assets/css/` - site styles and visual effects
- `assets/js/` - shared browser behavior
- `assets/images/` - profile, paper figures, paper thumbnails, logos, and favicon
- `assets/data/` - small media/data files used by the site
- `assets/data/citations/` - source BibTeX records used by publication copy and preview controls
- `assets/pdfs/` - resume, project problem statements, and project artifacts

When adding a new page, copy the existing page head/nav/footer pattern so dark mode, stars, and mobile navigation keep working consistently.

For a new blog post, create `blogs/descriptive-slug/index.html`, keep its preview GIF and PNG in the same folder, and add its title, summary, publication date, last-modified date, reading time, tags, and filter categories to `blogs/index.html`. Add its canonical URL to the sitemap, RSS feed, and IndexNow workflow. Keep References as the final section, grouped by topic with every entry linked.

See `docs/style-guide.md` for the visual and interaction rules. Copy `docs/blog-template.html` into the new article folder when starting a post.
