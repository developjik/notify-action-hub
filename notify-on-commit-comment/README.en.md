# 🚀 Commit Comment Notification Action

This GitHub Action sends notifications when a commit receives a comment. It supports Slack, Discord, and Telegram notifications.

## 📌 Usage

Create a `.github/workflows/notify-on-commit-comment.yml` file and configure it as follows:

```yaml
name: Commit Comment Notification

on:
  issue_comment:
    types: [created]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Notification
        uses: developjik/notify-action-hub/notify-commit-comment@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 Inputs

| Name                  | Description                  | Required |
| --------------------- | ---------------------------- | -------- |
| `slack_webhook_url`   | Slack Incoming Webhook URL   | ❌ No    |
| `discord_webhook_url` | Discord Incoming Webhook URL | ❌ No    |
| `telegram_bot_token`  | Telegram Bot Token           | ❌ No    |
| `telegram_chat_id`    | Telegram Chat ID             | ❌ No    |

At least one of `slack_webhook_url`, `discord_webhook_url`, or `telegram_bot_token` + `telegram_chat_id` must be provided.

## 📩 Notification Examples

### ✅ Slack & Discord Message Example

```
💬 Commit Comment Alert

🔹 Author: johndoe
🔹 Comment: This is a test comment
🔹 [View Comment](https://github.com/developjik/my-repo/commit/abcdef123456)
```

### ✅ Telegram Message Example

```
💬 Commit Comment Alert

🔹 Author: johndoe
🔹 Comment: This is a test comment
🔹 View Comment: https://github.com/developjik/my-repo/commit/abcdef123456
```

## 🔧 Setting up Webhooks

### Slack Webhook Setup

1. Go to [Slack API](https://api.slack.com/).
2. Click "Create New App" → "From scratch" → Enter app name and select workspace.
3. Enable "Incoming Webhooks" and click "Add New Webhook to Workspace."
4. Select the channel to receive notifications and click "Allow."
5. Copy the generated Webhook URL and add it as a GitHub Secret (`SLACK_WEBHOOK_URL`).

### Discord Webhook Setup

1. Open Discord and go to "Server Settings."
2. Navigate to "Integrations" → "Webhooks."
3. Click "New Webhook" and configure it.
4. Copy the Webhook URL and add it as a GitHub Secret (`DISCORD_WEBHOOK_URL`).

### Telegram Bot Setup

1. Open Telegram and search for "BotFather."
2. Start a chat and send `/newbot` to create a new bot.
3. Copy the bot token and add it as a GitHub Secret (`TELEGRAM_BOT_TOKEN`).
4. Get your `telegram_chat_id` by sending a message to your bot and checking the chat ID using `https://api.telegram.org/bot<YourBotToken>/getUpdates`.

## 📜 License

This project follows the MIT License. See the [LICENSE](LICENSE) file for details.
