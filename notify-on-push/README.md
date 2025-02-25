# Notify on Pull Request Action

This repository provides a GitHub Action that sends notifications to Slack when a Pull Request event occurs.

## Features

- Sends notifications to a specified Slack channel when a Pull Request is opened or updated.
- Displays the title, author, and state of the Pull Request.
- Easy to integrate with GitHub Actions workflows.

---

## How to Use

### 1. Set Up the Workflow

Create a `.github/workflows/notify.yml` file with the following configuration:

```yaml
name: Pull Request Notification

on:
  pull_request:
    - types: [opened, edited, reopened]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify on PR
        uses: your-username/notify-on-pr@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Set Up the Slack Webhook URL

1. Create a Slack App
   - Go to the Slack API page and click “Create New App.”
   - Select “From scratch” and enter your app name. Choose the workspace.
2. Enable Incoming Webhooks
   - Navigate to “Incoming Webhooks” and enable the feature.
   - Click “Add New Webhook to Workspace” and select a channel. Click “Allow.”
   - Copy the generated Webhook URL.
3. Add the Webhook URL to GitHub Secrets
   - Go to Settings > Secrets and variables > Actions in your GitHub repository.
   - Click “New repository secret,” name it SLACK_WEBHOOK_URL, and paste the Webhook URL.

Example Message

When a Pull Request event occurs, the following message will be sent to Slack:

📢 _Pull Request Alert_ 📢
🔹 _Title:_ PR Title
🔹 _Author:_ PR Author
🔹 _State:_ PR State
🔹 [View PR](PR Link)

License

Distributed under the MIT License.
