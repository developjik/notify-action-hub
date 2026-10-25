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
    const release = payload.release;

    if (!release) {
      core.setFailed('This action should only run on release events.');
      return;
    }

    // --- 메시지 접두사 ---
    // message_prefix가 설정된 경우 각 플랫폼 메시지 앞에 `${prefix}\n`으로 결합된다.
    const messagePrefix = core.getInput('message_prefix');

    // --- 플랫폼별 메시지 빌드 ---
    // 릴리즈 이름은 사용자가 생성한 자유 텍스트이므로 각 플랫폼 마크업 규칙에 맞게 이스케이프.
    // 태그명·URL 등 구조적 필드는 이스케이프하지 않는다.
    const buildMessage = (escapedName) =>
      formatMessageWithPrefix(
        messagePrefix,
        `🚀 *New Release Published!*\n\n` +
          `🔹 *Release:* ${escapedName}\n` +
          `🔹 *Tag:* ${release.tag_name}\n` +
          `🔹 [View Release](${release.html_url})`,
      );

    // --- 알림 전송 (플랫폼별 실패 격리는 notifyAll 내부에서 처리) ---
    await notifyAll(inputs, {
      slack: () => ({ text: buildMessage(escapeForSlack(release.name)) }),
      discord: () => ({
        embeds: [
          {
            title: `🚀 New Release Published!`,
            // Discord는 임베드 구조상 첫 텍스트인 description에 접두사를 반영한다
            description: formatMessageWithPrefix(
              messagePrefix,
              `🔹 **Release:** ${escapeForDiscord(release.name)}\n🔹 **Tag:** ${release.tag_name}`,
            ),
            url: release.html_url,
            color: 3066993, // Blue-Green color
          },
        ],
      }),
      telegram: () => ({
        text: buildMessage(escapeForTelegram(release.name)),
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
