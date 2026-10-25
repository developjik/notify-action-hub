const core = require('@actions/core');
const github = require('@actions/github');
// 공통 알림 모듈: 입력 파싱·플랫폼 검증·전송·이스케이프를 제공 (ncc로 함께 번들링됨)
const {
  getNotificationInputs,
  validateNotificationPlatforms,
  notifyAll,
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

    // 브랜치 삭제 이벤트 가드: refs/heads/ 형태이면서 실제 삭제(deleted === true)인 경우만 처리
    if (!payload.ref || !payload.ref.startsWith('refs/heads/') || payload.deleted !== true) {
      core.setFailed(
        'Not a branch delete event. This action only runs when a branch is actually deleted (payload.deleted === true).',
      );
      return;
    }

    const branchName = payload.ref.replace('refs/heads/', '');

    // --- 메시지 접두사 ---
    // message_prefix가 설정된 경우 각 플랫폼 메시지 앞에 `${prefix}\n`으로 결합된다.
    const messagePrefix = core.getInput('message_prefix');

    // --- 메시지 빌드 ---
    // 브랜치명은 구조적 필드이므로 이스케이프하지 않는다.
    const textMessage = formatMessageWithPrefix(
      messagePrefix,
      `🗑️ *Branch Deleted*\n\n🔹 Branch: *${branchName}* was deleted.`,
    );

    // --- 알림 전송 (플랫폼별 실패 격리는 notifyAll 내부에서 처리) ---
    // Discord는 content 필드로 전송해야 정상 발송된다.
    await notifyAll(inputs, {
      slack: () => ({ text: textMessage }),
      discord: () => ({ content: textMessage }),
      telegram: () => ({ text: textMessage, parse_mode: 'Markdown' }),
    });
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
