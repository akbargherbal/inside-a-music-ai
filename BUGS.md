# BUGS.md — Bug Log

**Project:** Inside a Music AI
**Date:** 2026-10-03
**Method:** Hardening pass against `genai-visual-explainer-spec.md` (Build Spec) and
`genai-visual-explainer-qa-deploy-spec.md` (QA/Deploy Spec).

Each entry lists the symptom, reproduction, root cause, fix, and the test that
now guards it. Tests were never weakened to make a bug pass (QA Spec P3); where a
test changed, the reason is stated explicitly.

---

## BUG-001 — Mobile sticky stage covered the beats; controls were off-screen (step oscillation)

- **Severity:** Major (blocked the 375 px experience; QA Spec §9 "Mobile sticky").
- **Symptom:** On a 375×667 viewport, after a control click the widget step settled
  on a stale beat. Two e2e tests failed:
  - `scroll.spec.ts` › "Next/Prev change the step and settle without oscillation"
    (expected `0`, got `6`).
  - `interactive.spec.ts` › "W2 token can be moved with the keyboard" (the
    "Nearest Neighbours" panel was never rendered because the step had drifted
    from 5 to 3).
- **Reproduction:** `npx playwright test --project=chromium-375`.
- **Root cause:** The right-hand stage wrapper was `sticky top-16` at **all**
  breakpoints but had no height cap. At 375 px the stage rendered ~683 px tall —
  taller than the 667 px viewport — so its `Next`/`Prev` buttons sat just below
  the fold. Playwright (and a real user) must scroll to reach them, which fired
  the scroll observer; the observer then picked whatever beat was by the viewport
  centre, overriding the step the button had just set.
- **Fix:** Implement the Build Spec §150 mobile layout: the stage is capped at
  `h-[45vh]` on mobile (`lg:h-auto` on desktop) and the widget body scrolls
  inside it. Step selection now uses a shared **reading line** (`src/lib/reading-line.ts`):
  the viewport centre on desktop, and the middle of the area below the sticky
  stage on mobile, so the active beat's text is never hidden.
- **Guard:** the two failing tests above, plus the full `chromium-375` project.

## BUG-002 — Programmatic-scroll lock released by synthetic scrolls (Firefox/WebKit overshoot)

- **Severity:** Major (scroll ↔ step desync; QA Spec §1.3).
- **Symptom:** On Firefox and WebKit at 1280 px, clicking `Next` from step 0
  jumped to step 3; the backwards-navigation test jumped to the last step.
- **Reproduction:** `npx playwright test --project=firefox-1280 --project=webkit-1280`.
- **Root cause:** `useWidgetStep` released its "programmatic scroll" guard on any
  `scroll` event that arrived >250 ms after a step change. Browsers that reposition
  a click target before dispatching the click (and browser scroll restoration)
  emit exactly such `scroll` events, so the guard released and the observer
  overrode the step before the click handler ran. Chromium happened not to scroll,
  which is why the bug was browser-specific.
- **Fix:** release the guard **only** on genuine user intent (`wheel`,
  `touchstart`, `keydown`), and remove the time-based fallback. Internal step
  changes still lock synchronously, so a button press can no longer be undone by
  an unrelated scroll.
- **Guard:** `scroll.spec.ts` Next/Prev, backwards, and deep-link tests in the
  Firefox and WebKit projects.

## BUG-003 — Deep links set the step but did not scroll the section in

- **Severity:** Minor/Major depending on entry point.
- **Symptom:** Navigating to `#attention?step=4` from a page that was already
  scrolled elsewhere (e.g. the post-deploy smoke test) left the page where it was;
  the observer then re-derived a stale step (`7`).
- **Root cause:** the `hashchange` handler called `applyHash(false)` — it set the
  step but never performed the programmatic scroll that the initial mount path
  does. When the target section was off-screen the observer disagreed.
- **Fix:** external `hashchange` navigation now scrolls too (`applyHash(true)`).
  Internal step changes use `history.replaceState`, which does not fire
  `hashchange`, so this cannot loop.
- **Guard:** `post-deploy.spec.ts` › "app shell, widgets and interactions work"
  and `scroll.spec.ts` › "deep link … opens at step 4".

## BUG-004 — Light-theme WCAG AA contrast failure in W5 station labels

- **Severity:** Major (axe `color-contrast`, serious).
- **Symptom:** `a11y.spec.ts` light-theme run flagged the inactive W5 station
  labels (`10px`, `text-slate-400`).
- **Root cause:** the whole station button had `opacity-70` when inactive, dimming
  the small label below 4.5:1 against the light background.
- **Fix:** moved the dim from the button to the number badge
  (`w5-block/index.tsx`), leaving the text at full contrast.
- **Guard:** `a11y.spec.ts` dark **and** light theme at 1280 px.

## Test-infrastructure corrections (not product bugs)

- **Post-deploy headers test.** `post-deploy.spec.ts` asserted Firebase Hosting
  response headers, but the suite also runs against local `vite preview`, which
  cannot set them. The test is now skipped unless `BASE_URL` is set, so the same
  assertion still runs against a real preview/live URL instead of failing locally
  for the wrong reason.
- **WebKit sweep timeout.** "scrolling each beat advances the widget step" drives
  22 scroll/assert cycles and needs >45 s on WebKit. The test now sets a 120 s
  timeout (`test.setTimeout`); assertions are unchanged.
