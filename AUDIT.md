# AUDIT.md — "Inside a Music AI" Hardening Audit

**Auditor:** Hardening Agent
**Date:** 2026-10-03
**Build Spec:** `genai-visual-explainer-spec.md`
**QA/Deploy Spec:** `genai-visual-explainer-qa-deploy-spec.md`

---

## Phase 0 — Recon & Baseline

### Environment

| Item | Value |
|------|-------|
| Node | v20.19.0 |
| npm | 10.8.2 |
| Python | 3.13.15 (spec requires 3.10+; OK) |
| Firebase CLI | present at `/tools/node/bin/firebase`, authenticated as `ghurbal.akbar@gmail.com` |
| Repo | `inside-a-music-ai`, git commit `6d60c17` (Initial Commit), only the two spec files untracked |

### Baseline commands

| Check | Command | Result |
|-------|---------|--------|
| Install | `npm install` | ❌ initially failed: `vite@8.3.2` requires `esbuild ^0.27||^0.28`, root pinned `esbuild ^0.25.0`. **Fixed (baseline-only):** removed unused deps `esbuild`, `express`, `@types/express`, `dotenv`, `@google/genai` (spec §5.2 forbids a backend; none were imported). Install then ✅ |
| Lint / type-check | `npm run lint` (`tsc --noEmit`) | ✅ passes, **but `tsconfig.json` has no `"strict": true`** (violates Build Spec §5.2) |
| Unit tests | `npx tsx scripts/run-tests.ts` | ✅ 153 passed / 0 failed — **but this is a hand-rolled assert harness, not Vitest; not wired to `npm test`; no coverage; many assertions vacuously pass (`assert(true, ...)`)** |
| Build | `npm run build` | ✅ builds, but **one JS chunk 611.09 kB / 185.65 kB gzip; no code splitting**, no lazy widget chunks |
| Preview | `npm run preview` | ✅ runs |
| Playwright | `npx playwright` | ❌ **not installed**; no `tests/e2e` |
| axe-core | — | ❌ **not installed** |
| Python snippets | `src/content/python/` | ❌ **directory/file do not exist**; snippets are inline TS strings only, never executed |
| Firebase config | `firebase.json` / `.firebaserc` | ❌ **missing** |
| CI | `.github/workflows/` | ❌ **missing** |

### Baseline test inventory (as found)

| Layer | Tool | Count |
|-------|------|-------|
| ML unit | custom `scripts/run-tests.ts` | ~30 asserts |
| Golden cross-check | custom harness (TS only) | 8 asserts |
| Scene | custom harness | ~5 asserts |
| Data/schema | custom harness (zod parse only) | 7 asserts |
| Component | none | 0 |
| Content lint | partially inside harness | ~100 asserts |
| Python | none | 0 |
| E2E / a11y / perf | none | 0 |

### Known gaps to hunt (spec §1.3)

Confirmed present in this repo:
- ❌ Scroll ↔ step: observer is re-created on every `step` change and `onStepChange` always `scrollIntoView`s → oscillation risk.
- ❌ Animations that break backwards / order-dependence: not yet proven; no scene round-trip test for W2/W4/W5/W7.
- ❌ StrictMode double-mount: `main.tsx` does **not** wrap in `StrictMode` (so gap is latent, and effects are uncleaned in several widgets).
- ❌ Widgets animate off-screen: W1 audio waveform `repeat: Infinity` runs regardless of visibility.
- ❌ Horizontal overflow / sticky stage at 375 px: not yet tested.
- ⚠️ DataBadges: present on every `WidgetStage`, but W5 asserts invented numbers ("24 to 32" blocks, "32,000+" tokens) as if factual.
- ❌ Jargon-before-definition: glossary lint does not exist; `<Term>` is rendered in a "New Terms" chip row, not wrapping first in-text use.
- ❌ Missing "where the analogy breaks": all present (checked in harness).
- ❌ Tests shallow/vacuous (see above).
- ❌ Python snippets' real output no longer matches page (not runnable; several expected outputs are mathematically wrong — see Phase 2).
- ⚠️ Dead code / unused deps: removed 5 unused deps in baseline; `bun.lock` remains but `package-lock.json` was generated.
- ❌ No Firebase configuration.

---

## Phase 1 — Spec-Conformance Matrix

Status legend: ✅ conforms · ⚠️ partial · ❌ missing/broken · ➖ N/A

### Stack (Build Spec §5.2)

| Requirement | § | Status | Evidence | Action |
|---|---|---|---|---|
| Vite + React + TS | 5.2 | ✅ | builds | — |
| TypeScript `strict` | 5.2 | ❌ | `tsconfig.json` no `strict` | enable strict, fix errors |
| Tailwind CSS + CSS vars, light/dark | 5.2/5.3 | ❌ | dark-only, hard-coded `slate-950`, no theme toggle; `index.css` is only `@import "tailwindcss"` | add theme tokens + toggle |
| Motion (`motion/react`) | 5.2 | ✅ | used in widgets | — |
| GSAP + `@gsap/react` for W5 scrubbable timeline | 5.2 | ❌ | W5 uses Motion only; GSAP imported nowhere | either implement GSAP W5 timeline or record deviation |
| Canvas 2D for grids >1000 cells | 5.2 | ➖ | largest grid is 9×9=81 (legitimately SVG) | — |
| `d3-scale` / `d3-interpolate` only | 5.2 | ➖ | not needed / not installed | — |
| Native IntersectionObserver hook | 5.2 | ⚠️ | observer lives in `SectionContainer`, not `useWidgetStep`; recreated per step | centralize in hook |
| `zod` validation | 5.2 | ✅ | schemas parse all data.json | — |
| No Three.js/Lottie/Redux | 5.2 | ✅ | none present | — |

### Sections & order (§8, §5.3)

| Requirement | Status | Evidence | Action |
|---|---|---|---|
| Hero → W1–W7 → Epilogue → Glossary → Footer | ⚠️ | all present in order; glossary is a modal, not a page/section. Acceptable interactive deviation — record in decisions | record |
| Hero pipeline strip + license + legend | ⚠️ | present; legend/badges present | — |
| Prominent license line in hero & footer | ✅ | both present, "CC BY-NC 4.0" | — |
| Non-affiliation statement | ✅ | Footer | — |
| Epilogue training / limits / links | ✅ | present; 4 external links | verify 200 |

### Widget contract (§6.1)

| Requirement | Status | Evidence | Action |
|---|---|---|---|
| `WidgetProps` shape (`step`,`stepCount`,`data`,`controls`,…) | ⚠️ | widgets take only `{step, stepCount, reducedMotion}`; data is imported, not passed | acceptable but data not injectable for tests |
| Pure `getSceneState(step,data,controls)` | ✅ | every widget has one | — |
| No internal timers | ✅ | none found | — |
| `data-testid="widget-<id>"` | ✅ | on `WidgetStage` | — |
| Live caption `aria-live="polite"` every step | ✅ | `WidgetStage` | — |
| Error boundary per widget | ❌ | `hasError` state never set; no React error boundary → a widget render crash white-screens app | add ErrorBoundary in `WidgetStage` |
| Lazy-loaded (`React.lazy`) + mount at ≥30% visible | ❌ | all widgets statically imported in `App.tsx`; single bundle | add lazy + in-view mount |
| Backwards correctness | ⚠️ | pure functions, but no round-trip tests for 5/7 widgets | add scene round-trip tests |

### Data & badges (§6.3, §6.4)

| Requirement | Status | Evidence | Action |
|---|---|---|---|
| Every data.json has `schemaVersion`, `meta.dataKind` | ✅ | all 7 | — |
| zod at load time | ✅ | each widget parses | — |
| Attention rows sum to 1 (±1e-6) | ❌ | W4 head 0, row 8 (`heavy`) sums to **1.05**; no refinement in schema | fix data + add refinement |
| Causal zeros when declared | ⚠️ | W4 has no `causal` flag and is fully lower-triangular by construction, but rows not validated | add validation |
| `real-small-model` requires model+generatedBy | ➖ | no real data used (optional §12) | — |
| Correct `DataBadge` on every widget | ⚠️ | present; W4 badge text says "specialized attention heads" while section step 3 mislabels Head 3 as "musical tempo cues" | reconcile labels |

### Scroll mechanics (§5.3)

| Requirement | Status | Evidence | Action |
|---|---|---|---|
| Desktop two-column sticky stage | ✅ | `lg:grid-cols-12`, `sticky top-16` | — |
| Mobile stage sticky ~45vh | ⚠️ | stage is sticky top but `order-1` puts it above beats; no 45vh sizing; not verified at 375 | test & fix |
| Beat ↔ step via observer | ⚠️ | works, but observer re-created each step; `scrollIntoView` on every change | guard/centralize |
| Prev/Next/scrubber | ✅ | `StepControls` | — |
| Keyboard ←/→/Home/End | ✅ | `WidgetStage` keydown | — |
| Deep links `#attention?step=3` | ⚠️ | parses on mount/hashchange; does **not** scroll section into view on load; invalid values ignored (OK) | test & fix initial scroll |
| Progress rail (7 sections, current highlighted) | ✅ | `ProgressRail` (desktop `xl` only) | — |
| Reduced motion: snap, caption updates | ❌ | when `reducedMotion`, `SectionContainer` **disables the observer entirely**, so scrolling never changes step; `scrollIntoView` always smooth | fix |
| Light/dark themes + toggle | ❌ | dark only | add |

### Motion rules (§7)

| Requirement | Status | Evidence | Action |
|---|---|---|---|
| 300–800 ms transitions, ease-out | ✅ | mostly 0.3–0.4 s | — |
| Transform/opacity only (or Motion layout) | ⚠️ | W1 audio animates `height`; W2 bars animate `height`; W5 belt animates `width` without `layout` | acceptable-ish; W1 waveform infinite |
| Consistent visual vocabulary & Q/K/V colours | ⚠️ | colours defined in `visual-language.ts`; W3 honour it; not everywhere | record |
| Colour never sole meaning | ✅ | labels/numbers accompany | — |
| Only in-view widget animates; off-screen paused/unmounted | ❌ | all mounted; W1 waveform loops forever | add in-view gating |
| Initial JS < 250 KB gzip | ⚠️ | 185.65 kB gzip currently, but in one chunk and no lazy loading | code-split |
| Lighthouse perf ≥ 90 | ❓ | not measured | measure in Phase 6 |

### Content template (§9)

| Requirement | Status | Evidence |
|---|---|---|
| hook ≤ 25 words | ✅ | harness checks |
| analogy + required `breaksDown` | ✅ | all 7 |
| caption ≤ 40 words | ✅ | harness checks |
| `inYuE2.factIds` exist & verified | ✅ | harness checks |
| Python Corner runnable/needs-gpu | ⚠️ | inline only, not executed, several outputs wrong |
| exactly 3 recap bullets | ✅ | — |
| exactly 2 quiz Qs with explanations | ✅ | — |

### Legal (§16)

| Requirement | Status |
|---|---|
| License in hero + footer | ✅ |
| Non-affiliation | ✅ |
| Cite both papers, model card, repo, demo | ⚠️ Epilogue cites papers/model card/demo; **code repo link absent** |
| No copied model-card text | ⚠️ `needs-gpu` snippet is **not** verbatim from the current model card and uses a fabricated API |

### Deployment (§10 of QA spec)

| Requirement | Status |
|---|---|
| `firebase.json` / `.firebaserc` | ❌ missing |
| `deploy:preview` / `deploy` scripts | ❌ missing |
| Preview → live procedure | ❌ not set up |
| Target site safe | ❌ **`inside-yue2-3b` already hosts different content** (title "How Does Generative AI Make Music? — Inside YuE2-3B"). STOP before live |

---

## Final status

_(to be updated as phases complete)_
