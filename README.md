# Inside a Music AI

A scroll-driven, animated explainer of how generative AI works, built around the
open-source **YuE2-3B** music model (developer: M-A-P). It walks through seven
interactive widgets — tokenization, embeddings, self-attention, multi-head
attention, transformer blocks, sampling, and the generation loop — with runnable
Python snippets and a glossary.

This project is being hardened against `genai-visual-explainer-spec.md` (Build
Spec) and `genai-visual-explainer-qa-deploy-spec.md` (QA/Deploy Spec).

---

## SESSION HANDOFF — where things stand (resume here)

Last worked: all known test failures fixed; **every suite is green across
Chromium, Firefox and WebKit**. Deployment is **preview-only** and the live step is
**blocked pending a human decision** (see below). Nothing from this session is
committed yet.

### Done and verified

- **Toolchain/deps**: fixed the `vite@8` peer conflict by removing unused deps
  (`esbuild`, `express`, `@types/express`, `dotenv`, `@google/genai`).
  `npm install` is clean.
- **Strict TypeScript**: `tsconfig.json` enables `strict`, `noUnusedLocals`,
  `noUnusedParameters`; `npx tsc --noEmit` reports **0 errors**.
- **Test tooling**: Vitest 3 + Testing Library + jsdom; Playwright + `@axe-core/playwright`;
  browsers installed. Configs: `vitest.config.ts`, `playwright.config.ts`,
  `tests/setup.ts` (IntersectionObserver mock).
- **Test results (measured)** — see `TEST_REPORT.md`:
  - `npm test` — **123 passing** (7 files).
  - `npm run test:py` — **7/7** Python snippets match their recorded outputs.
  - `npm run check:content` — clean ("7 sections, 57 glossary terms").
  - Playwright — **100 passed / 4 skipped / 0 failed** across `chromium-1280`,
    `chromium-375`, `firefox-1280`, `webkit-1280` (scroll, controls, deep links,
    backwards, interactive, mobile, a11y **dark and light**). The 4 skips are the
    post-deploy header check, which only runs with `BASE_URL`.
- **Content correctness fixes** (real YuE2 facts, no invented numbers):
  - W2 drums weight `0.429`; W3 uses all 9 tokens; W4 combined
    `[0.74,0.0,0.0,0.74,0.5,0.5,0.27,0.27]`; W5 `[1.437,-2.437,0.437,0.563]`;
    W7 seed `42 → 2` (yields "glows").
  - On-screen attention weight for "guitar" corrected to **17.5%** (softmax over
    all 9 keys) — previously the wrong "58%".
  - Replaced a fabricated `needs-gpu` snippet with the **verbatim** model-card
    usage (`# Requires: Linux, 24GB NVIDIA GPU`).
  - Regenerated golden fixtures: `tests/fixtures/golden-attention.json`,
    `tests/fixtures/golden-sampling.json`.
- **App hardening**: real error boundary + lazy in-view widget mounts +
  code-splitting (`React.lazy`) in `WidgetStage.tsx`/`App.tsx`; rewritten
  `useWidgetStep.ts` + `SectionContainer.tsx`; deep-link parsing
  (`src/lib/deep-link.ts`); theme system with light/dark (`.light` accent
  inversion in `src/index.css`); a11y fixes (focusable scroll regions, touch
  targets, aria labels); glossary auto-linking and ~15 new terms.
- **Mobile/browser fixes (this session)** — details in `BUGS.md`:
  - Mobile stage capped at `h-[45vh]` with an internal scroll body, so controls
    stay reachable and beats stay visible; shared reading line in
    `src/lib/reading-line.ts`.
  - Programmatic-scroll lock releases only on real user input (wheel/touch/key),
    fixing Firefox/WebKit Next/Prev overshoot.
  - External `hashchange` now scrolls the target section in.
  - Light-theme W5 station-label contrast fixed.
- **CI/release**: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`,
  `.nvmrc` (Node 20).
- **Deliverables added**: `firebase.json`, `.firebaserc`, `BUGS.md`,
  `TEST_REPORT.md`, `DEPLOYMENT.md`, `CHANGELOG.md`, and a final `AUDIT.md`.

### Open items

1. **Not yet run**: Lighthouse budgets and live post-deploy header checks — both
   need a deployed URL (see `DEPLOYMENT.md`).
2. **Cross-browser 375 px**: Firefox/WebKit run at 1280 in the reduced matrix;
   Chromium covers 375.
3. **Go-live** remains blocked pending human confirmation (below).

### Deployment — READ BEFORE GOING LIVE

- Firebase authenticated as `ghurbal.akbar@gmail.com`. Project `inside-yue2-3b`
  exists; its **only site is `inside-yue2-3b`**
  (`https://inside-yue2-3b.web.app` / `https://inside-yue2-3b.firebaseapp.com`).
- **That site already hosts different content** (title: "How Does Generative AI
  Make Music? — Inside YuE2-3B").
- The original prompt used literal placeholders `<FIREBASE_PROJECT_ID>` /
  `<FIREBASE_SITE_ID>` — the site ID was **never explicitly provided**.
- Per the QA/Deploy Spec: a preview channel is safe/non-destructive, but going
  **live over different content is destructive** and must be confirmed by a
  human first.
- **Do this next**: run `npm run deploy:preview`, then
  `BASE_URL=<preview-url> npx playwright test tests/e2e/post-deploy.spec.ts`,
  then **STOP and ask** before promoting to live. Exact live command (once
  confirmed): `npm run deploy`. Full runbook: `DEPLOYMENT.md`.

---

## Quick start

Prerequisites: Node.js 20 (see `.nvmrc`).

```bash
npm install
npm run dev          # Vite dev server on http://localhost:3000
```

The app needs no API key or backend at runtime — all widgets are self-contained.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (port 3000). |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Serve the built app (port 4173). |
| `npm test` | Vitest unit/component/data/scene tests. |
| `npm run test:coverage` | Vitest with coverage. |
| `npm run test:py` | Run the Python snippets and diff against expected output. |
| `npm run check:content` | Content lint (sections/glossary integrity). |
| `npm run test:e2e` | Playwright e2e (all configured projects). |
| `npm run test:a11y` | Playwright axe accessibility suite. |
| `npm run check` | `lint` + `test` + `check:content` + `test:py`. |
| `npm run deploy:preview` | Build + deploy a 7-day Firebase preview channel. |
| `npm run deploy` | Build + deploy to Firebase Hosting live. |

## Repo layout

- `src/widgets/w1..w7-*` — the seven interactive widgets and their data/scenes.
- `src/content/` — copy for sections, glossary, and the `python/` snippet mirror.
- `src/lib/` — math/model helpers plus `deep-link.ts`.
- `src/components/` — layout, stage, controls, badge, glossary, Python corner.
- `tests/` — `unit/`, `component/`, `data/`, `scene/`, `e2e/`, `fixtures/`.
- `scripts/` — `run-python-snippets.ts`, `check-content.ts`, `run-tests.ts`.
