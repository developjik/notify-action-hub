// notify-action-hub 공통 알림 모듈
//
// 7개 notify-on-* 액션이 공유하던 골격(웹훅 입력 파싱 → 플랫폼 검증 →
// 플랫폼별 전송 → 실패 격리)을 한 곳에서 제공한다.
// 각 액션의 dist/index.js는 독립 번들이어야 하므로, 각 액션에서
// `require('../common/notify')`로 상대경로 참조 후 `ncc build`로 함께 번들링한다.

const core = require('@actions/core');
const axios = require('axios');

// --- 입력 파싱 및 시크릿 마스킹 ---
// slack/discord/telegram 알림 입력값을 읽어 반환한다.
// 값이 있는 웹훅 URL·봇 토큰은 core.setSecret()으로 등록해 로그 노출을 방지한다.
function getNotificationInputs() {
  const slackWebhookUrl = core.getInput('slack_webhook_url');
  const discordWebhookUrl = core.getInput('discord_webhook_url');
  const telegramBotToken = core.getInput('telegram_bot_token');
  const telegramChatId = core.getInput('telegram_chat_id');

  if (slackWebhookUrl) {
    core.setSecret(slackWebhookUrl);
  }
  if (discordWebhookUrl) {
    core.setSecret(discordWebhookUrl);
  }
  if (telegramBotToken) {
    core.setSecret(telegramBotToken);
  }

  return {
    slackWebhookUrl,
    discordWebhookUrl,
    telegramBotToken,
    telegramChatId,
  };
}

// --- 플랫폼 검증 ---
// 설정된 알림 플랫폼이 하나도 없으면 에러 메시지를 반환하고, 정상이면 null을 반환한다.
// 각 액션은 알림 전송 이전에 이 함수를 호출해야 한다.
// (Telegram은 봇 토큰과 채팅 ID가 모두 있어야 전송 가능하므로 둘 다 확인한다.)
function validateNotificationPlatforms(inputs) {
  const slackConfigured = Boolean(inputs.slackWebhookUrl);
  const discordConfigured = Boolean(inputs.discordWebhookUrl);
  const telegramConfigured = Boolean(inputs.telegramBotToken && inputs.telegramChatId);

  if (!slackConfigured && !discordConfigured && !telegramConfigured) {
    return 'At least one notification method (Slack, Discord, or Telegram) must be provided.';
  }
  return null;
}

// --- 플랫폼별 전송 ---
// Slack/Discord는 웹훅으로 JSON POST, Telegram은 sendMessage API로 POST한다.

async function sendToSlack(url, payload) {
  await axios.post(url, payload);
  core.info('Slack notification sent successfully!');
}

async function sendToDiscord(url, payload) {
  await axios.post(url, payload);
  core.info('Discord notification sent successfully!');
}

async function sendToTelegram(botToken, chatId, payload) {
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await axios.post(telegramUrl, { chat_id: chatId, ...payload });
  core.info('Telegram notification sent successfully!');
}

// --- 사용자 콘텐츠 이스케이프 헬퍼 ---
// 커밋 메시지·이슈/PR 제목·댓글 본문·릴리즈 이름 등 사용자가 생성한 자유 텍스트에
// 각 플랫폼 마크업에 맞는 이스케이프를 적용한다. text가 falsy면 그대로 반환한다.

// Slack: &, <, > 를 HTML 엔티티로 치환하면 마크업/링크 인젝션이 해석되지 않는다.
function escapeForSlack(text) {
  if (!text) {
    return text;
  }
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Discord: \, *, _, ~, `, | 앞에 백슬래시를 붙인다.
function escapeForDiscord(text) {
  if (!text) {
    return text;
  }
  return String(text).replace(/([\\*_~`|])/g, '\\$1');
}

// Telegram MarkdownV2: 특수문자 _*[]()~>#+-=|{}.! 및 \ 앞에 백슬래시를 붙인다.
function escapeForTelegram(text) {
  if (!text) {
    return text;
  }
  return String(text).replace(/([_*[\]()~>#+\-=|{}.!\\])/g, '\\$1');
}

// --- HTTP 에러 요약 ---
// 웹훅 URL·봇 토큰이 로그(에러 메시지 포함)에 노출되지 않도록
// 상태 코드/에러 코드 정도만 포함한 짧은 요약을 만든다.
function describeHttpError(error) {
  if (error && error.response && error.response.status) {
    return `status ${error.response.status}`;
  }
  if (error && error.code) {
    return `network error (${error.code})`;
  }
  return 'request failed';
}

// 페이로드 인자는 객체 또는 객체를 반환하는 함수를 허용한다.
// 함수 형태로 전달하면 해당 플랫폼이 설정된 경우에만 빌드된다.
function resolvePayload(payload) {
  return typeof payload === 'function' ? payload() : payload;
}

// --- 메시지 접두사 헬퍼 ---
// message_prefix 입력값이 있으면 `${prefix}\n`을 메시지 앞에 결합한다.
// prefix는 워크플로우 설정값(예: 프로젝트명)이므로 별도 이스케이프하지 않는다.
function formatMessageWithPrefix(prefix, text) {
  if (!prefix) {
    return text;
  }
  return `${prefix}\n${text}`;
}

// --- 알림 결과 outputs 설정 ---
// 모든 notify-on-* 액션이 동일한 출력 규격을 사용한다.
//   notification_status: sent(전부 성공) / partial(일부 실패) / failed(전체 실패)
//                        / dry-run(dry_run=true) / skipped(조기 스킵)
//   failed_platforms: 실패한 플랫폼의 쉼표 목록 (없으면 빈 문자열)
function setNotificationOutputs(status, failedPlatforms) {
  core.setOutput('notification_status', status);
  core.setOutput('failed_platforms', failedPlatforms.join(','));
}

// 플랫폼 미설정 등으로 알림 전송 전에 조기 스킵하는 경로에서 호출하는 헬퍼.
// 각 액션은 조기 return 직전에 이 함수를 호출해 후속 스텝이 결과를 참조할 수 있게 한다.
function setSkippedOutputs() {
  setNotificationOutputs('skipped', []);
}

// --- 통합 전송 (플랫폼별 실패 격리) ---
// payloads = { slack, discord, telegram }: 각 값은 페이로드 객체(또는 객체 반환 함수)이며
// 해당 플랫폼이 설정된 경우에만 빌드/전송한다. Telegram 페이로드에는 chat_id가 자동 포함된다.
//
// dry_run=true면 실제 전송 대신 각 대상 플랫폼과 페이로드(JSON 문자열)를
// core.info로 출력하고 전송 성공(sent)으로 간주한다.
//
// 실패 격리 정책:
//   - 각 전송을 개별 try/catch로 격리한다.
//   - 일부 플랫폼만 실패 → core.warning() 후 정상 반환 (run은 계속)
//   - 설정된 전체 플랫폼 실패 → throw (액션 최상위 catch에서 setFailed 처리)
//
// 결과 outputs:
//   - dry_run → 'dry-run', 전부 성공 → 'sent', 일부 실패 → 'partial',
//     전체 실패 → throw 전에 'failed' 설정
//
// 반환값: { sent: 성공 플랫폼 목록, skipped: 미설정 플랫폼 목록, failed: 실패 플랫폼 목록 }
async function notifyAll(inputs, payloads = {}) {
  // action.yml에 default 'false'가 선언되어 있어 값이 항상 존재한다
  const dryRun = core.getBooleanInput('dry_run');

  // buildPayload: dry_run 로그에 표시할 "실제 전송 형태"의 페이로드를 만든다.
  // Telegram은 전송 시 chat_id가 병합되므로 dry_run 로그에도 동일하게 병합한다.
  const targets = [
    {
      name: 'Slack',
      configured: Boolean(inputs.slackWebhookUrl),
      buildPayload: () => resolvePayload(payloads.slack),
      send: (payload) => sendToSlack(inputs.slackWebhookUrl, payload),
    },
    {
      name: 'Discord',
      configured: Boolean(inputs.discordWebhookUrl),
      buildPayload: () => resolvePayload(payloads.discord),
      send: (payload) => sendToDiscord(inputs.discordWebhookUrl, payload),
    },
    {
      name: 'Telegram',
      configured: Boolean(inputs.telegramBotToken && inputs.telegramChatId),
      buildPayload: () => ({
        chat_id: inputs.telegramChatId,
        ...resolvePayload(payloads.telegram),
      }),
      send: (payload) => sendToTelegram(inputs.telegramBotToken, inputs.telegramChatId, payload),
    },
  ];

  const configuredTargets = targets.filter((target) => target.configured);
  const sent = [];
  const skipped = [];
  const failed = [];
  const failureReasons = [];

  for (const target of targets) {
    if (!target.configured) {
      skipped.push(target.name);
      continue;
    }

    if (dryRun) {
      // 실제 전송 대신 대상 플랫폼과 페이로드를 로그로 출력하고 sent로 간주
      core.info(
        `[dry-run] ${target.name}에 전송할 페이로드: ${JSON.stringify(target.buildPayload())}`,
      );
      sent.push(target.name);
      continue;
    }

    try {
      await target.send(target.buildPayload());
      sent.push(target.name);
    } catch (error) {
      failed.push(target.name);
      failureReasons.push(`${target.name}: ${describeHttpError(error)}`);
    }
  }

  if (dryRun) {
    setNotificationOutputs('dry-run', failed);
    core.info(`[dry-run] dry_run=true — 실제 전송을 생략했습니다 (대상: ${sent.join(', ')})`);
    return { sent, skipped, failed };
  }

  if (failed.length > 0) {
    // throw 전에 먼저 outputs을 설정한다 (전체 실패 시에도 후속 스텝이 상태를 참조 가능)
    setNotificationOutputs(
      failed.length === configuredTargets.length ? 'failed' : 'partial',
      failed,
    );

    if (failed.length === configuredTargets.length) {
      // 설정된 전체 플랫폼이 실패한 경우에만 run 실패로 전파
      throw new Error(`All configured notification platforms failed: ${failureReasons.join(', ')}`);
    }
    // 일부 실패는 경고로만 기록
    core.warning(`일부 플랫폼 전송 실패: ${failureReasons.join(', ')}`);
  } else if (sent.length > 0) {
    setNotificationOutputs('sent', failed);
    core.info('All notifications sent successfully!');
  } else {
    // 이 경로는 액션이 사전 검증을 통과한 경우 발생하지 않는다(방어적 처리)
    setSkippedOutputs();
  }

  return { sent, skipped, failed };
}

module.exports = {
  getNotificationInputs,
  validateNotificationPlatforms,
  sendToSlack,
  sendToDiscord,
  sendToTelegram,
  escapeForSlack,
  escapeForDiscord,
  escapeForTelegram,
  formatMessageWithPrefix,
  setNotificationOutputs,
  setSkippedOutputs,
  notifyAll,
};
