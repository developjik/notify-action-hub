# ❌ Workflow Failure Notification

A GitHub Action that sends notifications to Slack, Discord, and Telegram when a GitHub Actions workflow fails.

## 🚀 How to Use

Create a `.github/workflows/workflow-failure-notify.yml` file and configure it as follows:

```yaml
name: Workflow Failure Notification

on:
  workflow_run:
    workflows: ['*']
    types:
      - completed

jobs:
  notify:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - name: Send Failure Notification
        id: notify
        uses: developjik/notify-action-hub/notify-on-failure@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          job_name: 'Test & Build'
```

## 🔧 Inputs

| Name                  | Description                                                       | Required    |
| --------------------- | ----------------------------------------------------------------- | ----------- |
| `slack_webhook_url`   | Slack Webhook URL                                                 | ❌ Optional |
| `discord_webhook_url` | Discord Webhook URL                                               | ❌ Optional |
| `telegram_bot_token`  | Telegram Bot Token                                                | ❌ Optional |
| `telegram_chat_id`    | Telegram Chat ID                                                  | ❌ Optional |
| `job_name`            | Name of the failed job                                            | ❌ Optional |
| `dry_run`             | Log the payload instead of sending it (true/false)                | ❌ Optional |
| `message_prefix`      | Prefix prepended to the notification message (e.g., project name) | ❌ Optional |

> At least one Webhook URL for Slack, Discord, or Telegram must be provided.

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
❌ Workflow Failure Alert

⚠️ Job: Test & Build Failed
📌 Repository: developjik/my-project
🔗 View Workflow Run
```

### ✅ Telegram Message Example

```
❌ Workflow Failure Alert

⚠️ Job: Test & Build Failed
📌 Repository: developjik/my-project
🔗 View Workflow Run: https://github.com/developjik/my-project/actions
```

## 🔧 How to Set Up Slack Webhook

1. **Create a Slack App**
   - Go to [Slack API](https://api.slack.com/) and click "Create New App"
   - Select "From scratch" and enter your app name, then choose a workspace
2. **Enable Incoming Webhooks**
   - Navigate to "Incoming Webhooks" and enable the feature
   - Click "Add New Webhook to Workspace" and select a channel, then click "Allow"
   - Copy the generated Webhook URL
3. **Add Webhook URL to GitHub Secrets**
   - Go to your GitHub repository → "Settings" → "Secrets and variables" → "Actions"
   - Click "New repository secret", name it `SLACK_WEBHOOK_URL`, and paste the Webhook URL

## 📜 License

This project is distributed under the MIT License. See the [LICENSE](LICENSE) file for details.
