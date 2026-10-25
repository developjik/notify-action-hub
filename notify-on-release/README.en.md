# 🚀 Release Notification Action

A GitHub Action that sends notifications to Slack, Discord, or Telegram when a new release is published.

## 📌 Usage

Create a `.github/workflows/release-notify.yml` file and configure it as follows:

```yaml
name: Release Notification

on:
  release:
    types:
      - published

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Release Notification
        id: notify
        uses: developjik/notify-action-hub/notify-on-release@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 Inputs

| Name                  | Description                                                       | Required |
| --------------------- | ----------------------------------------------------------------- | -------- |
| `slack_webhook_url`   | Slack Incoming Webhook URL                                        | ❌ No    |
| `discord_webhook_url` | Discord Webhook URL                                               | ❌ No    |
| `telegram_bot_token`  | Telegram Bot Token                                                | ❌ No    |
| `telegram_chat_id`    | Telegram Chat ID                                                  | ❌ No    |
| `dry_run`             | Log the payload instead of sending it (true/false)                | ❌ No    |
| `message_prefix`      | Prefix prepended to the notification message (e.g., project name) | ❌ No    |

> **At least one of Slack, Discord, or Telegram webhook credentials must be provided.**

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

### ✅ Slack & Discord Message

```
🚀 *New Release Published!*

🔹 *Release:* v1.0.0
🔹 *Tag:* v1.0.0
🔹 [View Release](https://github.com/developjik/my-project/releases/tag/v1.0.0)
```

### ✅ Telegram Message

```
🚀 New Release Published!

🔹 Release: v1.0.0
🔹 Tag: v1.0.0
🔹 View Release: https://github.com/developjik/my-project/releases/tag/v1.0.0
```

## 🔧 Setup Guide

### 1️⃣ Slack Webhook Setup

1. Go to **Slack API** → Click **Create New App**
2. Select **From scratch**, enter the app name, and choose a workspace
3. Enable **Incoming Webhooks** and click **Add New Webhook to Workspace**
4. Choose a channel for notifications and click **Allow**
5. Copy the generated **Webhook URL**
6. Add it as a GitHub Secret:
   - Repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**, name it `SLACK_WEBHOOK_URL`, and paste the webhook URL

### 2️⃣ Discord Webhook Setup

1. Open **Discord**, go to **Server Settings** → **Integrations** → **Create Webhook**
2. Name the webhook, select a channel, and copy the webhook URL
3. Add it as a GitHub Secret (`DISCORD_WEBHOOK_URL`)

### 3️⃣ Telegram Bot Setup

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the instructions to create a bot
3. Copy the **Bot Token**
4. Obtain a **Chat ID** using `@getidsbot`
5. Add both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as GitHub Secrets

## 📜 License

This project follows the MIT License. See [LICENSE](LICENSE) for details.
