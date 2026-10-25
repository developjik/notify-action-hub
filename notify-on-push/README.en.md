# Notify on Push Action

A GitHub Action that sends notifications to Slack, Discord, and Telegram when a `push` event occurs.

## Features

- Sends push event notifications to the configured platforms (Slack/Discord/Telegram).
- Displays repository name, pusher name, commit count, and file change summary.
- Supports allowed time ranges, minimum commit counts, and batching multiple pushes.
- Easy to integrate with GitHub Actions workflows.

---

## How to Use

### 1. Set Up the Workflow

Create a `.github/workflows/notify.yml` file with the following configuration:

```yaml
name: Notify on Push

on:
  push:
    branches:
      - main # You can specify other branches if needed.

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify on Push
        id: notify
        uses: developjik/notify-action-hub/notify-on-push@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 2. Set Up the Slack Webhook URL

1. **Create a Slack App**

   - Go to the [Slack API](https://api.slack.com/) and click "Create New App".
   - Select "From scratch", enter your app name, and choose the workspace.

2. **Enable Incoming Webhooks**

   - Navigate to "Incoming Webhooks" and enable the feature.
   - Click "Add New Webhook to Workspace" and select a channel. Click "Allow."
   - Copy the generated Webhook URL.

3. **Add the Webhook URL to GitHub Secrets**

   - Go to **Settings > Secrets and variables > Actions** in your GitHub repository.
   - Click "New repository secret", name it `SLACK_WEBHOOK_URL`, and paste the Webhook URL.

## 🔧 Inputs

| Name                  | Description                                                                                                                                                                            | Required |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `slack_webhook_url`   | Slack Webhook URL                                                                                                                                                                      | ❌ No    |
| `discord_webhook_url` | Discord Webhook URL                                                                                                                                                                    | ❌ No    |
| `telegram_bot_token`  | Telegram Bot token (used with `telegram_chat_id`)                                                                                                                                      | ❌ No    |
| `telegram_chat_id`    | Telegram Chat ID (used with `telegram_bot_token`)                                                                                                                                      | ❌ No    |
| `include_diff_links`  | Include a "View Diff" link for each commit (default `true`)                                                                                                                            | ❌ No    |
| `notify_time_range`   | Allowed time range for notifications, in **UTC `HH:MM-HH:MM`** (e.g. `09:00-17:00`). Ranges crossing midnight (e.g. `23:00-06:00`) are supported. Pushes outside the range are skipped | ❌ No    |
| `min_commit_count`    | Minimum number of commits to send a notification. Commits from batched pushes are counted together (default `1`)                                                                       | ❌ No    |
| `batch_interval`      | Interval (**in minutes**) to batch notifications. `0` sends immediately (default `0`). See the batching guide below                                                                    | ❌ No    |
| `show_quality_score`  | Show a quality score (0–100, averaged from commit message length and file count) (default `false`)                                                                                     | ❌ No    |
| `dry_run`             | Log the payload instead of sending it (true/false, default `false`)                                                                                                                    | ❌ No    |
| `message_prefix`      | Prefix prepended to the notification message (e.g., project name)                                                                                                                      | ❌ No    |

> **Note:** At least one notification platform (Slack, Discord, or Telegram) must be configured.

## 🧪 Advanced Example (Time Range + Minimum Commit Count)

Send notifications only during UTC night hours, and only when there are 5 or more commits:

```yaml
- name: Notify on Push
  id: notify
  uses: developjik/notify-action-hub/notify-on-push@v1
  with:
    slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    # Only notify during UTC night hours (midnight-crossing range supported)
    notify_time_range: '23:00-06:00'
    # Skip notifications when the accumulated commits are fewer than 5
    min_commit_count: '5'
```

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

## 🗃️ Batching and actions/cache Integration

Setting `batch_interval` to a value greater than 0 (minutes) accumulates pushes that arrive before the interval elapses into a `batch_data.json` file, then sends them together on the next run after the interval has passed.

**Limitation:** The batch state file (`batch_data.json`) is written to the runner workspace (the working directory root). GitHub Actions runners are re-provisioned for every run, so this file is **not persisted between runs automatically.** To keep batching working across runs, cache the state file with `actions/cache`:

```yaml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      # Restore the batch state from the previous run (skipped when absent)
      - name: Restore batch state
        uses: actions/cache@v4
        with:
          path: batch_data.json
          key: notify-batch-${{ github.run_id }}
          restore-keys: notify-batch-

      - name: Notify on Push
        id: notify
        uses: developjik/notify-action-hub/notify-on-push@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          batch_interval: '30'

      # actions/cache saves the current state under the new key at job end (post step)
```

Notes:

- Caches are branch-scoped: caches created on the default branch are readable from all branches, while caches created on a PR branch are readable only from that branch and its children. This works best for consecutive runs on the same branch.
- Caches unused for 7 days are evicted, and the repository cache quota (10 GB) applies.
- Once a notification is sent, the batch data is reset and saved again.

## 📩 Example Message

When a push event occurs, the following message is sent:

```
🎉 *New push to your-repo-name* 🎉

🔹 *Pusher:* developjik
🔹 *Commit count:* 3
🔸 *Files:* +5/~2/-1
🔹 *Commits:*
- Fix authentication bug (by developjik) [View Diff](https://github.com/your-repo-url/commit/abc1234)
🔗 [View Repository](https://github.com/your-repo-url)
```

## 📜 License

Distributed under the MIT License.
