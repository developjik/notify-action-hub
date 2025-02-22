const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

(async () => {
  try {
    // Slack Webhook URL from inputs
    const webhookUrl = core.getInput('slack_webhook_url');

    // Get push event details
    const { repository, pusher, commits } = github.context.payload;

    // Construct message
    const message = {
      text: `🎉 *New push to ${repository.full_name}* 🎉
- Pusher: ${pusher.name}
- Commit count: ${commits.length}
- [View Repository](${repository.html_url})`,
    };

    // Send message to Slack
    await axios.post(webhookUrl, message);
    core.info('Slack notification sent successfully!');
  } catch (error) {
    core.setFailed(`Failed to send Slack notification: ${error.message}`);
  }
})();
