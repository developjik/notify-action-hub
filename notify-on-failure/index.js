const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    const slackWebhookUrl = core.getInput('slack_webhook_url');
    const jobName = core.getInput('job_name');

    const message = {
      text:
        `❌ *Workflow Failure Alert*\n\n` +
        `⚠️ *Job:* ${jobName} failed\n` +
        `📌 Repository: ${github.context.repo.owner}/${github.context.repo.repo}\n` +
        `🔗 [View Workflow Run](${github.context.server_url}/${github.context.repo.owner}/${github.context.repo.repo}/actions)`,
    };

    await axios.post(slackWebhookUrl, message);
    core.info('Slack notification sent successfully!');
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
