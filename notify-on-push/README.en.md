# Notify on Push Action

A GitHub Action that sends notifications to Slack when a `push` event occurs.

## Features

- Sends notifications to a specified Slack channel on new pushes.
- Displays repository name, pusher name, and commit count.
- Easy to integrate with GitHub Actions workflows.

---

## How to Use

### 1. Set Up the Workflow

Create a `.github/workflows/notify.yml` file with the following configuration:

```yaml
name: Notify Slack on Push

on:
  push:
    branches:
      - main  # You can specify other branches if needed.

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify on Push
        uses: developjik/notify-on-push-action@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}

2. Set Up the Slack Webhook URL
	1.	Create a Slack App
	•	Go to Slack API and click “Create New App.”
	•	Select “From scratch” and enter your app name. Choose the workspace.
	2.	Enable Incoming Webhooks
	•	Navigate to “Incoming Webhooks” and enable the feature.
	•	Click “Add New Webhook to Workspace” and select a channel. Click “Allow.”
	•	Copy the generated Webhook URL.
	3.	Add the Webhook URL to GitHub Secrets
	•	Go to Settings > Secrets and variables > Actions in your GitHub repository.
	•	Click “New repository secret,” name it SLACK_WEBHOOK_URL, and paste the Webhook URL.

Example Message

When a push event occurs, the following message will be sent to Slack:

🎉 *New push to your-repo-name* 🎉
- Pusher: developjik
- Commit count: 3
- [View Repository](https://github.com/your-repo-url)

License

Distributed under the MIT License.

---

이제 `README.md`는 기본 한글로 제공되고, 영어 설명은 `README.en.md`로 링크할 수 있어! 😄
```
