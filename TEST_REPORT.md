# TEST_REPORT.md

**Project:** Inside a Music AI
**Date:** 2026-10-03
**Commit under test:** working tree on top of `ab2aa38` (hardening + mobile/browser
fixes described in `BUGS.md`).
**Spec:** `genai-visual-explainer-qa-deploy-spec.md` §2, §6, §9.

All results below were measured locally on this machine. Commands are copy-pasteable.

---

## Environment

| Item | Value |
| --- | --- |
| Node | v20.19.0 (`.nvmrc` → 20) |
| npm | 10.8.2 |
| Python | 3.13.15 |
| OS | Linux |
| Browsers | Playwright Chromium, Firefox, WebKit (installed) |
| Preview server | `npm run build && npm run preview` on `:4173` |

---

## Summary

| Layer | Command | Result |
| --- | --- | --- |
| Type-check | `npm run lint` | ✅ 0 errors (`strict`, `noUnusedLocals`, `noUnusedParameters`) |
| Unit / component / data | `npm test` | ✅ **123 passed** (7 files) |
| Content lint | `npm run check:content` | ✅ 7 sections, 57 glossary terms |
| Python snippets | `npm run test:py` | ✅ **7/7** match recorded output |
| E2E (all projects) | `npm run test:e2e` | ✅ **100 passed, 4 skipped** (see matrix) |
| A11y (axe) | `npm run test:a11y` | ✅ dark + light, 0 serious/critical |

---

## E2E matrix

`forbidOnly`/`retries` are off locally. Each project runs the full `tests/e2e`
suite (scroll, interactive, mobile, a11y, smoke, post-deploy).

| Project | Viewport | Passed | Skipped | Failed |
| --- | --- | ---: | ---: | ---: |
| `chromium-1280` | 1280×800 | 25 | 1 | 0 |
| `chromium-375` | 375×667 | 25 | 1 | 0 |
| `firefox-1280` | 1280×800 | 25 | 1 | 0 |
| `webkit-1280` | 1280×800 | 25 | 1 | 0 |

The one skip in every project is
`post-deploy.spec.ts` › "security and cache headers are configured". It only runs
when `BASE_URL` points at a deployed site (`test.skip(!process.env.BASE_URL)`),
because `vite preview` cannot emit Firebase Hosting headers. It is part of the
post-deploy procedure in `DEPLOYMENT.md`.

### Scenario coverage (QA Spec §6 / §9)

- Scroll ↔ step mapping for every section, including first/middle/last beats.
- Prev/Next settle without oscillation; backwards navigation reproduces the
  forward scene byte-for-byte (`innerText` equality).
- Keyboard `← → Home End`.
- Deep links `#attention?step=4`, invalid step/unknown section fallbacks with no
  page errors.
- Reduced motion: scroll still advances steps and the loop does not autoplay.
- Every widget interaction: W1 typing, W2 keyboard move + nearest neighbours,
  W5 popover/Escape, W6 deterministic seed, W7 play-to-stop.
- Mobile: no horizontal overflow at 375 px across all sections; controls ≥44 px.
- Accessibility: axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`) dark and light,
  plus one `h1`/`lang`/`title`, and keyboard-openable glossary term.
- Post-deploy: SPA shell, unknown-path fallback, console-error check.

---

## Not yet run (open items)

- **Lighthouse** (QA Spec §10.7): budgets Performance ≥90 desktop / ≥80 mobile,
  Accessibility ≥95, Best Practices ≥95, SEO ≥90. Requires the deployed URL.
- **Live header verification** via `curl -I` / the post-deploy suite against the
  preview and live URLs.
- **Cross-browser 375 px**: the reduced matrix uses one viewport per browser
  (Firefox/WebKit at 1280). Chromium covers 375.

---

## Reproduce

```bash
npm ci
npm run check                    # lint + unit + content + python
npm run build
npx playwright test --project=chromium-1280 --project=chromium-375
npx playwright test --project=firefox-1280 --project=webkit-1280
```

Playwright reports land in `playwright-report/`; failure traces/screenshots in
`test-results/` (both git-ignored).
