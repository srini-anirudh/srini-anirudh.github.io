# Events pages: writing rules

These rules apply to every page under `events/` (event write-ups, learner kits, the events index) and to the cards, `llms.txt` lines and meta descriptions that point to them.

## Voice and sourcing

- Write as first-hand notes from the author, who attended. Never say or hint that a write-up came from a recording, a livestream, a video, a transcript or a slide deck alone. Do not write "from the recording", "the video ends", "the audio", "the transcript" or similar, in the page, the hero line, the index card, the meta description or `llms.txt`.
- A link to the livestream or the slides is fine as a resource button ("Watch on YouTube", "Slides"). It is a link, not a statement about how the notes were made.
- Do not write about the quality of the source material (unclear audio, cut-off video, guessed speakers). If a speaker cannot be named, attribute by role or leave it out. Never say a speaker was guessed.
- Name a speaker once per run of consecutive points. Do not repeat the name on every paragraph.
- Use "they" for anyone whose pronouns are not stated by the author.

## What goes on the page

- Talks and fireside chats are written as questions and answers, in the same click-to-open `ev-q` style as the PyTorch x Hugging Face page. The short answer is the bold first line.
- When material comes from someone else's write-up (a blog post, a thread), paraphrase it, add a **Source** line that links it, and say when two sources disagree on a number.
- Keep what the speaker said apart from what the author or a reference adds. Label extras ("My notes", "Background", "My reading").
- Each event page has: key highlights with photos near the top, a table of contents, the sessions, and a "What I am taking away" block of short takeaway tokens. Add new points to the takeaways when new material is added.
- Photos come from the author. Crop only what the author supplied. Do not add third-party screenshots unless the author asks.

## Registering a new event

1. Page at `events/<slug>/index.html`, images in `assets/images/events/<slug>/`.
2. Card on `events/index.html` (square thumbnail, newest first) and its item in the page's `ItemList` JSON-LD.
3. URL in `sitemap.xml` and a line in `llms.txt`.
4. After a push, if no Pages build starts, push an empty commit.
