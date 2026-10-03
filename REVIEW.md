# Agent Self-Review Checklist

- [x] **Could a junior Python developer with no ML background follow each section without leaving the page?**
  Yes. Every technical term is explained on first appearance with `<Term>` popovers and plain-English analogies (LEGO catalogue, city map, library search, film crew, conveyor belt, weighted dice, autocomplete).
- [x] **Does every analogy have a "where it breaks"?**
  Yes. Every section has an `AnalogyBox` with a non-empty, required `breaksDown` explanation distinguishing human intent from mathematical operations.
- [x] **Does every widget show a correct `DataBadge`?**
  Yes. Every widget stage prominently displays honest data badges: *Illustrative* (amber), *Real stand-in* (blue), or *Fact about YuE2* (green).
- [x] **Is every number shown in W3/W6/W7 the same as the Python snippet's output?**
  Yes. W3 dot products, softmax weights, and winner ("guitar") match the runnable Python snippet and golden fixtures. W6 logits, top-k filtering, and seed=42 roll ("floor", prob: 0.548) match the Python script output exactly.
- [x] **Does going backwards in every widget work as well as going forwards?**
  Yes. Visuals are pure functions `getSceneState(step, data, controls)`. Navigating n → n-1 → n returns identical, deterministic visual states.
- [x] **Is the license notice visible in the hero and footer?**
  Yes. "YuE2 by M-A-P — weights licensed CC BY-NC 4.0 (non-commercial)" is prominently displayed in both the Hero banner and the site Footer, along with the disclaimer that this is an independent educational explainer.
- [x] **Are all statements about YuE2 traceable to `facts.ts` with `verified: true`?**
  Yes. All facts cited in the UI and In YuE2 cards link directly to verified entries in `src/content/facts.ts` with paper/model card source citations.
- [x] **Does the design comply with the Universal Frontend Design Constitution?**
  Top bar follows the 3-zone contract, no pill enclosures for static metadata, clean typography, anti-slop rules enforced, WCAG AA contrast, and full keyboard navigation.
