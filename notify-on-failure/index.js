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

    const jobName = core.getInput('job_name') || 'Unknown Job';
    const repo = github.context.repo;
    const workflowUrl = `${github.context.server_url}/${repo.owner}/${repo.repo}/actions`;

    // --- 메시지 접두사 ---
    // message_prefix가 설정된 경우 각 플랫폼 메시지 앞에 `${prefix}\n`으로 결합된다.
    const messagePrefix = core.getInput('message_prefix');

    // --- 메시지 빌드 ---
    // 잡 이름·저장소명·URL은 구조적 필드(워크플로우 설정값)이므로 이스케이프하지 않는다.
    const messageText = formatMessageWithPrefix(
      messagePrefix,
      `❌ *Workflow Failure Alert*\n\n` +
        `⚠️ *Job:* ${jobName} failed\n` +
        `📌 Repository: ${repo.owner}/${repo.repo}\n` +
        `🔗 [View Workflow Run](${workflowUrl})`,
    );

    // --- 알림 전송 (플랫폼별 실패 격리는 notifyAll 내부에서 처리) ---
    await notifyAll(inputs, {
      slack: () => ({ text: messageText }),
      discord: () => ({ content: messageText }),
      telegram: () => ({ text: messageText, parse_mode: 'Markdown' }),
    });
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
