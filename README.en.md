# 🔔 GitHub Notification Action Hub

[![Documentation](https://img.shields.io/badge/docs-GitHub_Pages-blue)](https://developjik.github.io/notify-action-hub/en/)

A collection of GitHub Actions for sending notifications about GitHub events to various platforms.

## 🌟 Key Features

- Multi-platform support: Slack, Discord, Telegram
- Various GitHub event notifications:
  - 🐞 Issue creation/modification
  - 🔄 PR creation/updates
  - 🚀 Release deployments
  - 💬 Commit comments
  - ⬆️ Code pushes
  - ❌ Workflow failures
  - 🗑️ Branch deletions

## 🧱 Technical Standards

- All actions run on `runs.using: node20`.
- Execution entry points in `action.yml` are standardized to `dist/index.js`.
- The repository root is an npm workspace (`common` + `notify-on-*`) with a single root `package-lock.json`.
- Release artifacts use `ncc` bundles and commit generated `dist/` output.
- PRs and pushes to `main` are automatically validated in `.github/workflows/validate-actions.yml` for workflow syntax (`actionlint`), metadata consistency, unit tests (vitest), lint (ESLint/Prettier), and dist freshness.

You can run the same checks locally with:

```bash
npm ci                  # install dependencies (single root lockfile)
npm test                # unit tests (vitest)
npm run lint            # ESLint
npm run format:check    # Prettier check
bash scripts/validate-actions.sh   # action.yml metadata checks
bash scripts/check-dist.sh         # dist freshness check
npm run build:all       # rebuild all dist bundles after source changes
```

## 🔧 Setup Guide

### Slack Webhook Setup

1. Create an app at [Slack API](https://api.slack.com/)
2. Enable "Incoming Webhooks"
3. Add webhook URL to GitHub Secrets (`SLACK_WEBHOOK_URL`)

### Discord Webhook Setup

1. Server Settings → Integrations → Webhooks
2. Create new webhook and copy URL
3. Add to GitHub Secrets (`DISCORD_WEBHOOK_URL`)

### Telegram Bot Setup

1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Add bot token to GitHub Secrets (`TELEGRAM_BOT_TOKEN`)
3. Get chat ID and add to GitHub Secrets (`TELEGRAM_CHAT_ID`)

## 📜 License

This project is licensed under the MIT License.
