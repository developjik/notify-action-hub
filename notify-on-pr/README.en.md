# Send PR Notifications

A GitHub Action that sends notifications when a Pull Request is opened or updated. Supports Slack, Discord, and Telegram.

## 🚀 How to Use

Create a `.github/workflows/pr-notify.yml` file and configure it as follows:

```yaml
name: PR Notification

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send PR Notification
        uses: developjik/notify-action-hub/notify-on-pr@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 Inputs

| Name                  | Description                                   | Required |
| --------------------- | --------------------------------------------- | -------- |
| `github_token`        | GitHub token to fetch PR information          | ✅ Yes   |
| `slack_webhook_url`   | Slack Webhook URL                             | ❌ No    |
| `discord_webhook_url` | Discord Webhook URL                           | ❌ No    |
| `telegram_bot_token`  | Telegram Bot token                            | ❌ No    |
| `telegram_chat_id`    | Telegram Chat ID (required if using Telegram) | ❌ No    |

> **Note:** At least one notification method (Slack, Discord, or Telegram) must be provided.

## 📩 Notification Examples

### Slack & Discord

```
📢 Pull Request Notification 📢

🔹 Title: Fix authentication bug
🔹 Author: developjik
🔹 Status: open
🔹 [View PR](https://github.com/example/repo/pull/42)
```

### Telegram

```
📢 *Pull Request Notification* 📢

🔹 *Title:* Fix authentication bug
🔹 *Author:* developjik
🔹 *Status:* open
🔹 [View PR](https://github.com/example/repo/pull/42)
```

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
