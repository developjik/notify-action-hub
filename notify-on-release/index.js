const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function sendSlackNotification(webhookUrl, release) {
  const message = {
    text:
      `🚀 *New Release Published!*\n\n` +
      `🔹 *Release:* ${release.name}\n` +
      `🔹 *Tag:* ${release.tag_name}\n` +
      `🔹 [View Release](${release.html_url})`,
  };

  await axios.post(webhookUrl, message);
  core.info('Slack notification sent successfully!');
}

async function sendDiscordNotification(webhookUrl, release) {
  const message = {
    embeds: [
      {
        title: `🚀 New Release Published!`,
        description: `🔹 **Release:** ${release.name}\n🔹 **Tag:** ${release.tag_name}`,
        url: release.html_url,
        color: 3066993, // Blue-Green color
      },
    ],
  };

  await axios.post(webhookUrl, message);
  core.info('Discord notification sent successfully!');
}

async function sendTelegramNotification(botToken, chatId, release) {
  const message =
    `🚀 *New Release Published!*\n\n` +
    `🔹 *Release:* ${release.name}\n` +
    `🔹 *Tag:* ${release.tag_name}\n` +
    `🔹 [View Release](${release.html_url})`;

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await axios.post(telegramUrl, {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  });

  core.info('Telegram notification sent successfully!');
}

async function run() {
  try {
    const slackWebhookUrl = core.getInput('slack_webhook_url');
    const discordWebhookUrl = core.getInput('discord_webhook_url');
    const telegramBotToken = core.getInput('telegram_bot_token');
    const telegramChatId = core.getInput('telegram_chat_id');

    const { payload } = github.context;
    const release = payload.release;

    if (!release) {
      core.setFailed('This action should only run on release events.');
      return;
    }

    const promises = [];

    if (slackWebhookUrl) {
      promises.push(sendSlackNotification(slackWebhookUrl, release));
    }
    if (discordWebhookUrl) {
      promises.push(sendDiscordNotification(discordWebhookUrl, release));
    }
    if (telegramBotToken && telegramChatId) {
      promises.push(
        sendTelegramNotification(telegramBotToken, telegramChatId, release)
      );
    }

    if (promises.length === 0) {
      core.setFailed('At least one notification method must be provided.');
      return;
    }

    await Promise.all(promises);
    core.info('All notifications sent successfully!');
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
