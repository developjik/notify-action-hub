# Contributing

This repository keeps small GitHub Actions packages under `notify-*` directories.
Changes should stay reviewable, CI-backed, and easy to release.

## Repository Layout

- The repository root is an npm workspace (`common` + `notify-on-*` actions) with a
  single root `package-lock.json`. Never add per-directory lockfiles or `node_modules`.
- `common/notify.js` holds the shared notification logic and is bundled into each
  action's `dist/index.js` by `ncc` at build time.
- Per-action `package.json` files are kept for metadata (`main`, `engines`) checks.

## Pull Request Checklist

- Keep one PR focused on one workflow or one action package.
- Update the relevant `README.md` and `README.en.md` when behavior changes.
- Keep every `action.yml` on `runs.using: 'node20'` and `runs.main: 'dist/index.js'`.
- After changing any `index.js`, `lib.js`, or `common/` source, rebuild bundles with
  `npm run build:all` and commit the updated `dist/index.js` output. CI rejects stale
  bundles.
- Add or update `branding` metadata when publishing a new action package.

## Local Validation

Run these checks before requesting review (all from the repository root):

```bash
npm ci                 # install workspace dependencies (single root lockfile)
npm test               # vitest unit tests (common module + notify-on-push helpers)
npm run lint           # ESLint (dist is excluded)
npm run format:check   # Prettier check
bash scripts/validate-actions.sh   # action.yml metadata standards
bash scripts/check-dist.sh         # dist freshness (rebuild & compare)
npm run build:all      # rebuild all action dist bundles after source changes
```

CI runs `actionlint`, the metadata checks, unit tests, lint/format checks, and the
dist freshness check through the validation workflow. If a PR adds or changes
workflow files, wait for all GitHub Actions checks to pass before merging.

## PR Hygiene

- Prefer updating the newest PR when several PRs solve the same metadata or CI problem.
- Close older duplicate PRs once the newest PR contains the same intent and has passing checks.
- Do not merge PRs with failing required validation unless the failure is proven unrelated and documented in the PR.
