# Spec: "Inside a Music AI" — A Scroll-Driven, Animated Explainer of How Generative AI Works (Built Around YuE2-3B)

> **Audience of this document:** an AI coding agent that will build the app. This document is your **only** source of context. There is no earlier project, codebase, or conversation to refer to.
> **Audience of the app:** junior Python developers who have never studied machine learning.

---

## 1. Mission

Build a **single-page, scroll-driven React app** that teaches how generative AI works through **animated, interactive visuals**. Each core concept gets one small widget that the reader can watch, scrub, and poke at.

The running example is one real open-source AI music model, **`m-a-p/YuE2-3B`** (a model that turns lyrics and a style description into a full song). The model is the *story*; the visuals teach the *general ideas* that every modern generative model shares.

A reader who finishes the page should be able to explain, in plain words:

1. How text, music notation, and audio become **tokens** (numbered pieces).
2. How tokens become **embeddings** (lists of numbers that capture "what this thing is like").
3. How **self-attention** lets each token decide which other tokens to pay attention to (**query / key / value**).
4. Why **multi-head attention** runs several attention "views" side by side.
5. How the pieces fit together in one **transformer block**, and why blocks are stacked.
6. How a model picks its next token (**probabilities, temperature, top-k, top-p, seed**).
7. How the **generation loop** builds a whole output one token at a time, and how that relates to a song.

### Non-goals

- The app does **not** run YuE2 (it needs a 24 GB NVIDIA GPU). It runs small, honest simulations in the browser.
- It does **not** teach training from scratch (mention it in one short aside only).
- It is **not** a research-paper summary. No math notation unless immediately translated into Python-style code.
- **No 3D engine** (no Three.js) in this version. All visuals are 2D (SVG / HTML / Canvas).
- No backend. No user accounts. No AI calls at runtime.

---

## 2. The Golden Rules (apply to every piece of content)

If a build violates these, it fails review even if it "works".

| # | Rule | How it's enforced |
|---|------|-------------------|
| G1 | **No unexplained jargon.** Every technical term is defined in plain words the first time it appears, via a `<Term>` component (hover/tap/focus popover + link to glossary). | Glossary lint script (§13) |
| G2 | **Analogy first, mechanism second, then "where the analogy breaks".** | Section template (§9) has a required `breaksDown` field |
| G3 | **Assume Python, not ML.** Explain with ideas the reader knows: lists, dicts, loops, functions, `sorted`, `random.choices`. Never assume linear algebra, calculus, or statistics beyond "chance". When a vector appears, call it "a list of numbers". | Reviewer checklist |
| G4 | **Honest data labels.** Every visual shows a badge stating where its numbers come from (see §6.4): *Illustrative*, *Real data from a small stand-in model*, or *Fact about YuE2*. Never present invented numbers as YuE2's real internals. | `DataBadge` component required on every widget; test checks it renders |
| G5 | **Visuals are pure functions of a step.** The same widget state is always reproducible from `(step, data, controls)`. No hidden free-running state. | Widget contract (§6.1) and tests |
| G6 | **One new big idea per step.** Each step changes one thing on screen and has ≤ 40 words of caption. | Content lint: caption length |
| G7 | **Don't invent facts about YuE2.** Use only the Fact Register (§4). Anything marked *verify* must be confirmed against the technical report or omitted. | `facts.ts` with `verified` flags + facts lint |
| G8 | **Motion serves understanding.** Animate to show *what moved where* (a token sliding into a slot, a weight flowing along an arrow). No decorative motion. Respect `prefers-reduced-motion`. | Review + reduced-motion test |

---

## 3. Running Example (use consistently everywhere)

Write **original** examples (do not copy text from any model card or example file).

| Item | Value |
|------|-------|
| Style prompt | `"Indie pop, warm female vocal, acoustic guitar, soft drums"` |
| Lyric line | `"Sunlight on the kitchen floor"` |
| Attention sentence (word-level, 9 tokens) | `The singer dropped the guitar because it was heavy` |
| ABC notation fragment (a tiny, original scale-like phrase) | `X:1` / `M:4/4` / `L:1/8` / `K:C` / `\|CDEF G2E2\|` |

The attention sentence is chosen because the word **"it"** must be resolved to **"guitar"** — the classic demonstration of why context matters.

---

## 4. Fact Register — What Is Known About YuE2-3B

Store these in a typed `src/content/facts.ts` (`{ id, claim, source, verified }`) and cite them in the UI as "Source: model card" where used.

**Primary sources**

- Model card: https://huggingface.co/m-a-p/YuE2-3B
- Technical report: arXiv **2609.33757** (*YuE2: Unifying Symbolic and Audio Music Generation at Frontier Quality*)
- Predecessor paper: arXiv **2503.08638** (YuE, 2025)
- Code: https://github.com/multimodal-art-projection/YuE
- Demo page: https://map-yue2.github.io/

### 4.1 Verified (from the model card)

| Fact | Detail |
|------|--------|
| Developer | M-A-P (Multimodal Art Projection) |
| Task | Lyrics + style prompt → full song with vocals and accompaniment |
| Output | 48 kHz stereo audio |
| Languages | English and Chinese |
| Architecture claim | "One **AR–NAR Mixture-of-Transformers** backbone writes the score and semantic tokens, then generates acoustic latents through **flow matching**. The VAE turns them into stereo audio." |
| Stages | Plan (a score in **ABC notation**) → *semantic tokens* (autoregressive) → *acoustic latents* (non-autoregressive, flow matching) → waveform (VAE decoder) |
| Planning modes | `cot="full"` (melody + chords, default), `"melody"`, `"off"` |
| Guidance | `cfg_scale` (classifier-free guidance) for text guidance |
| Reproducibility | `seed=` parameter |
| Text tokenizer file | `qwen.tiktoken` (a Qwen-style text tokenizer) |
| Size | "3B" in the name; the model page lists roughly 4B parameters. **Say "about 3–4 billion parameters"** |
| Hardware (official) | Linux, Python 3.10+, 24 GB NVIDIA GPU, BF16 |
| License | **CC BY-NC 4.0** (non-commercial) — must be shown prominently |

### 4.2 Verify before stating as fact (read the technical report)

Fetch arXiv 2609.33757. Fill in what you can; **omit what the paper does not state**. If the paper contradicts this spec, **the paper wins**; note it in `docs/research-notes.md`.

- Number of layers, hidden size, number of attention heads
- Exactly what "Mixture-of-Transformers" means in YuE2
- Token rates for semantic tokens and acoustic latents
- How audio becomes semantic tokens
- Training data scale

If a number cannot be verified, use generic wording ("many layers", "a transformer-based model") — **never guess numbers**.

### 4.3 The agent must NOT claim

- That YuE2 "understands" music or lyrics, or "thinks" / "is creative".
- That any toy visual reflects YuE2's actual internal numbers or attention patterns.
- Specific details about how YuE2's audio tokens are produced, unless verified (§4.2).

---

## 5. Product Shape

### 5.1 Delivery

- Standalone **Vite + React + TypeScript** project. `npm install && npm run dev` to develop; `npm run build` to produce static files deployable to any static host.
- All content and data are static files bundled with the app.

### 5.2 Tech stack (fixed unless a strong reason is recorded in `docs/decisions.md`)

Use current stable versions of everything; record the versions you installed in `docs/decisions.md`.

| Concern | Choice | Why |
|---------|--------|-----|
| Build / language | Vite, React, TypeScript (strict) | Standard, fast |
| Styling | Tailwind CSS + CSS variables for theme tokens | Fast, consistent, light/dark |
| **Main animation** | **Motion** (`motion/react`, formerly Framer Motion) | Declarative; `layout` / `layoutId` make "token slides to a new place" almost free |
| **Timeline choreography** | **GSAP** + `@gsap/react` — **only** where a widget needs a scrubbable multi-part timeline (W5). Confirm GSAP's current license terms in its docs and note them in `decisions.md` | Pausable, scrubbable timelines (`timeline.progress(p)`) |
| **Large grids** | **HTML Canvas 2D** for any grid > ~1,000 cells (e.g., real attention heatmaps) | SVG slows down at that size |
| Everything else visual | **SVG + HTML** rendered by React | Accessible, testable, crisp |
| Math/colour helpers | `d3-scale` and `d3-interpolate` **only** (colour scales, linear scales). React owns the DOM; D3 never touches it | Avoids two systems fighting over the DOM |
| Scroll mapping | Native `IntersectionObserver` (custom hook), optionally Motion's scroll utilities | No heavy scroll library needed |
| Code blocks | Shiki or `react-syntax-highlighter` + copy button | Python snippets |
| Validation | `zod` | Validate every data JSON at load and in tests |
| Testing | Vitest + React Testing Library; Playwright; `axe-core` | See §13 |

**Explicitly not used:** Three.js / React Three Fiber, Lottie, Rive, PixiJS, Redux. (If a Canvas grid proves too slow, PixiJS may be proposed in `decisions.md` first.)

### 5.3 Page layout and scroll mechanics

The page is one long scroll with these parts, in order: **Hero → Concept sections W1–W7 → Epilogue → Glossary → Footer**.

**Each concept section is a "scrollytelling" block:**

- **Desktop (≥ 1024 px):** two columns. Left: scrolling text **beats** (short paragraphs). Right: the **widget stage**, `position: sticky`, vertically centred, staying in view while the section scrolls.
- **Mobile (375 px up):** the widget stage is sticky at the top (about 45 vh) and beats scroll beneath it. Every widget must be fully usable at **375 px width**.
- Each beat is tied to a **step index**. When a beat crosses the middle of the viewport, the widget's `step` becomes that beat's index.

**Single source of truth:** a `useWidgetStep(sectionId)` hook owns `step`. Three things can change it, and all go through the hook:

1. **Scrolling** (beats observed by IntersectionObserver).
2. **Prev / Next buttons and a step scrubber** under the widget (these scroll the matching beat into view, so scroll and controls never disagree).
3. **Keyboard:** ← / → when the widget has focus; `Home` / `End` for first / last step.

**Other requirements**

- Deep links: `#attention?step=3` opens that section at that step.
- A thin **progress rail** on the side lists the 7 sections with a filled indicator for the current one; clicking jumps to it.
- Light and dark themes (auto-detected, with a manual toggle).
- Under `prefers-reduced-motion`: no smooth scrolling, no transitions — widgets **snap** to each step's final state, and the caption still updates.

---

## 6. Architecture

### 6.1 The Widget Contract (the most important engineering rule)

Every visual is a React component with the same shape and **no internal timers**:

```ts
interface WidgetProps<TData, TControls = {}> {
  step: number;                    // 0 … stepCount-1, owned by useWidgetStep
  stepCount: number;
  data: TData;                     // validated JSON (see §6.3)
  controls?: TControls;            // reader-adjustable values (sliders, selected token…)
  onControlsChange?: (c: TControls) => void;
  reducedMotion: boolean;
}
```

Rules:

1. **What is visible and where it is** is a pure function of `(step, data, controls)`. Put that logic in a separate pure function, e.g. `getSceneState(step, data, controls): SceneState`, and let the component only render it. This function is unit-tested without a browser.
2. **Transitions between steps** are handled by Motion (`animate`, `layout`, `AnimatePresence`) or, in W5 only, a paused GSAP timeline whose `progress()` is set from `step`. Going **backwards** must work exactly as well as going forwards.
3. **No random numbers at render time.** Where randomness is needed (W6, W7), use a **seeded RNG** (`mulberry32`) stored in `src/lib/rng.ts`, with the seed in controls state.
4. Every widget exposes `data-testid="widget-<id>"` and renders a visually-hidden **live caption** (`aria-live="polite"`) describing the current step in words, so the visual has a text alternative.
5. Each widget lives in its own folder, is lazy-loaded (`React.lazy`), and only starts animating when ≥ 30% visible. A crash in one widget must not break the page (wrap each in an error boundary showing a friendly fallback).

### 6.2 Folder layout

```
src/
  app/                    # page shell, routing of hash/deep links, theme
  components/             # Term, AnalogyBox, DataBadge, StepControls, PythonCorner, Quiz, YuE2Link
  hooks/                  # useWidgetStep, useInView, useReducedMotion
  lib/
    ml/                   # pure TS: softmax, dot, attention, temperature, topK, topP, sample, tokenizer
    rng.ts                # mulberry32
  content/
    facts.ts
    glossary.ts
    sections/             # one typed content module per section (see §9)
    python/               # runnable .py snippets + expected output files
  widgets/
    w1-tokenization/ …  w7-generation-loop/
      index.tsx           # the component
      scene.ts            # pure getSceneState()
      data.json           # validated data
      schema.ts           # zod schema
public/
tools/                    # optional Python export scripts (§12)
docs/                     # decisions.md, research-notes.md
tests/
```

### 6.3 Data contract

All data is JSON, validated by zod when loaded, and also validated in unit tests. Every file starts with the same header:

```json
{
  "schemaVersion": 1,
  "meta": {
    "id": "attention-multihead-illustrative-01",
    "dataKind": "illustrative",
    "badgeText": "Illustrative — hand-made numbers that show the idea, not YuE2's real values.",
    "source": "authored by the build agent",
    "model": null,
    "generatedBy": null
  }
}
```

`dataKind` is one of the three values in §6.4. For `real-small-model`, `meta.model` and `meta.generatedBy` are **required**.

**Attention data shape** (used by W3, W4):

```json
{
  "tokens": ["The","singer","dropped","the","guitar","because","it","was","heavy"],
  "heads": 4,
  "weights": [ /* weights[head][queryIndex][keyIndex] */ ],
  "headLabels": [ {"name": "Previous-word head", "blurb": "…"} ]
}
```

Validation rules (tested): every row of `weights[h][q]` sums to 1 (±1e-6); `weights[h][q][k] == 0` for `k > q` when the data declares `causal: true`; all values in [0, 1].

**Tiny Q/K/V data** (W3 only): each token has a `q`, `k`, `v` list of **4 numbers**. The widget **computes** scores, softmax and the blended output live from these numbers with the real functions in `lib/ml/` — only the input vectors are hand-authored, and they must be chosen so that the result is sensible (**"it" → "guitar" ≈ the biggest weight**).

### 6.4 The three data labels (`DataBadge`)

| `dataKind` | Meaning | Badge style | Example text |
|-----------|---------|-------------|--------------|
| `illustrative` | Hand-authored or toy numbers that demonstrate the idea | Amber | "Illustrative — made-up numbers that show the idea." |
| `real-small-model` | Real numbers exported from a small open model (never YuE2) | Blue | "Real data — attention weights from GPT-2 small (a tiny stand-in model, not YuE2)." |
| `yue2-fact` | A verified fact about YuE2 from §4 | Green | "Fact about YuE2 — source: model card." |

A single widget may mix kinds (e.g., an illustrative diagram with a `yue2-fact` callout); each part carries its own badge.

---

## 7. Motion & Performance Rules

- Step transitions: **300–800 ms**, ease-out. A step must never need more than ~1 s of animation to be understood.
- **Animate positions and opacity** (`transform`, `opacity`). Do not animate layout properties like `width/height/top/left` directly, except through Motion's `layout`.
- Use a **consistent visual vocabulary** across all widgets (define in `src/app/visual-language.ts` and a one-screen legend in the hero):
  - **Token** = rounded rectangle chip with its text; the ID shown in small monospace beneath.
  - **Vector / list of numbers** = a row of small vertical bars (height = value; colour = sign).
  - **Attention weight** = a line or cell whose opacity/thickness = weight (same colour scale everywhere).
  - **Information flow** = animated dashes along an arrow, direction clear.
  - The same colours mean the same thing in every widget (Query = one hue, Key = another, Value = a third, reused in W3, W4, W5).
- Colour alone must never carry meaning (add labels, patterns or numbers). Contrast ≥ WCAG AA.
- Large grids (> ~1,000 cells) use Canvas; others use SVG.
- Only the widget currently in view animates. Off-screen widgets are paused / unmounted.
- Target 60 fps on a mid-range phone; Lighthouse performance ≥ 90 on desktop; initial JS < 250 KB gzipped (widgets are lazy-loaded chunks).

---

## 8. The Page — Sections in Teaching Order

Every section follows the template in §9. Each lists the **steps** (one beat of text each, one scene change each).

> **No forward references.** A term may only be used after the section that introduces it. The hero previews the whole journey using only everyday words.

### Hero — "How can a machine write a song?"

- One-sentence promise: "By the end of this page you'll know how a music AI works — and you only need Python."
- A **pipeline strip** (static SVG with a small entrance animation) showing YuE2's four stages in plain words: `Your words → Plan (sheet music) → Rough draft → Detailed sound → Audio`. Callout badge: *Fact about YuE2*.
- A one-line legend of the visual language (§7) and the three data badges (§6.4).
- Prominent line: "Model: YuE2 by M-A-P — weights licensed CC BY-NC 4.0 (non-commercial). This page is an independent educational project."

---

### W1 — Tokenization: "Everything becomes numbered bricks"

**Analogy:** a LEGO catalogue. Any building is a list of catalogue numbers.
**Breaks down:** a model's catalogue is built from data statistics, not designed by a person.
**Data kind:** illustrative (toy tokenizer with a small hard-coded vocabulary).

**Steps**

| Step | Scene change |
|------|--------------|
| 0 | The lyric line `Sunlight on the kitchen floor` appears as plain text. |
| 1 | Text splits into chips (word pieces, e.g. `Sun`, `light`, ` on`, …). Caption defines *token* and notes that pieces can be smaller than words. |
| 2 | Each chip receives its **ID** from a vocabulary table (`dict[str, int]`) shown beside it; matching table row highlights. Caption defines *vocabulary* and *ID*. |
| 3 | The chips collapse into one row of numbers — the only thing the model ever sees. |
| 4 | **Same trick on music notation:** the ABC fragment is split into chips with IDs, using the same mechanism. Callout (*Fact about YuE2*): YuE2 writes a score in ABC notation before generating audio. |
| 5 | **Same trick on sound:** a waveform is chopped into equal slices; each slice flies to its closest entry in a "catalogue of sound shapes"; that entry's number is the token. Badge says this is illustrative of the *general idea* only. Caption: "Audio-derived tokens are how a model can treat sound like text." **Do not describe YuE2's actual audio tokenizer (§4.3).** |

**Interactive:** a text box (step 1–3) lets the reader type their own text; the toy greedy longest-match tokenizer re-chips it live (Motion `layout` animates chips). Unknown characters fall back to single-character tokens.
**In YuE2:** facts — text tokenizer file; semantic tokens exist; ABC plan is text.
**New terms:** token, tokenizer, vocabulary, ID, notation (ABC), waveform.
**Python Corner:** `vocab = {...}`, a 10-line greedy tokenizer, `ids = [vocab[t] for t in tokens]`. *Runnable.*

---

### W2 — Embeddings: "Every token gets a spot on a map"

**Analogy:** a city map where similar places cluster (cafés near cafés). An embedding is a token's coordinates — except the map has hundreds or thousands of directions, not two.
**Breaks down:** the "map" isn't drawn by anyone; the model learns the coordinates during training, and the directions have no names.
**Data kind:** illustrative (hand-authored 8-number vectors for ~20 tokens + precomputed 2D positions). Optionally replaceable by `real-small-model` (§12).

**Steps**

| Step | Scene change |
|------|--------------|
| 0 | The token chip for `guitar` with ID `412` (toy ID). |
| 1 | The ID looks itself up in a big **table** (rows = IDs); its row lights up. Caption: an embedding is "the row you get back". |
| 2 | The row opens up into **8 bars** (a *vector*, i.e. a list of numbers). Caption defines *vector* and *dimension*; note real models use thousands of numbers. |
| 3 | The table of ~20 tokens (`guitar`, `piano`, `drums`, `verse`, `chorus`, `sad`, `happy`, `kitchen`, …) appears as bar-rows; similar ones are visibly alike. |
| 4 | Rows fly onto a **2D scatter map** (a flattened view, labelled as such). Similar tokens cluster. |
| 5 | Hovering/selecting a token draws lines to its 3 **nearest neighbours** with distance numbers. Caption defines *similarity* as "close on the map". |

**Interactive:** in steps 4–5 the reader can **drag a token** on the map; nearest neighbours and distances update live (computed by `lib/ml` distance function on the 2D positions).
**In YuE2:** the model also turns its tokens into vectors first (state generically; no numbers).
**New terms:** embedding, vector, dimension, similarity.
**Python Corner:** `math.dist(a, b)` and a 6-line `nearest(word, table)`. *Runnable.*

---

### W3 — Self-attention: "Who should I listen to?"

**Analogy:** a meeting room where every word is a person. Before updating their own understanding, each person asks everyone else "how relevant are you to me?" and listens in proportion. **Library variant for Q/K/V:** Query = what I'm searching for; Key = the label on a book's spine; Value = the book's contents.
**Breaks down:** people have intent; attention is arithmetic on lists of numbers.
**Data kind:** illustrative inputs (tiny 4-number Q/K/V per token) but **computed live** by real functions, so the maths shown is honest.

Sentence: `The singer dropped the guitar because it was heavy`.

**Steps**

| Step | Scene change |
|------|--------------|
| 0 | The sentence as 9 token chips. Caption: what does **"it"** mean? Context decides. |
| 1 | `it` is selected; arrows reach out to all earlier words. Caption: attention = every token looks at others. |
| 2 | **Query / Key / Value** appear as three small colour-coded bar lists under every token. Caption defines each, using the library analogy. |
| 3 | `it`'s **Query** is compared with every **Key**: each pair shows a **score** (the dot product, shown as a number). Caption defines *score* in plain words ("multiply matching positions, add up"). |
| 4 | Scores turn into **percentages that add to 100%** (softmax). Bars grow/shrink; `guitar` wins. Caption defines *softmax* as "turn scores into percentages". |
| 5 | Each **Value** flies toward `it`, scaled by its percentage, and blends into one new vector — `it` now carries "guitar-ness". |
| 6 | **Zoom out:** every token does the same; the results form a 9×9 **heatmap** (rows = who is looking, columns = who is looked at). The `it` row is highlighted. |
| 7 | **Causal mask:** cells above the diagonal grey out ("no peeking at future words"), rows renormalise. Caption defines *causal mask* and says it's what generating models use. |

**Interactive:** the reader can **click any token as the query** (steps 1–6) and see its scores, percentages and blended output; a toggle switches the causal mask on/off in step 6–7.
**In YuE2:** a fact-callout: attention is the core operation inside YuE2's transformer backbone; the autoregressive part uses a causal mask (generic wording — do not give layer or head counts unless verified).
**New terms:** attention, query, key, value, score, softmax, heatmap, causal mask, context.
**Python Corner:** ~12 lines of pure-Python single-head attention over lists, then the same in ~5 lines of NumPy. *Runnable.* Output must match the numbers shown on screen (golden test, §11.3).

---

### W4 — Multi-head attention: "Several ways of looking at once"

**Analogy:** a film crew reviewing the same scene, each member watching for something different — the director watches the actors, the sound engineer watches the microphones — then they merge their notes.
**Breaks down:** nobody assigns the heads their jobs; they develop their own habits during training, and many are hard to describe in words.
**Data kind:** illustrative (4 hand-authored heads) **plus**, if the optional export (§12) is done, a toggle to view **real** heads from a small model.

**Steps**

| Step | Scene change |
|------|--------------|
| 0 | Recap: the single heatmap from W3, now labelled "one head". |
| 1 | The heatmap **splits into 4 smaller ones** (Motion `layout`). Caption defines *head*. |
| 2 | The 4 heatmaps sit side by side with the sentence on both axes. Different patterns are visible. |
| 3 | Each head gets a label card describing its *tendency* in plain words (e.g., "looks one word back", "links pronouns to nouns", "pays attention to the sentence start", "links verbs to their subjects"). Labelled as illustrative. |
| 4 | Hovering any cell in one head highlights the same row in all heads — the same word, different views. |
| 5 | The four outputs for `it` **merge** (concatenate then mix) into one vector — the token's updated representation. Caption: "Many small views, one combined result." |

**Interactive:** hover/tap a cell or a token to highlight across heads; a switch to **Real data (GPT-2 small, layer N)** appears only if real data was exported. When showing real data the badge must say *"Heads picked for visual variety; real heads rarely have clean, human-readable roles."*
**In YuE2:** generic callout only (heads exist in its transformer; exact count only if verified).
**New terms:** head, multi-head attention, concatenate.
**Python Corner:** a 15-line loop that runs the W3 attention function for several heads and joins the results. *Runnable.*

---

### W5 — The transformer block: "How the pieces connect"

**Analogy:** an **assembly line with a conveyor belt**. Each token rides the belt as a document; each station *adds notes* to it but never removes the original. The same line is repeated many times.
**Breaks down:** a real model's "stations" don't have human-readable job titles; all are learned numbers.
**Data kind:** illustrative diagram (no numbers beyond placeholders). The only *Fact about YuE2* is "a transformer backbone is used".
**Implementation note:** this is the one widget that should use a **paused GSAP timeline** scrubbed by `step`, because several arrows and chips move in parallel.

**Steps**

| Step | Scene change |
|------|--------------|
| 0 | Input: token chips + IDs enter on the left. |
| 1 | **Embedding** station: IDs become vectors (callback to W2). |
| 2 | **Position stamp** station: each vector gets a note of where it sits in the sequence. Caption explains why order matters ("dog bites man" ≠ "man bites dog"); define *positional information* in plain words. |
| 3 | **Attention** station (callback to W3/W4): arrows between tokens; its result is **added** back onto the belt (a bypass lane labelled "shortcut / residual connection" carries the original). |
| 4 | **Tidy-up** station: numbers are rescaled to a comfortable range (*normalisation*). Caption: "like keeping all volumes at a similar level". |
| 5 | **Feed-forward** station: each token is processed **alone** by a small two-layer network. Caption contrasts with attention: "attention = tokens talk to each other; feed-forward = each token thinks by itself". Again result is added onto the belt. |
| 6 | **Stack:** the whole block shrinks and is repeated N times (the label says "many blocks" — a number only if verified). Caption: early blocks notice simple patterns, later blocks combine them. |
| 7 | **Output:** the last token's vector goes through a final station that produces **a score for every item in the vocabulary** — leading to W6. |

**Interactive:** clicking a station opens a small popover: what goes in, what comes out, which earlier section explained it. A "show shapes" toggle displays the list-of-numbers length as a plain count (e.g., "9 tokens × 8 numbers each", toy values).
**In YuE2:** callout: YuE2's backbone is a transformer (fact); the specific "AR–NAR Mixture-of-Transformers" name is shown as a fact with the plain-words explanation limited to what §4.2 verifies.
**New terms:** transformer, block/layer, residual connection, normalisation, feed-forward network, positional information, logits (defined as "raw scores").
**Python Corner:** a ~15-line `transformer_block(x)` using stub functions for each station, showing the order of operations and the `x = x + attention(x)` shortcut pattern. *Runnable* (stubs return simple lists; comments make clear it's a skeleton, not a trained model).

---

### W6 — Choosing the next token: "Rolling weighted dice"

**Analogy:** weighted dice. The model assigns each possible next token a weight; temperature changes how adventurous the dice are; top-k/top-p remove unlikely faces; the seed decides where the dice start rolling.
**Breaks down:** unlike real dice, the model builds the weights fresh each time from the whole context.
**Data kind:** illustrative (a toy set of 8 candidate next tokens with hand-authored raw scores).

Context: `Sunlight on the kitchen ___`.

**Steps**

| Step | Scene change |
|------|--------------|
| 0 | The 8 candidates (`floor`, `table`, `window`, `light`, `wall`, `sink`, `dream`, `purple`) with **raw scores** as bars (can be negative). Caption defines *logits* as raw scores. |
| 1 | Scores convert to **probabilities** (softmax callback) — bars turn into percentages adding to 100%. |
| 2 | **Temperature slider** appears. Low = bars sharpen toward the leader; high = bars flatten. Caption defines *temperature*. |
| 3 | **Top-k** control: faces beyond the k-th most likely fade out; remaining probabilities renormalise. Caption defines *top-k*. |
| 4 | **Top-p** control: keep the smallest set of faces whose probabilities add to p. Caption defines *top-p*. |
| 5 | **Roll!** button picks a token using the seeded RNG; the winner chip slides into the blank. A "same seed → same roll" demonstration: *Reset* + *Roll* gives the same token; changing the seed changes it. Callout (*Fact about YuE2*): `seed=` exists. |
| 6 *(optional; cut if over budget)* | **Guidance:** two sets of bars — "with the prompt" and "without" — blended by a *guidance strength* slider using `uncond + scale * (cond - uncond)`. Callout (*Fact about YuE2*): `cfg_scale` is YuE2's text-guidance setting. Caption defines *classifier-free guidance* in plain words ("push the model harder toward what the prompt asks"). |

**Interactive:** sliders for temperature (0.1–2.0), top-k (1–8), top-p (0.1–1.0), a seed input, and the Roll / Reset buttons. All computed by pure `lib/ml` functions (`applyTemperature`, `softmax`, `topK`, `topP`, `sample(rng)`).
**New terms:** logits, probability distribution, sampling, temperature, top-k, top-p, seed, guidance (CFG).
**Python Corner:** `softmax`, temperature scaling, top-k, and `random.Random(seed).choices(...)` in ≤ 20 lines. *Runnable.* Output for the same inputs must match the widget.

---

### W7 — The generation loop: "One token at a time, over and over"

**Analogy:** phone autocomplete on repeat — pick a word, add it, ask again with the longer sentence.
**Breaks down:** autocomplete keyboards use tiny models; here each step re-reads the whole context through the full stack of transformer blocks.
**Data kind:** illustrative (a scripted toy "next-token table" built from a tiny hard-coded probability table keyed by the previous token; deterministic given the seed).

**Steps**

| Step | Scene change |
|------|--------------|
| 0 | A **prompt** row of token chips (`Sunlight on the`). A big box labelled "the model" with a small footnote "= W1 → W5 stacked". |
| 1 | The prompt enters the model; output is a probability bar chart (W6 callback, compact). |
| 2 | One token is sampled and **appended** to the row (chip slides in at the end). |
| 3 | The longer row is **fed back** into the model (loop arrow animates). |
| 4 | Loop repeats 3 more times, auto-playing with a visible step counter, until a **stop token** (`<end>`) is sampled. Caption defines *stop token* and *autoregressive*. |
| 5 | **The result:** the finished sequence, with a timeline strip showing each decision. Reader can click any earlier decision to see the bars it came from. |
| 6 | **Zoom to YuE2** (*Fact about YuE2* callouts only): the same loop writes YuE2's score and its semantic tokens ("rough draft"); the next stage works differently — acoustic detail is refined in several passes rather than one token at a time (non-autoregressive, flow matching), so it is **not** a W7-style loop. No toy animation for flow matching in this version; show a simple labelled diagram only. |

**Interactive:** *Play / Pause / Step* buttons, a speed control, a seed input, and temperature (shared with W6 style). **Reset + same seed reproduces the identical sequence**; a different seed gives a different one.
**New terms:** autoregressive (AR), stop token, non-autoregressive (NAR), flow matching (named only, one-sentence plain definition), context window.
**Python Corner:** a `generate(prompt, seed)` loop of ≤ 15 lines using `random.Random(seed)` and the toy table. *Runnable.* Also include, as a **verbatim copy** from the model card, the `YuE2Pipeline` usage snippet if and only if you can fetch it from the model card at build time; tag it `needs-gpu` with the header comment `# Requires: Linux, 24GB NVIDIA GPU` and **do not execute it in tests**. If you cannot fetch it, omit it.

---

### Epilogue — "What this page didn't show" (text only, with small static diagrams)

- Training in two paragraphs (the model guessed, measured how wrong it was, nudged its numbers, billions of times) — no widget.
- Why music is harder than text (long structure, many audio samples per second → hence the stages, as in the fact register).
- Limits: it predicts patterns, can produce confident nonsense (e.g., sung words not matching lyrics), and is not a composer with intent.
- License note, links to the model card, the two papers, and the demo page (verify each link is live at build time).
- "Where to go next" (only verified-live links).

### Glossary page

Alphabetical, searchable. Each entry: plain definition, analogy, "first seen in section X" link. See §14 for the seed list.

---

## 9. Section Template (Required Structure)

Each section is a typed content module so structure can be linted.

```ts
interface ConceptSection {
  id: "tokenization" | "embeddings" | "attention" | "multihead" | "block" | "sampling" | "loop";
  title: string;                       // e.g. "Self-attention: who should I listen to?"
  hook: string;                        // one question or surprising fact, ≤ 25 words
  analogy: { title: string; body: string; breaksDown: string };   // breaksDown REQUIRED
  dataKind: "illustrative" | "real-small-model" | "yue2-fact";
  steps: {
    caption: string;                   // ≤ 40 words, plain language
    liveCaption: string;               // the aria-live description of what is on screen
    newTerms?: string[];               // glossary keys introduced at this step
  }[];
  inYuE2: { text: string; factIds: string[] };   // each factId must exist & be verified
  pythonCorner: { title: string; file: string; tag: "runnable" | "needs-gpu" }[];
  recap: string[];                     // 3 bullets
  quiz: {                              // exactly 2 questions per section
    question: string; options: string[]; answerIndex: number; explanation: string;
  }[];
}
```

**On-screen order inside a section:** Hook → Analogy box → scroll-driven steps with widget → **In YuE2** card → Python Corner → Recap → 2-question quiz → "Next section" link.

---

## 10. Shared Components

| Component | Requirement |
|-----------|-------------|
| `Term` | Dotted underline; popover on hover, focus and tap with a 1–2 sentence plain definition + "More in glossary". Keyboard focusable, `aria-describedby`, touch-friendly. |
| `AnalogyBox` | Two columns on desktop (analogy / "where it breaks"); stacked on mobile. |
| `DataBadge` | Implements §6.4. Required on every widget stage. |
| `StepControls` | Prev / Next buttons, scrubber with step ticks, step counter ("3 / 8"), keyboard support; identical in all widgets. |
| `WidgetStage` | Sticky container; provides `step`, error boundary, lazy mount, reduced-motion flag, live caption region. |
| `PythonCorner` | Copy button; tag "▶ Runnable anywhere" or "⚠ Needs a 24 GB GPU"; optional line-by-line annotations on hover/focus. |
| `YuE2Link` | The "In YuE2" card with green *Fact about YuE2* badge, plus "Source: model card / paper §x" links. |
| `Quiz` | Immediate explanations, retry allowed, result stored in `localStorage`. |
| `ProgressRail` | Side rail with the 7 sections, current section highlighted, click to jump. |

---

## 11. Python Policy and the Golden Cross-Check

### 11.1 Python snippets

- Every `runnable` snippet lives in `src/content/python/*.py`, runs on **stock Python 3.10+ with the standard library only** (NumPy only where a section says so), and has a matching `*.expected.txt`.
- Clear names, plain-English comments, no one-letter variables except loop indices.
- `needs-gpu` snippets are verbatim from the model card, never executed.

### 11.2 CI runs the snippets

`scripts/run-python-snippets.ts` executes every runnable snippet and compares stdout to `*.expected.txt`. The build fails on mismatch.

### 11.3 Golden cross-check (TS ↔ Python)

For W3 and W6, store a **fixture** (`tests/fixtures/golden-attention.json`, `golden-sampling.json`) with inputs and expected outputs. A test asserts that **both** the TypeScript functions in `lib/ml/` and the Python snippets produce the fixture's numbers (±1e-6). This guarantees that what the reader sees animated is identical to what the reader can run.

---

## 12. Optional: Real Data Export (Python), Milestone M5 only

The app **must ship fully working with illustrative data first.** Only after M4 is complete may the agent add this.

Create `tools/export_attention.py` (README included; not run in CI):

- Load a small open model with Hugging Face `transformers` (e.g., `gpt2`, 124M parameters). Use eager attention (`attn_implementation="eager"`) with `output_attentions=True` so attention weights are returned.
- Run it on the sentence `The singer dropped the guitar because it was heavy`.
- Pick one layer and **4 heads chosen for visible variety**. Record the layer, head indices, and the selection rationale in `meta`.
- Convert tokens for display with `tokenizer.decode([id])` per token (so the reader sees clean text, not raw byte-level symbols).
- Write JSON matching §6.3 with `dataKind: "real-small-model"`, `meta.model`, `meta.generatedBy`, and `meta.generatedAt`.
- Optional second script `tools/export_embeddings.py`: export ~20 token embeddings (reduced to 8 numbers and to 2D by a standard method such as PCA; document the method in `meta`) for W2.

Rules: real data is **always** badged *Real data from a small stand-in model — not YuE2*. The app may never imply it came from YuE2. If the heads look messy, show them as they are and say so; do not hand-edit exported numbers.

---

## 13. Quality Bar & Tests (Definition of Done)

### 13.1 Automated checks (must pass in CI)

1. `npm run lint` and `tsc --noEmit` pass.
2. **Unit tests for `lib/ml/`:** softmax sums to 1 and handles large/negative values stably; temperature → 0 approaches argmax; top-k and top-p behave on edge cases; `sample` with the same seed returns the same sequence; causal mask zeroes future cells and rows renormalise; tokenizer round-trips text.
3. **Scene-function tests:** for every widget, `getSceneState` at **every step** returns the expected visible elements (e.g., "W3 step 4: weights sum to 1; `guitar` has the highest weight for query `it`"). Test that step *n → n+1 → n* returns identical state (backwards navigation works).
4. **Data tests:** every `data.json` passes its zod schema and the §6.3 validation rules (rows sum to 1, causal zeros, required `meta` fields for `real-small-model`).
5. **Component tests:** each widget renders with `data-testid`, a `DataBadge`, a non-empty live caption at every step, and Prev/Next/keyboard controls change the step.
6. **Glossary lint (`scripts/check-glossary.ts`):** every `newTerms` key has a glossary entry (plain definition + analogy); the first use of every glossary term in a section's text is wrapped in `<Term>`; none of the "jargon watch list" (e.g., *logits, embedding, softmax, attention, transformer, token, autoregressive, flow matching, CFG, residual*) appears in a section *before* the step that defines it.
7. **Caption lint:** every step caption ≤ 40 words; every section has `breaksDown`; every quiz has an explanation.
8. **Facts lint:** every numeric claim about YuE2 references a `facts.ts` id with `verified: true`.
9. **Python snippet tests and golden cross-check** (§11).
10. **Playwright:** (a) scroll through each section and assert the widget's step advances with the beats; (b) click Next/Prev and assert the page scrolls to the matching beat; (c) keyboard arrows work; (d) deep link `#attention?step=4` opens at step 4; (e) a 375 × 667 viewport run with no horizontal scroll; (f) with `prefers-reduced-motion: reduce`, assert no transition is running and final states render.
11. **Accessibility:** `axe-core` has zero serious/critical violations on the page; full keyboard operability; WCAG AA contrast; visible focus; live captions present.
12. **Performance:** Lighthouse performance ≥ 90 desktop; widgets lazy-loaded; no off-screen animation running (assert via a test hook that counts active animations).

### 13.2 Agent self-review (write `REVIEW.md`)

- [ ] Could a junior Python developer with no ML background follow each section without leaving the page?
- [ ] Does every analogy have a "where it breaks"?
- [ ] Does every widget show a correct `DataBadge`?
- [ ] Is every number shown in W3/W6/W7 the same as the Python snippet's output?
- [ ] Does going backwards in every widget work as well as going forwards?
- [ ] Is the license notice visible in the hero and footer?
- [ ] Are all statements about YuE2 traceable to `facts.ts` with `verified: true`?

### 13.3 Rubber-Duck Test

Write 8 questions in `tests/comprehension.md` (e.g., *"Why does 'it' get a high weight on 'guitar'?"*, *"What does temperature change?"*, *"Why does the same seed give the same output?"*, *"Why are blocks stacked?"*). Each must be answerable using only the page. For each, record the section and step where the answer appears.

---

## 14. Glossary Seed List (each needs a plain definition + analogy)

*model, parameter, generative AI, token, tokenizer, vocabulary, ID, ABC notation, waveform, embedding, vector, dimension, similarity, attention, self-attention, query, key, value, score, dot product (as "multiply matching positions, add up"), softmax, probability, heatmap, causal mask, context / context window, head, multi-head attention, concatenate, transformer, block / layer, residual connection, normalisation, feed-forward network, positional information, logits, sampling, temperature, top-k, top-p, seed, classifier-free guidance (CFG), autoregressive (AR), non-autoregressive (NAR), stop token, flow matching, semantic tokens, acoustic latents, VAE, backbone, Mixture-of-Transformers, training, loss, inference, kHz, stereo, CC BY-NC 4.0.*

(Terms from the last row group are only mentioned in the hero, W5–W7 callouts, and the epilogue; define each in one plain sentence there.)

---

## 15. Build Plan for the Agent

Work in milestones; commit after each; keep a running `PROGRESS.md`.

| Milestone | Deliverable |
|-----------|-------------|
| **M0 – Research & plan** | Read the model card and arXiv 2609.33757. Complete `facts.ts` (each item `verified: true/false`, with source URL and section). Write `docs/research-notes.md` (≤ 1 page) listing anything the paper contradicts in this spec. Write `docs/decisions.md` with installed versions. |
| **M1 – Skeleton** | Vite project, theme, page shell, `useWidgetStep`, `WidgetStage`, `StepControls`, `DataBadge`, `Term`, glossary scaffold, scroll-to-step mapping working with a **dummy widget**, deep links, reduced-motion handling, lint scripts wired into CI. |
| **M2 – Math core** | `lib/ml/` (softmax, dot, attention, temperature, topK, topP, sample, tokenizer), `rng.ts`, golden fixtures, Python snippets, and all their tests. **No UI yet** — this makes the visuals trustworthy. |
| **M3 – Widgets W1–W4** | Content and widgets for tokenization, embeddings, attention, multi-head, each with scene tests, component tests, Python Corner and quiz. |
| **M4 – Widgets W5–W7 + wrap-up** | Transformer block (GSAP timeline), sampling, generation loop, hero, epilogue, glossary, footer, all tests green. |
| **M5 – Polish (and optional real data)** | Accessibility and performance pass, cross-device check at 375 px, `REVIEW.md`, `tests/comprehension.md`, README (install, run, build, deploy, credits). *Optionally* the §12 export tools and the real-data toggles. |

### Rules of engagement for the agent

- Prefer simple, readable code; the codebase is also a teaching artifact. Comment non-obvious logic, especially the pure `getSceneState` functions.
- Don't add dependencies beyond §5.2 without recording why in `docs/decisions.md`.
- Keep animation logic out of `lib/ml/`; keep math out of components.
- If a fact can't be verified, degrade gracefully (generic wording) rather than guess.
- If something in this spec is ambiguous, choose the simpler, more beginner-friendly option and record the decision in `docs/decisions.md`.
- Never claim to have run the real YuE2 model or listened to audio; you can't. Use only documented facts.
- If a widget threatens to become too complex, simplify the scene (fewer elements, shorter steps) rather than adding libraries.

---

## 16. Legal & Attribution

- Show "YuE2 by M-A-P — weights licensed CC BY-NC 4.0 (non-commercial)" in the hero and footer.
- Cite arXiv 2609.33757 and arXiv 2503.08638, plus links to the model card, code repository and demo page.
- If real small-model data is used (§12), credit the model and its license in the footer.
- State clearly: *"This app is an independent educational project and is not affiliated with M-A-P or Hugging Face."*
- Do not copy lyrics, ABC scores, or long text from the model card or demo pages; use the original examples in §3.
- If any demo audio is added later, it must follow the model card's license terms, credit "Generated by YuE2 — M-A-P", and remain non-commercial. (Not required in this version.)

---

## 17. Out-of-Scope Ideas for Later (do not build now)

- A 3D embedding-space or "fly through the layers" view (Three.js / React Three Fiber) — the one place a 3D engine might earn its keep.
- A flow-matching ("noise → sound") interactive widget and a VAE compression widget.
- A training widget (gradient descent on a toy problem).
- A tiny in-browser model trained on ABC tunes.
- Pre-rendered explainer videos (Manim or Remotion).
- Translations (Arabic, Chinese).
