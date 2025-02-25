# ❌ Workflow Failure Notification

This GitHub Action sends a Slack notification when a GitHub Actions workflow fails.

## 🚀 Usage

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
      - name: Send failure notification
        uses: your-repo/workflow-failure-notify@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          job_name: 'Test and Build'
```

## 🔧 Inputs

| Name                | Description            | Required |
| ------------------- | ---------------------- | -------- |
| `slack_webhook_url` | Slack Webhook URL      | ✅ Yes   |
| `job_name`          | Name of the failed job | ✅ Yes   |

## 📩 Notification Example

```
❌ *Workflow Failure Alert*

⚠️ *Job:* Test and Build failed
📌 Repository: developjik/my-project
🔗 [View Workflow Run](https://github.com/developjik/my-project/actions)
```

## 📜 License

This project is licensed under the MIT License. For more details, refer to the [LICENSE](LICENSE) file.
