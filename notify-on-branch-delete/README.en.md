# 🗑️ Notify on Branch Delete

This GitHub Action sends notifications when a branch is deleted. It supports Slack, Discord, and Telegram.

## 🚀 Usage

Create a `.github/workflows/branch-delete-notify.yml` file and configure it as follows:

```yaml
name: Notify on Branch Delete

on:
  delete:
    branches:
      - '*'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send branch delete notification
        id: notify
        uses: developjik/notify-action-hub/notify-on-branch-delete@v1
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
| `telegram_bot_token`  | Telegram Bot Token                                                | ❌ No    |
| `telegram_chat_id`    | Telegram Chat ID                                                  | ❌ No    |
| `dry_run`             | Log the payload instead of sending it (true/false)                | ❌ No    |
| `message_prefix`      | Prefix prepended to the notification message (e.g., project name) | ❌ No    |

At least one of Slack, Discord, or Telegram Webhook information must be provided.

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

### ✅ Slack & Discord Message Example

```
🗑️ *Branch Deleted*

🔹 Branch: `feature-branch` was deleted.
```

### ✅ Telegram Message Example

```
🗑️ Branch Deleted

🔹 Branch: feature-branch was deleted.
```

## 🔧 Setting Up Webhooks

### 🔹 Slack Webhook Setup

1. **Create a Slack App:**
   - Go to [Slack API](https://api.slack.com/) → "Create New App"
   - Select "From scratch", name the app, and choose a workspace.
2. **Enable Incoming Webhooks:**
   - Activate "Incoming Webhooks" and click "Add New Webhook to Workspace".
   - Choose a channel and click "Allow".
   - Copy the generated Webhook URL.
3. **Add GitHub Secret:**
   - Go to GitHub Repository → "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret" and save it as `SLACK_WEBHOOK_URL`.

### 🔹 Discord Webhook Setup

1. Open Discord and go to "Server Settings".
2. Navigate to "Integrations" → "Webhooks".
3. Click "New Webhook", name it, and select a channel.
4. Copy the Webhook URL and save it as `DISCORD_WEBHOOK_URL` in GitHub Secrets.

### 🔹 Telegram Webhook Setup

1. Start a chat with [BotFather](https://t.me/BotFather) on Telegram.
2. Create a new bot and copy the token.
3. Use [this method](https://core.telegram.org/bots/api#getupdates) to get your chat ID.
4. Save the token and chat ID as `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in GitHub Secrets.

## 📜 License

This project follows the MIT License. See the [LICENSE](LICENSE) file for details.
