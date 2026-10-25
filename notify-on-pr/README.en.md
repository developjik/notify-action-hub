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
        id: notify
        uses: developjik/notify-action-hub/notify-on-pr@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 Inputs

| Name                  | Description                                                       | Required |
| --------------------- | ----------------------------------------------------------------- | -------- |
| `slack_webhook_url`   | Slack Webhook URL                                                 | ❌ No    |
| `discord_webhook_url` | Discord Webhook URL                                               | ❌ No    |
| `telegram_bot_token`  | Telegram Bot token                                                | ❌ No    |
| `telegram_chat_id`    | Telegram Chat ID (required if using Telegram)                     | ❌ No    |
| `dry_run`             | Log the payload instead of sending it (true/false)                | ❌ No    |
| `message_prefix`      | Prefix prepended to the notification message (e.g., project name) | ❌ No    |

> **Note:** At least one notification method (Slack, Discord, or Telegram) must be provided.

## 📤 Outputs

| Name                  | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `notification_status` | Notification result (`sent` / `partial` / `failed` / `dry-run` / `skipped`) |
| `failed_platforms`    | Comma-separated list of platforms that failed (empty string if none)        |

You can reference them in subsequent steps via `steps.notify.outputs.*`:

```yaml
- name: Check notification result
  if: ${{ steps.notify.outputs.notification_status == 'partial' }}
  run: echo "failed_platforms = ${{ steps.notify.outputs.failed_platforms }}"
```

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
