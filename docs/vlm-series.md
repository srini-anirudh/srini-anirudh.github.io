# Vision-Language Models series

Plan and status for the 20-part VLM series on the blog. Writing rules: `docs/blog-writing-guide.md`.
Page and publishing rules: `docs/style-guide.md`.

## Reading order

The series has four groups. These groups also form the VLM learning path on the blog index
(`data-blog-paths` on the VLMs filter button in `blogs/index.html`).

| # | Title | Slug | Topic | Status |
|---|---|---|---|---|
| **Foundations** |||||
| 01 | One Transformer, Two Modalities | `one-transformer-two-modalities` | Transformers vs Vision Transformers | Published |
| 02 | Inside a Modern Vision Encoder | `inside-a-modern-vision-encoder` | Pixels to visual tokens, resolution, connectors | Published |
| 03 | The VLM Architecture Gallery | `the-vlm-architecture-gallery` | Architectures | Published |
| **Training and evaluation** |||||
| 04 | Teaching Language Models to See | `teaching-language-models-to-see` | Pretraining | Published |
| 05 | How Vision-Language Models Scale | `how-vision-language-models-scale` | Scaling laws for VLMs | Published |
| 06 | One Model, Many Visual Skills | `one-model-many-visual-skills` | Post-training, visual instruction tuning | Published |
| 07 | Measuring What a VLM Can Do | `measuring-what-a-vlm-can-do` | Benchmarks, metrics, languages | Published |
| 08 | Aligning Vision-Language Models | `aligning-vision-language-models` | Preferences, hallucination, safety | Published |
| **Capabilities** |||||
| 09 | When Language Must Point | `when-language-must-point` | Grounding and structured visual outputs | In progress |
| 10 | How VLMs Read Documents | `how-vlms-read-documents` | Document and OCR VLMs | In progress |
| 11 | Seeing in Time | `seeing-in-time` | Video understanding | Published |
| 12 | Rewarding What the Model Sees | `rewarding-what-the-model-sees` | RL for VLMs | Published |
| 13 | Thinking With Images | `thinking-with-images` | Reasoning and multimodal test-time scaling | Published |
| 14 | VLMs That Act | `vlms-that-act` | Visual tools, GUI agents, computer use | Published |
| 15 | From VLMs to VLAs | `from-vlms-to-vlas` | Vision-language-action models | In progress |
| **Systems and frontier** |||||
| 16 | The Cost of a Picture | `the-cost-of-a-picture` | Efficient VLMs, token compression, serving | In progress |
| 17 | Searching With Pixels | `searching-with-pixels` | Multimodal retrieval and visual RAG | In progress |
| 18 | What Happens Inside a VLM | `what-happens-inside-a-vlm` | Interpretability | In progress |
| 19 | Models That See and Draw | `models-that-see-and-draw` | Unified understanding and generation | Published |
| 20 | How the Open VLM Families Were Built | `how-the-open-vlm-families-were-built` | Family-by-family survey along the checklist | In progress |

## Coverage of the model survey checklist

The checklist is in the appendix of `docs/blog-writing-guide.md`. This is where each item is covered.

| Checklist item | Posts |
|---|---|
| Scaling laws, parameter split, training time and compute | 05, 20 |
| Progression of model families | 03, 20 |
| Existing datasets, data engines, preprocessing, synthetic data | 04, 06, 10, 20 |
| Data scale per stage and mixing insights | 04, 06, 20 |
| Vision preprocessing, encoder, connector, token compression | 02, 03, 04, 16 |
| Language decoder choice and model size | 03, 05, 20 |
| Multiple images and video | 06, 11, 20 |
| Pretraining tasks and losses | 04 |
| Fine-tuning tasks | 06 |
| RL stages | 12, 20 |
| Benchmarks, metrics, tasks, languages | 07 (plus 08, 09, 10, 11 for their areas) |
| Final capabilities and what enabled them | 07, 20 |
| Ablations and training tips | 04, 20 |

## Shared conventions for every post

- Eyebrow `A field guide · Vision-language models`; three tags; published date set on the day it ships.
- Series navigator directly after the article mast, `aria-label="Vision-Language Models series"`, showing
  `NN of 20 · Part` with previous and next links to published members only.
- JSON-LD `isPartOf` lists both `https://srini-anirudh.github.io/blogs/#blog` and `https://srini-anirudh.github.io/blogs/#vlms`.
- Figures use the light paper theme, follow the animation contract in `docs/blog-template.html`, and include at
  least two interactive figures.
- At least one comparison table along the aspects the post introduces.
- Cross-link sibling posts by slug instead of repeating material.

## Publishing process

Posts ship one at a time as they are finished, so the live site never links to a missing page:

1. Review the post: prose against the writing guide, figures at desktop and mobile widths, no console errors,
   valid JSON-LD, references linked.
2. Sync the series: regenerate every navigator so previous and next skip unpublished posts; point links to
   unpublished siblings at the series list (marked `data-series-pending="slug/"`) and restore them once the
   sibling ships; add the index card, learning-path entry, series count, sitemap, feed and IndexNow entries.
3. Commit and push that post on its own.
4. Update the status column above.
