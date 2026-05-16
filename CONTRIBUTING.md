# Contributing

This repository keeps small GitHub Actions packages under `notify-*` directories.
Changes should stay reviewable, CI-backed, and easy to release.

## Pull Request Checklist

- Keep one PR focused on one workflow or one action package.
- Update the relevant `README.md` and `README.en.md` when behavior changes.
- Keep every `action.yml` on `runs.using: 'node20'` and `runs.main: 'dist/index.js'`.
- Commit generated `dist/index.js` output for each action package.
- Add or update `branding` metadata when publishing a new action package.

## Local Validation

Run these checks before requesting review:

```bash
bash scripts/validate-actions-metadata.sh
bash scripts/validate-actions.sh
```

CI also runs `actionlint` through the metadata consistency workflows. If a PR
adds or changes workflow files, wait for all GitHub Actions checks to pass before
merging.

## PR Hygiene

- Prefer updating the newest PR when several PRs solve the same metadata or CI problem.
- Close older duplicate PRs once the newest PR contains the same intent and has passing checks.
- Do not merge PRs with failing required validation unless the failure is proven unrelated and documented in the PR.
