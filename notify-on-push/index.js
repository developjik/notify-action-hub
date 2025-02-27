const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function run() {
  try {
    const slackWebhookUrl = core.getInput('slack_webhook_url');
    const discordWebhookUrl = core.getInput('discord_webhook_url');
    const telegramBotToken = core.getInput('telegram_bot_token');
    const telegramChatId = core.getInput('telegram_chat_id');

    if (!slackWebhookUrl && !discordWebhookUrl && !telegramBotToken) {
      core.setFailed(
        'At least one notification method (Slack, Discord, or Telegram) must be provided.'
      );
      return;
    }

    const { repository, pusher, commits } = github.context.payload;

    const messageText =
      `🎉 *New push to ${repository.full_name}* 🎉\n\n` +
      `🔹 *Pusher:* ${pusher.name}\n` +
      `🔹 *Commit count:* ${commits.length}\n` +
      `🔗 [View Repository](${repository.html_url})`;

    // Slack 메시지 전송
    if (slackWebhookUrl) {
      await axios.post(slackWebhookUrl, { text: messageText });
      core.info('Slack notification sent successfully!');
    }

    // Discord 메시지 전송
    if (discordWebhookUrl) {
      await axios.post(discordWebhookUrl, { content: messageText });
      core.info('Discord notification sent successfully!');
    }

    // Telegram 메시지 전송
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