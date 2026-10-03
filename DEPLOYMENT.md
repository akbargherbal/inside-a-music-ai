# DEPLOYMENT.md

Firebase Hosting deployment for **Inside a Music AI**.
Spec: `genai-visual-explainer-qa-deploy-spec.md` §10.

---

## ⚠️ Read before going live

- Firebase project: **`inside-yue2-3b`** (`.firebaserc` default).
- The project has exactly one Hosting site: **`inside-yue2-3b`**
  (`https://inside-yue2-3b.web.app`, `https://inside-yue2-3b.firebaseapp.com`).
- **That site currently hosts different content** (title: *"How Does Generative AI
  Make Music? — Inside YuE2-3B"*). The original task used placeholder
  `<FIREBASE_SITE_ID>` values and never gave an explicit site ID.
- A **preview channel** is non-destructive and safe. Promoting to **live replaces
  the existing content** and is destructive, so it is **blocked pending explicit
  human confirmation**. Do not run `npm run deploy` until someone confirms the
  site should be overwritten.

---

## Configuration shipped

- `firebase.json` — `public: dist`, SPA rewrites, and headers:
  - `/assets/**` → `Cache-Control: public, max-age=31536000, immutable`
  - `/index.html` → `Cache-Control: no-cache`
  - `**` → `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
    `Referrer-Policy: strict-origin-when-cross-origin`,
    `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `.firebaserc` — default project `inside-yue2-3b`.
- Scripts: `npm run deploy:preview` (`--expires 7d`), `npm run deploy`.

---

## Pre-flight (must pass)

```bash
npm ci
npm run check                 # lint + unit + content + python snippets
npm run build
npm run preview &             # http://localhost:4173
npx playwright test --project=chromium-1280 --project=chromium-375
```

Current status: all pre-flight checks pass — see `TEST_REPORT.md`.

---

## 1. Preview channel (safe)

```bash
npm run deploy:preview
# equivalently:
# npm run build && firebase hosting:channel:deploy preview --expires 7d --project inside-yue2-3b
```

Record the preview URL printed by the CLI.

## 2. Verify the preview

```bash
BASE_URL=<preview-url> npx playwright test tests/e2e/post-deploy.spec.ts
```

This now includes the header check (it is skipped without `BASE_URL`).

## 3. Go live (requires human confirmation — currently blocked)

```bash
npm run deploy
# equivalently:
# npm run build && firebase deploy --only hosting --project inside-yue2-3b
```

Record the live URL and the release version ID from the CLI output.

## 4. Verify live

```bash
BASE_URL=https://inside-yue2-3b.web.app npx playwright test tests/e2e/post-deploy.spec.ts
curl -sI https://inside-yue2-3b.web.app/ | grep -i -E 'x-content-type-options|x-frame-options|cache-control'
```

Expected: `x-content-type-options: nosniff`, `x-frame-options: DENY`, and
`cache-control: no-cache` on `/index.html`; `/assets/*` long-cached and immutable.

---

## Rollback

1. Firebase Console → Hosting → `inside-yue2-3b` → **Release history** → select the
   previous release → **Roll back**.
2. Or redeploy a known-good commit: `git checkout <good-sha> && npm ci && npm run deploy`.

If live verification fails on a Critical item, **roll back first, investigate second**
(QA Spec §10.4).

---

## CI

`.github/workflows/ci.yml` runs install → lint → tests → Python → build →
Playwright (`chromium-1280`, `chromium-375`) on every push/PR.
`.github/workflows/deploy.yml` is configured to build and deploy via
`FirebaseExtended/action-hosting-deploy`; it needs a `FIREBASE_SERVICE_ACCOUNT`
repository secret before it will run.
