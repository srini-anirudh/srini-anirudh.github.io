# Research interests and series

The Research page is organised into three research interests. Each interest has a thesis (a card on the Research
page and a hub blog post) and one blog post per publication or system under it.

| # | Interest | Research page anchor | Thesis post | Members |
|---|---|---|---|---|
| 01 | Sovereign foundation models | `research.html#sovereign-foundation-models` | `building-sovereign-foundation-models` (in progress) | Patram, Patram-Bench |
| 02 | Grounded document intelligence | `research.html#grounded-document-intelligence` | `building-grounded-document-intelligence` (published) | REPLICA, M3Grounder, DoCoG, DocLayout-VL |
| 03 | VLM infrastructure | `research.html#vlm-infrastructure` | `building-vlm-infrastructure-at-scale` (in progress) | Patram-Ingest, guest lecture, vLLM Meetup talk |

New publications go under the interest they test. Patram-Bench belongs to sovereign foundation models.

## Grounded Document Intelligence series

One blog post per publication, each built around the key insights learnt from that work and tied back to the
thesis post. Writing rules: `docs/blog-writing-guide.md`. Page rules: `docs/style-guide.md`.

| # | Post | Slug | Paper | Venue | Status |
|---|---|---|---|---|---|
| 01 | Building Grounded Document Intelligence | `building-grounded-document-intelligence` | Thesis hub | — | Published |
| 02 | REPLICA | `replica-visually-faithful-document-reconstruction` | REPLICA: An Agentic Framework for Visually Faithful Document Reconstruction | ICDAR 2026, Oral | In progress |
| 03 | M3Grounder | `m3grounder-mask-based-document-grounding` | M3Grounder: Mask-Based Multi-Span and Multi-Granular Grounding for Document QA | CVPR 2026, Poster | In progress |
| 04 | DoCoG | `docog-grounded-chain-of-thought` | DoCoG: Mask-based Multi-Type Grounded Chain-of-Thought for Document QA | ECCV 2026, Spotlight | In progress |
| 05 | DocLayout-VL | `doclayout-vl-promptable-layout-understanding` | DocLayout-VL: A Foundational Model for Hierarchical, Open-set, and Promptable Document Layout Understanding | ECCV 2026, Poster | In progress |

## Sovereign Foundation Models series

| # | Post | Slug | Status |
|---|---|---|---|
| 01 | Building Sovereign Foundation Models (thesis) | `building-sovereign-foundation-models` | In progress |
| 02 | Patram-Bench | `patram-bench-indian-document-understanding` | In progress |

## VLM Infrastructure series

| # | Post | Slug | Status |
|---|---|---|---|
| 01 | Building VLM Infrastructure at Scale (thesis) | `building-vlm-infrastructure-at-scale` | In progress |

## Conventions

- Eyebrow `Research · Document AI`; series navigator `aria-label="Grounded Document Intelligence series"` linking
  to the thesis post; JSON-LD `isPartOf` includes `https://srini-anirudh.github.io/blogs/#docai-research`.
- Every post states what is first of its kind precisely, uses only numbers from the paper, project site or talk
  deck, and centres on Insight and Nuance callouts about what the work teaches.
- When a post ships: add a Blog button on its `research.html` card, link it from the thesis post, add the blog
  index card, a Research learning path, sitemap, feed and IndexNow entries. Commit and push each post on its own.
