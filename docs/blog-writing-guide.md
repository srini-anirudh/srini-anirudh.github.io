# Blog Writing Guide

How every new article on this site should be researched, written and illustrated. Follow this together with
`docs/style-guide.md` (visual and page rules) and `docs/blog-template.html` (page skeleton and animation contract).

## 1. Research before writing

- Do a thorough literature survey first. Cover the field properly: the foundational papers, the main lines of
  follow-up work, the strongest recent methods, the open problems, and the benchmarks people actually use.
- Read primary sources. Check what a paper actually did before describing it. Do not rely on memory for numbers,
  dataset sizes, model details or arXiv IDs.
- Organise the literature by idea, not as a paper list. Each method should appear because it illustrates a step
  in the argument.
- Never invent numbers or citations. If a figure cannot be verified, describe the result in words or leave it out.
  Mark unknown cells in tables as "not reported".

## 2. Build the concept from first principles

- Open with one concrete question the article answers.
- Build the idea from the ground up. Start with the simplest version of the problem, show why it is not enough,
  and add one idea at a time. Each section should follow from the one before it.
- Derive what needs deriving. Explain why a formula has the shape it has before using it.
- Cover the different aspects a practitioner has to think about, not only the headline method.
- When another article on the site already explains a topic, link to it instead of re-deriving it.
- End with what the reader should now be able to reason about, and what the next article picks up.

## 3. Compare along the aspects you introduced

- Every article includes at least one substantial comparison table. Rows are methods or approaches. Columns are
  the aspects the article introduced.
- Add a short note on how to read the table and what pattern to notice.
- Keep wide tables inside a horizontally scrollable container.

## 4. Write so it is easy to read

- Use simple language. Prefer common words over technical ones when both are accurate. Define a term the first
  time it appears.
- Keep sentences short. One idea per sentence. Break long sentences into two or three.
- Keep paragraphs short, usually two to four sentences.
- Do not make the reader solve correspondence problems. Avoid "respectively", "the former / the latter", and
  lists of pairs that must be matched by position. Name each thing next to what it does.
  - Instead of: "A and B use boxes and masks, respectively."
  - Write: "A uses boxes. B uses masks."
- Avoid vague catch-alls such as "and all", "etc." and "and so on" in explanations. Name the items or say
  "for example" and give one.
- Prefer concrete examples before abstractions. Show one example, then state the general rule.
- Give the flow a clear thread. Use short transition sentences that say why the next section is needed.
- Use professional, precise language. No hype ("revolutionary", "game-changing", "magic"), no filler, no
  exclamation marks, no emoji, no rhetorical gimmicks.
- Headings are plain and descriptive, in sentence case. Say what the section is about. Avoid cute, clever or
  clickbait headings.

## 5. Explain visually

- Every major idea gets a figure. Figures should explain, not decorate.
- Animations must be high quality: multi-stage, smooth eased transitions, staged reveals, tracked highlights,
  and camera-like zoom or pan where it helps. Avoid two-state flips.
- Include interactive figures where the reader changes a quantity and sees the consequence (sliders, toggles,
  tabs, draggable elements).
- Follow the animation contract in `docs/blog-template.html`: Previous / Play-Pause / Next, 0.5x / 1x / 2x
  speed with `aria-pressed`, a step counter, autoplay only while visible, and full support for
  `prefers-reduced-motion`.
- Keep figures in the light paper theme of the site. Do not switch suddenly to dark panels inside a light page.
- Every figure has a numbered, descriptive caption. The text and caption must make sense without the animation.
- Keep pages fast: inline SVG and CSS, no heavy libraries, no iframes of other pages, no oversized images.
- Check layout at desktop and mobile widths. No clipped labels, overlapping text, or horizontal page scroll.

## 6. Before publishing

- References are the last section, grouped by topic, and every title links to the primary source.
- Add a short "Continue reading" block of genuinely related posts before References.
- Follow the publishing checklist in `docs/style-guide.md`: metadata, JSON-LD, series navigator, blog index card,
  preview PNG and GIF, sitemap, feed and IndexNow list.

## Appendix: checklist for surveying a model or model family

Use this whenever an article describes or compares models (VLM posts in particular). Answer every point that the
primary sources allow, and say "not reported" for the rest. A comparison table along these columns is the default.

**Scaling and progression**
- What scaling laws apply, and what the training compute or time was (GPU hours, tokens, steps), where reported.
- How the family progressed from one version to the next, and what changed at each step.

**Data**
- Existing datasets used, and any data engines built.
- Preprocessing and filtering, including anything unusual.
- Synthetic data generation.
- Scale of data in each training stage, which data and how much, and any mixing insights.

**Model**
- Model size and the parameter split between vision encoder, connector and language decoder.
- Choice of vision encoder and language decoder, and why.
- Vision preprocessing: resolution, tiling, aspect ratio, native resolution.
- How multimodality is handled, focusing on the connector.
- How multiple images (and video) are handled.
- Token compression.
- Architectural innovations.

**Training**
- Pre-training tasks and loss functions.
- Fine-tuning tasks.
- RL stages, if any.
- New training tasks or strategies, useful ablations that show what matters most, and training tips.

**Evaluation and capabilities**
- Existing benchmarks and metrics used.
- Tasks and capabilities: OCR, VQA, grounding, counting, documents, charts, video, agents.
- Languages: English only or multilingual, and which languages.
- Performance on the benchmarks.
- Final capabilities, what enabled each one, and any correlation between data, design and capability.
