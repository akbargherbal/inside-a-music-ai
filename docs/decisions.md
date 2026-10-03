# Decisions Log

### Architecture & Libraries
- **Framework**: React 19 + TypeScript + Vite 8.
- **Styling**: Tailwind CSS v4 with custom CSS variables and rich dark/light mode support.
- **Animations**:
  - `motion/react` (Motion 12) for layout transitions, token chips sliding, and reactive step animations.
  - GSAP (`gsap` + `@gsap/react`) for the W5 transformer block conveyor assembly line timeline. GSAP Standard "No-Charge" License applies to educational and free web apps.
- **Data Validation**: `zod` for validating all widget datasets at build/load time.
- **Pure ML Core**: Pure TypeScript implementations of `softmax`, `dot`, `scaledDotProductAttention`, `applyTemperature`, `topK`, `topP`, `sample`, and `greedyTokenizer` in `src/lib/ml/`.
- **Seeded RNG**: `mulberry32` generator in `src/lib/rng.ts` guaranteeing 100% deterministic rolls across steps and runs.
- **State & Scrollytelling**:
  - Custom `useWidgetStep` hook coordinating IntersectionObserver scroll beats with Prev/Next, keyboard controls (ArrowLeft/ArrowRight, Home/End), and URL hashes (`#section?step=n`).
  - Strict pure `getSceneState(step, data, controls)` for every widget so that stepping backward works just as cleanly as stepping forward.
- **Reduced Motion**: Full support for `prefers-reduced-motion` and an in-app toggle that disables transitions while preserving instantaneous state updates.
