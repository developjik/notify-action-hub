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
    const issue = payload.issue;

    if (!issue) {
      core.setFailed('This action should only run on issue events.');
      return;
    }

    const message =
      `🐞 *Issue Alert* 🐞\n\n` +
      `🔹 *Title:* ${issue.title}\n` +
      `🔹 *Author:* ${issue.user.login}\n` +
      `🔹 *State:* ${issue.state}\n` +
      `🔹 [View Issue](${issue.html_url})`;

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

    if (
      !slackWebhookUrl &&
      !discordWebhookUrl &&
      (!telegramBotToken || !telegramChatId)
    ) {
      core.setFailed('No valid notification platform configured.');
    }
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
