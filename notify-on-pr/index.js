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

    const { payload } = github.context;
    const pr = payload.pull_request;

    if (!pr) {
      core.setFailed('This action should only run on pull request events.');
      return;
    }

    const messageText =
      `📢 *Pull Request Alert* 📢\n\n` +
      `🔹 *Title:* ${pr.title}\n` +
      `🔹 *Author:* ${pr.user.login}\n` +
      `🔹 *State:* ${pr.state}\n` +
      `🔹 [View PR](${pr.html_url})`;

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
