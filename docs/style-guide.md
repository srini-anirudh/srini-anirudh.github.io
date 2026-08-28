# Website Style Guide

This guide keeps the portfolio and blog collection visually consistent. The live source of truth remains the shared CSS in `assets/css/`.

## Site-wide theme

The blog index defines the visual system for the entire site: warm editorial paper, near-black ink, blue for links and identity, and orange for activity and emphasis. Portfolio pages and blog pages use the same light-mode tokens.

All page backgrounds use a subtle `44px × 44px` editorial grid beneath the particle network. Keep the grid low contrast so it adds structure without competing with text or animation; raised cards remain opaque.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Page surface | `#e4e2dc` | `#071a2c` | Page background |
| Strong surface | `#f7f6f3` | `#0c2135` | Cards and raised content |
| Primary text | `#14171a` | `#dbe7f3` | Body copy and headings |
| Blue | `#0b5ea8` | `#6fb7ff` | Links and identity |
| Deep blue | `#07457d` | `#dbe7f3` | Logo and strong accents |
| Orange | `#f28c18` | `#ffb45c` | Active states and highlights |
| Divider | `#cac6bd` | `#173b5c` | Rules and card borders |

Use the variables already defined in `assets/css/stylesheet.css`; do not duplicate literal colors in new portfolio components unless a state needs a deliberate variant.

### Site-wide typography

- Body and long-form prose: Newsreader at `17px` by default, with comfortable line height around 1.5–1.7 and soft ink (`#474e53`).
- Page titles: Bricolage Grotesque, `800` weight, tightly tracked, and fluid from `46px` to `84px`.
- Section and card headings: Bricolage Grotesque at `700` weight, tightly tracked, and near-black ink (`#14171a`).
- Navigation remains compact at `15px`; metadata and controls retain their smaller mono scale.
- Labels, tags, metadata, captions, and technical controls: IBM Plex Mono.
- Keep paragraph measure near 60–70 characters when practical.
- Use sentence case for headings and navigation labels.

### Header and footer

- Every page must expose Home, About, Research, Projects, Blogs, and Resume in the main navigation.
- Use the home page identity, spacing, link order, blue brand, and orange active state throughout.
- Every page footer must include the owner name plus Email, GitHub, LinkedIn, X, and Resume links.
- Keep navigation available on narrow screens and make the link row horizontally scrollable when needed.

### Particle network

The network appears in both portfolio themes. Light mode uses translucent blue nodes and orange connections; dark mode uses neutral silver. Keep it decorative, non-interactive, and behind all content. Respect `prefers-reduced-motion` when adding future motion effects.

## Blog-specific components

Blogs use the same site-wide palette. The Activation Atlas is the canonical reference for article organization, editorial rhythm, table of contents, and grouped references; the normalization article remains the reference for dark technical instrument panels.

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#e4e2dc` | Article background |
| Soft paper | `#efede9` | Secondary surfaces |
| Bright paper | `#f7f6f3` | Cards and notes |
| Ink | `#14171a` | Headings and primary copy |
| Soft ink | `#474e53` | Introductions and metadata |
| Muted ink | `#7b8388` | Labels and secondary title text |
| Rule | `#cac6bd` | Borders and dividers |
| Blue | `#0b5ea8` | Tags and links |
| Orange | `#d66f00` | Category labels and active states |
| Instrument panel | `#0f1317` | Interactive figures and charts |

### Blog typography

- Display headings: Bricolage Grotesque, bold and tightly tracked.
- Article prose: Newsreader, approximately 18–19px with a 1.65–1.7 line height.
- Labels, tags, controls, captions, and metadata: IBM Plex Mono.
- Prose should stay at or below `70ch`; visual panels may use the full article width.

### Required article header

Every article must include, in this order:

1. Shared main navigation (`.navbar`, using the same markup as the home page).
2. Field-guide/category eyebrow.
3. Article title and short subtitle.
4. Tags using `.article-taxonomy`.
5. Author, publication date, estimated reading time, and `.article-share`.

Use `assets/css/blog-shell.css` for the shared shell and `assets/js/blogs.js` for native sharing with clipboard fallback.

### Layout and components

- Keep the shared main navigation visible with `position: fixed`.
- Use thin square rules and 2px–8px corner radii; avoid heavily rounded editorial cards.
- Use dark instrument panels for interactive figures, diagrams, and dense technical readouts.
- Use paper cards for summaries, references, and non-interactive content.
- Citation buttons copy BibTeX on click and expose the same entry as a hover/focus preview using `data-bibtex-key`.
- Tags are short nouns or noun phrases; aim for three per post.
- Provide descriptive headings and captions for every major interactive figure.
- Place a clearly labelled table of contents after the article mast/lede. Use the Activation Atlas treatment: a bordered paper panel, numbered entries, concise section labels, and a one-column mobile layout.
- Keep section anchors stable and offset them from the fixed navigation so TOC links never hide a heading.
- Make `References` the final article section. Group references by topic rather than chronology, add a short description where useful, and make every title a direct link to the primary paper, proceedings page, report, or repository.
- Do not repeat the main navigation, article metadata/share logic, or site footer inside article-specific CSS or JavaScript. Use the shared shell and reserve inline code for the article’s figures and interactions.

### Responsive and accessible behavior

- Navigation may scroll horizontally on narrow screens but must remain available.
- Tables and wide figures need their own horizontal overflow container.
- Controls require keyboard focus styles and semantic buttons.
- Images and figures need useful alternative text or an adjacent text explanation.
- Honor `prefers-reduced-motion` and never make animation necessary to understand a figure.
- Maintain visible focus, sufficient contrast, and touch targets around 40px where practical.

## Publishing a blog post

1. Create `blogs/descriptive-slug/` and copy `docs/blog-template.html` to `blogs/descriptive-slug/index.html`.
2. Replace every bracketed placeholder, including title, description, tags, date, and reading time.
3. Write the article inside `<main class="article-content">`.
4. Finish the article with grouped, fully clickable References, and include References as the last TOC entry.
5. Save the preview pair as `blogs/descriptive-slug/preview.gif` and `blogs/descriptive-slug/preview.png`, then add a card to `blogs/index.html` with matching metadata and reduced-motion fallback markup.
6. Test the article at desktop and mobile widths, including the TOC, reference links, Share button, animation controls, and every main-navigation link.
7. Run `git diff --check` before committing.
