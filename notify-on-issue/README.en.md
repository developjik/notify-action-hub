# 🐞 Notify on Issue

A GitHub Action that sends notifications to Slack, Discord, and Telegram when an issue is opened or updated.

## 🚀 How to Use

Create a `.github/workflows/issue-notify.yml` file with the following configuration:

```yaml
name: Notify on Issue

on:
  issues:
    types:
      - opened
      - edited
      - reopened

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Issue Notification
        id: notify
        uses: developjik/notify-action-hub/notify-on-issue@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 Inputs

| Name                  | Description                                                       | Required    |
| --------------------- | ----------------------------------------------------------------- | ----------- |
| `slack_webhook_url`   | Slack Webhook URL                                                 | ❌ Optional |
| `discord_webhook_url` | Discord Webhook URL                                               | ❌ Optional |
| `telegram_bot_token`  | Telegram Bot Token                                                | ❌ Optional |
| `telegram_chat_id`    | Telegram Chat ID                                                  | ❌ Optional |
| `dry_run`             | Log the payload instead of sending it (true/false)                | ❌ Optional |
| `message_prefix`      | Prefix prepended to the notification message (e.g., project name) | ❌ Optional |

> You must provide at least one Webhook URL for Slack, Discord, or Telegram.

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

✅ **Slack & Discord Message Example**

```
🐞 *Issue Alert* 🐞

🔹 *Title:* Issue Title
🔹 *Author:* developjik
🔹 *State:* open
🔹 [View Issue](https://github.com/developjik/my-project/issues/1)
```

✅ **Telegram Message Example**

```
🐞 Issue Alert 🐞

🔹 Title: Issue Title
🔹 Author: developjik
🔹 State: open
🔹 View Issue: https://github.com/developjik/my-project/issues/1
```

## 🔧 How to Set Up Webhooks

### Slack Webhook

1. Create a Slack App:
   - Go to [Slack API](https://api.slack.com/) and click "Create New App."
   - Select "From scratch" and enter the app name. Choose the workspace.
2. Enable Incoming Webhooks:
   - Navigate to "Incoming Webhooks" and enable the feature.
   - Click "Add New Webhook to Workspace" and select a channel. Click "Allow."
   - Copy the generated Webhook URL.
3. Add the Webhook URL to GitHub Secrets:
   - Go to **Settings > Secrets and variables > Actions** in your GitHub repository.
   - Click **New repository secret**, name it `SLACK_WEBHOOK_URL`, and paste the Webhook URL.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
