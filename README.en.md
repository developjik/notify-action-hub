# 🔔 GitHub Notification Action Hub

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
- Release artifacts use `ncc` bundles and commit generated `dist/` output.
- Metadata consistency and workflow syntax (`actionlint`) are automatically validated in `.github/workflows/metadata-consistency.yml` on PRs and pushes to `main`.

You can run the same check locally with:

```bash
bash scripts/validate-actions-metadata.sh
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
