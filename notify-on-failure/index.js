const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    const slackWebhookUrl = core.getInput('slack_webhook_url');
    const discordWebhookUrl = core.getInput('discord_webhook_url');
    const telegramBotToken = core.getInput('telegram_bot_token');
    const telegramChatId = core.getInput('telegram_chat_id');
    const jobName = core.getInput('job_name') || 'Unknown Job';

    if (!slackWebhookUrl && !discordWebhookUrl && !telegramBotToken) {
      core.setFailed(
        'At least one notification method (Slack, Discord, or Telegram) must be provided.'
      );
      return;
    }

    const repo = github.context.repo;
    const workflowUrl = `${github.context.server_url}/${repo.owner}/${repo.repo}/actions`;

    const messageText =
      `❌ *Workflow Failure Alert*\n\n` +
      `⚠️ *Job:* ${jobName} failed\n` +
      `📌 Repository: ${repo.owner}/${repo.repo}\n` +
      `🔗 [View Workflow Run](${workflowUrl})`;

    // Slack 알림 전송
    if (slackWebhookUrl) {
      await axios.post(slackWebhookUrl, { text: messageText });
      core.info('Slack notification sent successfully!');
    }

    // Discord 알림 전송
    if (discordWebhookUrl) {
      await axios.post(discordWebhookUrl, { content: messageText });
      core.info('Discord notification sent successfully!');
    }

    // Telegram 알림 전송
    if (telegramBotToken && telegramChatId) {
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      await axios.post(telegramUrl, {
        chat_id: telegramChatId,
        text: messageText,
        parse_mode: 'Markdown',
      });
      core.info('Telegram notification sent successfully!');
    }
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
