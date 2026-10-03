# Spec: QA, Hardening & Firebase Deployment of the "Inside a Music AI" Visual Explainer

> **Audience of this document:** a second AI coding agent (the **Hardening Agent**).
> **Your job in one sentence:** take a repository that a first agent built to roughly 8/10, audit it against its build spec, fix what is broken, write the tests that prove it works, and deploy it to Firebase Hosting at 10/10.

---

## 1. Context (read this first)

### 1.1 What the app is

A **single-page, scroll-driven React app** (Vite + React + TypeScript, Tailwind, Motion, a little GSAP, Canvas for big heatmaps) that teaches how generative AI works through **7 animated, interactive widgets**: tokenization, embeddings, self-attention, multi-head attention, the transformer block, next-token sampling, and the generation loop. The running example is the open-source AI music model `m-a-p/YuE2-3B`. The audience is **junior Python developers with no ML background**.

### 1.2 Your inputs

| Input | Location |
|-------|----------|
| The repository built by the first agent | Provided by the human (local path or Git URL) |
| **The Build Spec** (the document the first agent followed) | `genai-visual-explainer-spec.md`, provided alongside this document. Section numbers in this document (e.g. "Build Spec §6.1") refer to it |
| Firebase project ID and Hosting **site ID** | Provided by the human. See §10. If missing, ask before deploying |

**The Build Spec is the acceptance standard.** The first agent probably deviated from it in places. Your audit finds the deviations; you decide, per case, whether to fix the code or (rarely, and with justification) record a deliberate deviation.

### 1.3 Expected state of the repo

Assume: it mostly runs; the main flow works; there are gaps. Typical gaps for this kind of project (hunt for these first):

- Scroll ↔ step synchronization glitches (steps flicker, fight with Prev/Next, skip, or lag on mobile).
- Animations that work forward but break **backwards**.
- React `StrictMode` double-mount problems (duplicated animations, leaked GSAP timelines, doubled observers).
- Widgets that animate while off-screen (wasted CPU, battery drain).
- Horizontal overflow at 375 px; sticky stage covering text on small screens.
- Missing or wrong `DataBadge`s; invented numbers presented as real.
- Jargon used before it's defined; missing `<Term>` wrappers; missing "where the analogy breaks".
- Tests that are shallow, snapshot-only, or pass vacuously.
- Python snippets whose real output no longer matches what the page says.
- Dead code, leftover dummy widgets, unused dependencies, console errors/warnings.
- No (or wrong) Firebase configuration; SPA routing, caching, and MIME-type issues after deploy.

---

## 2. Operating Principles

| # | Principle | Meaning in practice |
|---|-----------|---------------------|
| P1 | **Evidence before opinion.** | Every finding has a reproduction (command, URL + step, screenshot, failing test). Every fix has a test that failed before and passes after. |
| P2 | **Smallest fix that solves the root cause.** | No rewrites, no restyling, no "improvements" outside the audit scope. Fix causes, not symptoms. |
| P3 | **Never make tests green by weakening them.** | Do not delete, skip (`.skip`, `xfail`), loosen tolerances, or blindly update snapshots to pass. If a test is wrong, fix it **and** explain why in the bug log. |
| P4 | **Verify the tests themselves.** | Run mutation spot-checks (§6.5): deliberately break the code and confirm tests catch it. |
| P5 | **Preserve the teaching contract.** | The Golden Rules (Build Spec §2) outrank convenience. Never "fix" a failing content lint by deleting the content check. |
| P6 | **Honesty about YuE2.** | Never add or keep a claim about YuE2 that isn't in the verified fact register. If unsure, make the wording generic. |
| P7 | **Stay inside the stack.** | No new dependencies unless a bug cannot be fixed otherwise; record each in `docs/decisions.md`. Prefer removing dependencies. |
| P8 | **Log everything.** | Keep `AUDIT.md`, `BUGS.md`, `TEST_REPORT.md`, `DEPLOYMENT.md`, and `CHANGELOG.md` current as you work (formats in §11). |
| P9 | **Know when to stop and ask the human.** | See §12. Don't guess credentials, don't deploy over unknown content, don't make product decisions silently. |

---

## 3. Phase Plan

Work in order; commit after each phase (small, descriptive commits). Phases 1–7 may overlap in time, but the **baseline** (Phase 0) always comes first and the **deploy** (Phase 9) always comes last.

| Phase | Name | Output |
|-------|------|--------|
| 0 | Recon & baseline | `AUDIT.md` baseline section |
| 1 | Spec-conformance audit | Conformance matrix in `AUDIT.md` |
| 2 | Math-core verification | Verified `lib/ml/`, golden fixtures |
| 3 | Test suite hardening | Test gaps closed, `TEST_REPORT.md` |
| 4 | Browser QA & bug fixing | Playwright matrix green, `BUGS.md` |
| 5 | Accessibility | axe clean + manual keyboard/screen-reader checks |
| 6 | Performance & robustness | Budgets met |
| 7 | Content & honesty QA | Facts/jargon/links verified |
| 8 | Release hygiene | CI, deps, README, docs |
| 9 | Firebase deploy & live verification | Live URL + `DEPLOYMENT.md` |

---

## 4. Phase 0 — Recon & Baseline

1. **Set up:** clone/open the repo, read `README.md`, `PROGRESS.md`, `docs/decisions.md`, `docs/research-notes.md` (if they exist). Record Node and Python versions. Pin the Node version (`.nvmrc` and `engines` in `package.json`) if not pinned.
2. **Clean install and build:** `npm ci` (or `npm install` if there's no lockfile, then **commit the lockfile**), then run every script in `package.json`: lint, type-check, unit tests, build, preview, Playwright. Record exactly what passes, fails, or is missing.
3. **Run the app** (`npm run dev` and `npm run build && npm run preview`). Open it in a real browser through Playwright. Record: console errors/warnings, network failures, layout problems, first impressions per widget.
4. **Run every Python snippet** from `src/content/python/` on Python 3.10 and on the newest available Python.
5. **Write the baseline** to `AUDIT.md`: a table of checks with ✅ / ❌ / ⚠️ / "missing", plus a line count of tests per area. Do **not** fix anything yet except what blocks you from running (broken install, broken build). Log those fixes.

---

## 5. Phase 1 — Spec-Conformance Audit

Build the **conformance matrix** in `AUDIT.md`: one row per requirement, columns `Requirement | Build Spec § | Status | Evidence | Action`. Cover at minimum:

| Area | What to check |
|------|---------------|
| Stack | Only the allowed libraries (Build Spec §5.2); no Three.js, Redux, Lottie, etc.; TypeScript `strict`; versions recorded in `docs/decisions.md` |
| Sections | Hero, W1–W7, Epilogue, Glossary, Footer all exist, in the specified order |
| Steps | Each widget has the step count and the scene changes in the Build Spec §8 (or a recorded, justified deviation) |
| Widget contract | Every widget takes `WidgetProps` (§6.1), has a pure `getSceneState`, no internal timers, `data-testid="widget-<id>"`, error boundary, lazy loading, live caption |
| Data | Every `data.json` has `schemaVersion`, `meta`, a valid `dataKind`; zod schemas exist and are used at load time |
| Badges | Every widget shows a correct `DataBadge`; `real-small-model` data names the model; nothing illustrative is labelled "real" |
| Scroll mechanics | Sticky stage (desktop two-column; mobile top-stage), beats ↔ steps mapping, Prev/Next/scrubber/keyboard, deep links `#attention?step=3`, progress rail |
| Motion rules | Durations 300–800 ms; transforms/opacity only (or Motion `layout`); consistent visual vocabulary and colours across widgets; reduced-motion honoured |
| Content | Section template fields (hook, analogy with `breaksDown`, captions ≤ 40 words, `inYuE2` with fact ids, Python Corner, 3-bullet recap, 2-question quiz) |
| Legal | License notice in hero and footer; non-affiliation statement; papers and model-card citations |

Output of this phase: a prioritized **work list** (severity-ranked, see §8.1) feeding the later phases.

---

## 6. Phases 2–3 — Correctness and Test Hardening

### 6.1 Verify the math core (`src/lib/ml/`) independently

The visuals are only trustworthy if the math is right. Verify with **independent references**, not with the code's own outputs:

- **Softmax:** compare to a reference computed with Python (`math.exp`, subtract max) and NumPy; check large (1000) and very negative (-1000) inputs don't produce `NaN`/`Infinity`; output sums to 1.
- **Attention:** for the fixed Q/K/V in W3's data, compute scores, weights and output with a **separate NumPy script** you write; the TypeScript and the Python snippet shown in the app must both match (±1e-6). Confirm the scaling convention used (divide by √d or not) is **consistent** between TS, Python snippets, and the on-screen caption/formula.
- **Causal mask:** upper triangle exactly 0 after masking; each row re-sums to 1; row 0 attends only to itself.
- **Temperature:** `T → 0` approaches argmax; `T = 1` leaves softmax unchanged; very small `T` doesn't divide by zero (clamp or guard — verify the UI range).
- **Top-k / top-p:** boundary cases (`k=1`, `k ≥ n`, `p=1`, `p` tiny, ties); remaining probabilities renormalise; top-p keeps *at least one* token.
- **Sampling & RNG:** same seed ⇒ same sequence across runs and across page reloads; different seeds differ; `mulberry32` outputs stay in [0, 1); no use of `Math.random()` anywhere in widgets (grep for it).
- **Tokenizer:** greedy longest-match; round-trip `detokenize(tokenize(s)) === s`; unicode, empty string, long input, characters outside the vocabulary.
- **Golden fixtures:** `tests/fixtures/golden-*.json` exist; both TypeScript tests and the Python snippet runner assert against them. If missing, create them from your **independent** reference, then make both implementations pass.

Any discrepancy is a **Critical** bug (the page would be teaching wrong numbers).

### 6.2 The test pyramid you must end up with

| Layer | Tool | What it must cover |
|-------|------|--------------------|
| Unit | Vitest | Every function in `lib/ml/`, `rng.ts`, step-mapping utilities, deep-link parser, glossary/fact lookups |
| Scene | Vitest | `getSceneState(step, data, controls)` for **every widget at every step**; plus the **round-trip property**: state at step *n* is identical whether reached by 0→n or n→0 |
| Data | Vitest + zod | Every `data.json`: schema valid; attention rows sum to 1; causal zeros; `real-small-model` has `model` and `generatedBy` |
| Component | Vitest + React Testing Library | Each widget renders at every step with non-empty live caption and a `DataBadge`; controls change the step; `StrictMode` render doesn't duplicate nodes; unmount cleans up (no leaked timers/observers) |
| Content lint | Scripts in CI | Glossary lint, caption-length lint, facts lint, section-template completeness, broken internal anchors |
| Python | Script run in CI | Each runnable snippet's stdout equals `*.expected.txt`; golden cross-check |
| End-to-end | Playwright | Matrix in §7.1 |
| Accessibility | axe-core inside Playwright | Page-level and per-step checks (§9) |
| Post-deploy | Playwright with `BASE_URL` | Smoke + headers + console check against the live site (§10.6) |

**Rules for new tests:**

- Assert **behaviour and values**, not just "it renders". No `expect(true)`, no snapshot-only widgets. Snapshots are allowed only for pure scene-state objects, and each must be reviewed by you.
- Tests are **deterministic**: seeded RNG, `reducedMotion` or fake timers where animations would otherwise make them flaky; no arbitrary `sleep`s — wait on conditions (`expect.poll`, `toHaveAttribute`, role-based locators).
- Use stable selectors: roles and `data-testid`, never CSS class names.
- Name tests as sentences describing the behaviour.

### 6.3 Coverage targets

- `lib/ml/`, `rng.ts`, step/scroll utilities: **≥ 95% line and branch coverage**.
- Scene functions: **100%** of steps exercised.
- Whole app: report overall coverage in `TEST_REPORT.md`, but don't chase a number with meaningless tests; list uncovered files and justify.

### 6.4 Flakiness policy

Run the entire Playwright suite **5 times in a row** on a clean checkout (and with `--repeat-each` for scroll-sensitive tests). Any test that fails once is flaky: find the cause (usually timing, animation, or scroll position), fix it, and document it. Zero known-flaky tests at the end.

### 6.5 Mutation spot-checks (proof the tests have teeth)

Pick at least these mutations, apply each temporarily, confirm **a test fails**, then revert:

1. Remove the max-subtraction in `softmax`.
2. Change the causal mask condition `k > q` to `k >= q`.
3. Make `topP` return an empty set when `p` is tiny.
4. Replace the seeded RNG with `Math.random()`.
5. Remove one widget's `DataBadge`.
6. Change a Python snippet's output by one digit.
7. Make a widget's step 3 state depend on whether step 2 was visited first (order dependence).

Record results in `TEST_REPORT.md`. If a mutation survives, add the missing test.

---

## 7. Phase 4 — Browser QA & Bug Fixing

### 7.1 The Playwright matrix

| Dimension | Values |
|-----------|--------|
| Browsers | Chromium, Firefox, WebKit |
| Viewports | 375×667 (small phone), 390×844, 768×1024 (tablet), 1280×800, 1920×1080 |
| Colour scheme | light, dark |
| Motion | normal, `prefers-reduced-motion: reduce` |
| Input | mouse, keyboard only, touch (mobile emulation) |

Running every combination is not required; run the full matrix on the **core scenarios** (a–f below) for Chromium at 375 and 1280, and run a **reduced matrix** (one viewport per browser) for Firefox and WebKit.

**Core scenarios (each must have a test):**

a. **Scroll → step:** for each of the 7 sections, scroll through every beat; the widget's `step` (read via a stable attribute such as `data-step`) equals the beat index; the live caption matches.
b. **Controls → scroll:** Next/Prev/scrubber/keyboard changes the step **and** scrolls the matching beat into view; there is no oscillation (step settles within a second and **stays** — assert it doesn't change for 500 ms afterwards).
c. **Fast scroll / fling:** programmatic fast scroll past several beats; widget lands on the correct final step; the live region doesn't spam (announcements are debounced).
d. **Backwards:** scroll up and press Prev through every step of every widget; the scene at step *n* matches the forward-visited scene (screenshot or scene-state comparison).
e. **Deep link:** `#attention?step=4` (and each other section/step) loads at that step; invalid values (`step=99`, `step=-1`, `step=abc`, unknown section) fall back gracefully with no crash.
f. **Interactive controls:** W1 text box, W2 drag, W3 click-a-token and mask toggle, W4 hover highlight, W5 station popovers, W6 sliders/seed/roll/reset, W7 play/pause/step/seed. Include extreme inputs: empty text, 10,000 characters, emoji, RTL text, rapid repeated clicks, dragging off-screen.

**Additional scenarios:**

- Resize/rotate mid-scroll (observer thresholds recompute; no stuck state).
- Page reload at a scrolled position (browser scroll restoration vs deep link: define and test the behaviour).
- Slow network (throttle) and offline lazy-chunk failure → the error boundary shows its friendly fallback and a retry; the rest of the page still works.
- Theme toggle mid-animation; no unreadable states.
- Back/forward browser buttons with hash changes.

### 7.2 Visual regression (lightweight)

Take Playwright screenshots of each widget at each step on Chromium at 375 and 1280 (light theme). Commit them as baselines **only after you've visually inspected every one** for clipping, overlap, overflow, illegible text, and wrong colours. Use a small pixel-diff threshold; mask anything non-deterministic.

### 7.3 Things to specifically verify (known risk areas)

| Risk | Check |
|------|-------|
| Step ↔ scroll feedback loop | Programmatic `scrollIntoView` triggers the observer, which sets the step, which triggers scroll… Ensure a single source of truth and a "programmatic scroll in progress" guard |
| `StrictMode` | Dev double-mount doesn't leave two timelines/observers; every effect has cleanup; GSAP uses `useGSAP`/`gsap.context` and reverts on unmount |
| GSAP timeline (W5) | `progress()` scrubbing works in both directions, doesn't autoplay, doesn't accumulate on rapid step changes |
| Motion `layout` animations | No flicker when a parent resizes (sticky stage), no visible jumps on step 0 on first mount |
| Canvas | Crisp on high-DPI (`devicePixelRatio`), resizes with container, no memory growth when re-rendering |
| Off-screen animation | Widgets out of view are paused/unmounted (verify with a test hook that counts running animations) |
| Mobile sticky | The stage never hides the current beat's text; the on-screen keyboard (W1 text box) doesn't break layout |
| Horizontal overflow | `document.documentElement.scrollWidth <= innerWidth` at 375 px for every section and every step |
| Touch targets | Controls ≥ 44×44 CSS px on mobile |
| `<Term>` popovers | Don't overflow the viewport; close on Escape/outside tap; keyboard focus returns correctly |
| Hash handling | Clicking in-page links doesn't leave junk history entries or break Back |
| Seeds | Reload with same seed reproduces identical W6/W7 output |
| Console | Zero errors and zero warnings (React key warnings, act warnings, deprecated API warnings) in dev and in the production build |

---

## 8. Bug Triage & the Fix Loop

### 8.1 Severity scale

| Severity | Definition | Examples | Must fix? |
|----------|------------|----------|-----------|
| **Critical** | Wrong teaching, wrong numbers, crash, unusable page, or broken deploy | Softmax bug; false claim about YuE2; widget white-screens; step stuck | **Yes** |
| **Major** | A feature doesn't work as specified, or a significant group of users is blocked | Backwards navigation broken; 375 px overflow; keyboard unusable; missing `DataBadge` | **Yes** |
| **Minor** | Works but is rough | Caption slightly over 40 words; misaligned label; jank in one browser | Yes unless time-boxed (log reason) |
| **Polish** | Nice-to-have | Easing tweak; icon choice | No (list in `BUGS.md` backlog) |

### 8.2 The loop (for every bug)

1. **Reproduce** — write a **failing test first** (unit/scene/component/Playwright, whichever is cheapest that captures the bug).
2. **Diagnose** — find the root cause; write one sentence on why it happens.
3. **Fix** — smallest change. Avoid touching unrelated files.
4. **Verify** — new test passes; whole suite passes; manually re-check in a browser if the bug was visual.
5. **Record** — add an entry to `BUGS.md` (format in §11) and one commit: `fix(<area>): <what> (BUG-012)`.

Time-box: if a Minor/Polish issue takes more than ~30 minutes, log it as open with your findings instead.

---

## 9. Phase 5 — Accessibility

Automated (axe-core) **and** manual checks. The target is **zero serious/critical axe violations at every step of every widget**, in light and dark themes.

Automated, per widget per step: run axe; check colour contrast ≥ WCAG AA for text and meaningful graphics.

Manual checklist:

- [ ] Tab order is logical: skip link → progress rail → text/beat → widget controls → next section.
- [ ] Every interactive element has a visible focus indicator.
- [ ] Every control has an accessible name; icon-only buttons have `aria-label`.
- [ ] `<Term>` popovers: reachable by keyboard, announced, dismissible with Escape.
- [ ] Each widget has a visually-hidden live caption that updates at each step, with **debounced** announcements so rapid scrolling doesn't spam a screen reader.
- [ ] No information is conveyed by colour alone (labels, numbers, or patterns accompany it).
- [ ] Drag interactions (W2) have a keyboard alternative (e.g., arrow keys move the selected token).
- [ ] The page is usable at 200% zoom and with text spacing increased; no clipped content.
- [ ] With `prefers-reduced-motion`, no non-essential motion; final scene states render instantly; autoplay (W7) does **not** start automatically.
- [ ] Headings form a proper outline (one `h1`, sections `h2`, no skipped levels).
- [ ] Language attribute set on `<html>`; page `<title>` and meta description present.
- [ ] Test with at least one real screen reader flow if available (VoiceOver or NVDA); if not available, state so in `TEST_REPORT.md`.

---

## 10. Phase 9 — Firebase Hosting Deployment

### 10.1 Rules

- You will be given a **Firebase project ID** and a **Hosting site ID**. Use them. The human may already host **other** sites in the same Firebase project. **Never deploy over a site that hosts different content.** If the target site already has content from a different app, **stop and ask** (§12).
- Prefer a **separate Hosting site** for this app (Firebase supports several sites per project). If the human wants a new one: `firebase hosting:sites:create <SITE_ID>` — verify the syntax against `firebase --help` and the current Firebase docs, since CLI details change.
- Never commit credentials, tokens, or service-account JSON. Use environment variables / CI secrets and add the relevant paths to `.gitignore`.

### 10.2 Authentication (in order of preference)

1. If the environment is already authenticated (`firebase login:list` shows an account with access), use it.
2. Otherwise, for CI or non-interactive use: a **service account key** supplied via `GOOGLE_APPLICATION_CREDENTIALS` (path) or the CI secret; or `firebase login:ci` token supplied via `FIREBASE_TOKEN` (deprecated in favour of service accounts — prefer the service account if available).
3. If **no credentials are available**, do everything else (config, build, CI file, dry-run steps), then stop and hand the human the **exact commands** to run (§12).

### 10.3 Configuration (`firebase.json`)

Create/verify. Adapt site/target names to the IDs you were given:

```json
{
  "hosting": {
    "site": "<SITE_ID>",
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "/index.html",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      },
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ]
  }
}
```

Check the details:

- `public` must match Vite's output directory (`dist` by default). Confirm `vite.config` `base` is `/` (not a sub-path) unless the human says otherwise.
- **SPA rewrite caveat:** the catch-all rewrite must **not** turn missing JS/CSS files into `index.html` (this causes the infamous "Failed to load module script: expected a JavaScript MIME type" after a deploy). Because hashed assets are immutable, verify after deploy that old asset URLs 404 properly and the app doesn't white-screen for users with a stale `index.html` (index is `no-cache`, so this should be fine — test it). Firebase serves real files before applying rewrites; confirm this behaviour.
- **Optional CSP:** a Content-Security-Policy is desirable but easily breaks Tailwind/Shiki inline styles or lazy chunks. If you add one, test the production build under it with **zero CSP console errors**; start with `Content-Security-Policy-Report-Only` if unsure. Don't ship a CSP you haven't verified.
- Add `.firebaserc` with the project ID (this is not a secret). Commit both files.
- Add `npm run deploy:preview` and `npm run deploy` scripts (see §10.4) so the process is reproducible.

### 10.4 Deployment procedure

Always **preview first, then live**:

1. **Pre-flight (all must pass):** `npm ci`, lint, type-check, unit/scene/component tests, Python snippet tests, `npm run build`, local `npm run preview` + Playwright smoke suite against `http://localhost:<port>`.
2. **Preview channel:**
   ```
   firebase hosting:channel:deploy preview --expires 7d --project <PROJECT_ID>
   ```
   (Verify flags with the CLI help; use `--site <SITE_ID>` or the config's `site` field as appropriate.) Record the preview URL.
3. **Verify the preview** with the post-deploy suite (§10.6) against the preview URL.
4. **Go live:**
   ```
   firebase deploy --only hosting --project <PROJECT_ID>
   ```
   (If using multi-site targets, `--only hosting:<TARGET>`.) Record the live URL and the release/version ID.
5. **Verify live** with the post-deploy suite against the live URL.
6. **Know the rollback:** note in `DEPLOYMENT.md` how to roll back (Firebase Console → Hosting → release history → Roll back, or redeploy a previous commit). If the live verification fails on a Critical item, **roll back first, investigate second**.

### 10.5 Optional: CI deployment

If the repo is on GitHub, add `.github/workflows/`:

- `ci.yml` on every push and PR: install, lint, type-check, tests, Python snippets, build, Playwright (Chromium at minimum), upload test artifacts (reports, traces, screenshots).
- `deploy.yml`: on pushes to `main`, build and deploy using the official `FirebaseExtended/action-hosting-deploy` action with a service-account secret; on PRs, deploy to a preview channel. Verify action inputs against its current README. **Never print secrets in logs.**

If the human didn't provide repo or secret access, write the workflows and document the secrets they must add; don't claim they work until run.

### 10.6 Post-deploy verification (run against the live URL)

Run the Playwright smoke suite with `BASE_URL=https://<SITE_ID>.web.app` (and the custom domain if any). It must assert:

- Page loads: HTTP 200; `<title>` correct; no console errors; **no failed network requests** (no 404s, no MIME-type errors).
- All 7 sections' lazy chunks load and each widget renders its step 0.
- One scroll-driven step change per widget; one Prev/Next interaction; one deep link (`#attention?step=4`).
- The licence notice and non-affiliation text are present in hero and footer.
- Response headers (use `curl -I` or Playwright): `Cache-Control` as configured for `/assets/*` and `/index.html`; `X-Content-Type-Options: nosniff`; compressed responses (`content-encoding: br` or `gzip`).
- A **non-existent path** (e.g. `/does-not-exist`) behaves as designed (app shell loads; no crash).
- Mobile viewport (375 px): no horizontal scroll.
- Lighthouse (mobile and desktop) against the live URL: Performance ≥ 90 desktop and ≥ 80 mobile, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Save reports. If a threshold isn't met, investigate and fix, or document why.
- HTTPS works; no mixed-content warnings.

Add basic SEO/social metadata if missing (title, description, `lang`, Open Graph tags, favicon, `robots.txt`) — this is in scope because it is part of a correct deploy.

---

## 11. Phase 6–8 — Robustness, Content QA, Release Hygiene

### 11.1 Performance & robustness

- Production build: report bundle sizes (`vite build` output, or `rollup-plugin-visualizer`). Initial JS ≤ 250 KB gzipped; each widget is a separate lazy chunk. Investigate any chunk that pulls in a large dependency for a tiny feature (e.g., all of D3 instead of `d3-scale` + `d3-interpolate`; the whole GSAP plugin set).
- Remove unused dependencies (`depcheck` or equivalent); remove dead files and the dummy widget if still present.
- Verify no memory growth after scrolling through the whole page ten times (check via Playwright `page.metrics()` or heap snapshot comparison); verify animation count returns to zero when leaving a widget.
- Verify behaviour with JavaScript errors injected in one widget (error boundary shows fallback, others unaffected).
- Run `npm audit`; fix what can be fixed **without** breaking-major upgrades; document the rest.

### 11.2 Content & honesty QA

Read the entire page **as the target reader** (a junior Python developer with no ML background), step by step, and review:

- **Jargon:** every term defined on first use, in plain words, via `<Term>`; none used earlier than its introducing step. Run the glossary lint and *also* read manually; lints miss things.
- **Analogies:** each has a real "where it breaks".
- **Facts about YuE2:** open every `facts.ts` entry; **re-verify against the model card and the technical report (arXiv 2609.33757)** by fetching them. Any claim not verifiable → soften to generic wording or remove. Check that no widget implies toy numbers are YuE2's real numbers, and that nothing says YuE2 "understands" or "thinks".
- **Data badges:** correct on every widget; text matches the true provenance.
- **Python Corner:** snippets are readable, commented, correct; tags (`runnable` / `needs-gpu`) accurate; the `needs-gpu` snippet (if present) is verbatim from the model card.
- **Links:** every external link returns 200 (script it); links open with `rel="noopener noreferrer"`.
- **Typos, tone, reading level:** second person, short sentences, no hype.
- **Quizzes:** answer keys correct; explanations accurate; no ambiguity; can be retaken.
- **Legal:** licence line (CC BY-NC 4.0), non-affiliation statement, citations, model credit if real small-model data is used.

### 11.3 Release hygiene

- `README.md`: purpose, screenshots (optional), install, run, test, build, deploy (including Firebase steps), project structure, how to add a widget, how to regenerate real data (if the optional export exists), credits and licence.
- `docs/decisions.md` up to date (all deviations, added/removed dependencies, versions).
- CI file(s) present and passing (or documented as not runnable here).
- `.gitignore` covers `dist`, `node_modules`, coverage, Playwright reports/traces, `.firebase/`, credentials. Lockfile committed. No large binaries or secrets in history (if a secret was ever committed, **tell the human**; rotating it is their job).
- `package.json` scripts present and working: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:py`, `test:e2e`, `test:a11y`, `check:content`, `deploy:preview`, `deploy`.

---

## 12. When to Stop and Ask the Human

Stop and report (don't guess) when:

1. **Credentials or permissions are missing** for Firebase. Provide the exact commands, e.g.:
   ```
   npm ci && npm run build
   firebase login
   firebase hosting:channel:deploy preview --project <PROJECT_ID>
   firebase deploy --only hosting --project <PROJECT_ID>
   ```
2. The **target Hosting site already hosts different content**, or the site/project ID is ambiguous.
3. A **product or content decision** is needed (e.g., removing a widget, changing the teaching order, relaxing a Golden Rule).
4. The technical report **contradicts** something the app teaches and the fix changes a widget's design.
5. A secret appears in the repository or its history.
6. You've spent substantial effort (more than ~2 hours equivalent) on a single **Critical** bug without root cause; report findings and options.

Never block silently; always finish everything else first and state exactly what is waiting on the human.

---

## 13. Deliverables & Document Formats

### `AUDIT.md`
1. Baseline table (Phase 0).
2. Conformance matrix (Phase 1).
3. Final status of each row at the end of the work (updated, not replaced).

### `BUGS.md`

```
## BUG-012 — W3 step 4: percentages don't sum to 100 after toggling the mask
- Severity: Major
- Found by: Playwright scenario (f)
- Reproduction: <steps / test name>
- Root cause: <one sentence>
- Fix: <commit hash + one line>
- Regression test: <file::test name>
- Status: Fixed | Open | Won't fix (reason)
```
Plus a **Backlog** section for Polish items.

### `TEST_REPORT.md`
- Counts per layer (unit/scene/data/component/e2e/a11y/python).
- Coverage numbers and the justified exclusions.
- The 5× repeat-run results and any flakiness found and fixed.
- Mutation spot-check table (mutation → test that caught it).
- Browser/viewport matrix actually run, and what was *not* run and why.
- Accessibility results (axe summary per widget; manual checklist outcomes).
- Lighthouse scores (local and live).

### `DEPLOYMENT.md`
- Project ID, site ID, live URL, preview URL.
- Exact commands used, and the deployed version/release ID and commit hash.
- Header configuration summary and caching strategy.
- Rollback instructions.
- CI/secrets setup (names only, never values).
- Post-deploy verification results.

### `CHANGELOG.md`
Keep-a-changelog style: Added / Changed / Fixed / Removed, referencing BUG ids.

---

## 14. Definition of 10/10 (all must be true)

**Correctness**
- [ ] Math core verified against independent references; golden fixtures pass in both TypeScript and Python.
- [ ] Every number shown in W3, W6, W7 equals what the corresponding Python snippet prints.

**Behaviour**
- [ ] All 7 widgets work at every step, **forwards and backwards**, via scroll, buttons, scrubber and keyboard, with no oscillation or stuck steps.
- [ ] Deep links work for every section/step; invalid values fall back gracefully.
- [ ] No horizontal overflow at 375 px; all interactions work by touch and keyboard.
- [ ] Reduced-motion users get a fully working, non-animated experience; nothing autoplays.

**Tests**
- [ ] The test pyramid in §6.2 exists; coverage targets in §6.3 met.
- [ ] Zero skipped/disabled tests (or each justified in `TEST_REPORT.md`).
- [ ] Playwright suite passes 5× consecutively; mutation spot-checks all caught.

**Quality**
- [ ] Zero console errors/warnings in dev and in production build.
- [ ] axe: zero serious/critical violations at every widget step, both themes; manual checklist complete.
- [ ] Lighthouse thresholds in §10.6 met on the live site.
- [ ] Bundle budget met; widgets lazy-loaded; off-screen widgets don't animate.

**Content honesty**
- [ ] Every YuE2 claim traces to a verified fact; no claim that toy data is YuE2's; no anthropomorphic language about the model.
- [ ] Every widget carries a correct `DataBadge`; every analogy has a "where it breaks"; no jargon before its definition.
- [ ] Licence (CC BY-NC 4.0) and non-affiliation text visible in hero and footer; all external links verified.

**Deployment**
- [ ] Deployed to the **specified** Firebase Hosting site (no other site touched), first via preview channel, then live.
- [ ] Post-deploy suite passes against the live URL; headers and caching verified; rollback documented.
- [ ] README, `docs/decisions.md`, `AUDIT.md`, `BUGS.md`, `TEST_REPORT.md`, `DEPLOYMENT.md`, `CHANGELOG.md` complete and accurate.

---

## 15. Final Report (your last message to the human)

Keep it short and factual:

1. **Live URL** (and preview URL), release/version, commit hash.
2. **Scorecard:** the §14 checklist with ✅/❌ and a one-line note for any ❌.
3. **Top 5 bugs fixed** (BUG ids, one line each).
4. **Open items** (Minor/Polish backlog, anything waiting on the human, anything you couldn't verify and why).
5. **Deviations from the Build Spec** you accepted, with reasons.
6. **How to continue:** the three commands the human needs most (run locally, run all tests, deploy).

Do not claim something works unless you ran it and saw it work. If you couldn't run it, say so.
