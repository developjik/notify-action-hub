const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    const slackWebhookUrl = core.getInput('slack_webhook_url');
    const discordWebhookUrl = core.getInput('discord_webhook_url');
    const telegramBotToken = core.getInput('telegram_bot_token');
    const telegramChatId = core.getInput('telegram_chat_id');

    const { payload } = github.context;
    const comment = payload.comment;

    if (!comment) {
      core.setFailed('This action should only run on commit comment events.');
      return;
    }

    const message = `💬 *Commit Comment Alert*\n\n🔹 *Author:* ${comment.user.login}\n🔹 *Comment:* ${comment.body}\n🔹 [View Comment](${comment.html_url})`;

    // Slack Notification
    if (slackWebhookUrl) {
      await axios.post(slackWebhookUrl, { text: message });
      core.info('Slack notification sent successfully!');
    }

    // Discord Notification
    if (discordWebhookUrl) {
      await axios.post(discordWebhookUrl, { content: message });
      core.info('Discord notification sent successfully!');
    }

    // Telegram Notification
    if (telegramBotToken && telegramChatId) {
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      await axios.post(telegramUrl, {
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      });
      core.info('Telegram notification sent successfully!');
    }
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
