const core = require('@actions/core');
const github = require('@actions/github');
// 공통 알림 모듈: 입력 파싱·플랫폼 검증·전송·이스케이프를 제공 (ncc로 함께 번들링됨)
const {
  getNotificationInputs,
  validateNotificationPlatforms,
  notifyAll,
  escapeForSlack,
  escapeForDiscord,
  escapeForTelegram,
  setSkippedOutputs,
  formatMessageWithPrefix,
} = require('../common/notify');

async function run() {
  try {
    // --- 알림 플랫폼 입력값 파싱 (웹훅/토큰은 setSecret로 마스킹됨) ---
    const inputs = getNotificationInputs();

    // 설정된 알림 플랫폼이 하나도 없으면 실패 처리 (전송 이전에 검증)
    const platformError = validateNotificationPlatforms(inputs);
    if (platformError) {
      setSkippedOutputs();
      core.setFailed(platformError);
      return;
    }

    const { payload } = github.context;
    const issue = payload.issue;

    if (!issue) {
      core.setFailed('This action should only run on issue events.');
      return;
    }

    // --- 메시지 접두사 ---
    // message_prefix가 설정된 경우 각 플랫폼 메시지 앞에 `${prefix}\n`으로 결합된다.
    const messagePrefix = core.getInput('message_prefix');

    // --- 플랫폼별 메시지 빌드 ---
    // 이슈 제목은 사용자가 생성한 자유 텍스트이므로 각 플랫폼 마크업 규칙에 맞게 이스케이프.
    // 액터명·상태·URL 등 구조적 필드는 이스케이프하지 않는다.
    const buildMessage = (escapedTitle) =>
      formatMessageWithPrefix(
        messagePrefix,
        `🐞 *Issue Alert* 🐞\n\n` +
          `🔹 *Title:* ${escapedTitle}\n` +
          `🔹 *Author:* ${issue.user.login}\n` +
          `🔹 *State:* ${issue.state}\n` +
          `🔹 [View Issue](${issue.html_url})`,
      );

    // --- 알림 전송 (플랫폼별 실패 격리는 notifyAll 내부에서 처리) ---
    await notifyAll(inputs, {
      slack: () => ({ text: buildMessage(escapeForSlack(issue.title)) }),
      discord: () => ({
        content: buildMessage(escapeForDiscord(issue.title)),
      }),
      telegram: () => ({
        text: buildMessage(escapeForTelegram(issue.title)),
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
