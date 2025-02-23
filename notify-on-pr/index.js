const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    const slackWebhookUrl = core.getInput('slack_webhook_url');
    const githubToken = core.getInput('github_token');

    const { payload } = github.context;
    const pr = payload.pull_request;

    if (!pr) {
      core.setFailed('This action should only run on pull request events.');
      return;
    }

    const message = {
      text:
        `📢 *Pull Request Alert* 📢\n\n` +
        `🔹 *Title:* ${pr.title}\n` +
        `🔹 *Author:* ${pr.user.login}\n` +
        `🔹 *State:* ${pr.state}\n` +
        `🔹 [View PR](${pr.html_url})`,
    };

    await axios.post(slackWebhookUrl, message);
    core.info('Slack notification sent successfully!');
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
