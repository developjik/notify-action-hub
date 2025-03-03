const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

async function sendNotification(url, message) {
  try {
    await axios.post(url, message);
    core.info('Notification sent successfully!');
  } catch (error) {
    core.error(`Failed to send notification: ${error.message}`);
  }
}

async function run() {
  try {
    const slackWebhookUrl = core.getInput('slack_webhook_url');
    const discordWebhookUrl = core.getInput('discord_webhook_url');
    const telegramBotToken = core.getInput('telegram_bot_token');
    const telegramChatId = core.getInput('telegram_chat_id');

    const { payload } = github.context;

    if (!payload.ref || !payload.ref.startsWith('refs/heads/')) {
      core.setFailed('This action should only run on branch delete events.');
      return;
    }

    const branchName = payload.ref.replace('refs/heads/', '');

    const textMessage = `🗑️ *Branch Deleted*\n\n🔹 Branch: *${branchName}* was deleted.`;
    const slackDiscordMessage = { text: textMessage };

    if (slackWebhookUrl) {
      await sendNotification(slackWebhookUrl, slackDiscordMessage);
    }
    if (discordWebhookUrl) {
      await sendNotification(discordWebhookUrl, slackDiscordMessage);
    }
    if (telegramBotToken && telegramChatId) {
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const telegramMessage = {
        chat_id: telegramChatId,
        text: textMessage,
        parse_mode: 'Markdown',
      };
      await sendNotification(telegramUrl, telegramMessage);
    }
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
