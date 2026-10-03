# Changelog

All notable changes to **Inside a Music AI**. Format based on
[Keep a Changelog](https://keepachangelog.com/); this project uses semantic-ish
versioning once released.

## [Unreleased]

### Fixed

- **Mobile (375 px) scrollytelling.** The widget stage is now capped at `h-[45vh]`
  on mobile (desktop unchanged) and scrolls its body internally, so the step
  controls stay on screen and the active beat's text is never hidden. This fixes
  the Next/Prev oscillation and the missing W2 "Nearest Neighbours" panel on
  small screens. Step selection uses a shared reading line
  (`src/lib/reading-line.ts`): viewport centre on desktop, below-the-stage on
  mobile.
- **Firefox/WebKit scroll ↔ step desync.** The programmatic-scroll guard is now
  released only on genuine user input (`wheel`, `touchstart`, `keydown`) instead
  of on bare `scroll` events with a timeout; synthetic/assistive scrolls can no
  longer override a step set by a control click.
- **Deep links from a scrolled position.** External `hashchange` navigation now
  scrolls the target section into view (internal step changes use
  `replaceState`, so there is no loop).
- **Light-theme contrast in W5.** The inactive-station dim moved from the whole
  button to the number badge, restoring WCAG AA contrast for the station labels.

### Changed

- `post-deploy.spec.ts` header check is skipped unless `BASE_URL` is set, so the
  assertion only runs where Firebase headers exist.
- The 22-beat scroll sweep gets a 120 s WebKit timeout (assertions unchanged).
- Added W2 device-store: `firebase.json`, `.firebaserc`.

## [1.0.0] — 2026-10-03

Initial hardening release.

### Added

- Strict TypeScript config (`strict`, `noUnusedLocals`, `noUnusedParameters`).
- Vitest 3 + Testing Library + jsdom unit/component/data suites (123 tests).
- Playwright + `@axe-core/playwright` e2e and accessibility suites at 1280 and
  375, plus Firefox/WebKit projects.
- Executable Python snippets (`src/content/python/`) checked against recorded
  output, and a content lint (`scripts/check-content.ts`).
- Error boundary and lazy, in-view-mounting widget stage with code splitting.
- Deep-link parsing, light/dark theme system, glossary auto-linking, expanded
  glossary, and a11y fixes (focusable scroll regions, touch targets, labels).
- GitHub Actions `ci.yml` and `deploy.yml`, `.nvmrc` (Node 20), and the
  `firebase.json` / `.firebaserc` hosting config.
- `AUDIT.md`, `BUGS.md`, `TEST_REPORT.md`, `DEPLOYMENT.md`, `CHANGELOG.md`.

### Fixed

- Real YuE2 content corrections (drums weight, 9-token attention, combined
  vectors, seed `42 → 2`), the on-screen "guitar" attention weight (17.5%), and
  a fabricated GPU snippet replaced with the verbatim model-card usage.
- Removed unused deps that broke the `vite@8` install.
