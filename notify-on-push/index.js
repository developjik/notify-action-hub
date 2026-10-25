// GitHub Actions의 핵심 기능(입출력, 로깅 등)을 제공하는 모듈
const core = require('@actions/core');
// GitHub 이벤트 데이터(예: 푸시 이벤트의 페이로드)에 접근할 수 있는 모듈
const github = require('@actions/github');
// 파일 시스템 작업(비동기)을 위한 모듈; 배치 데이터를 파일로 저장/읽기 위해 사용
const fs = require('fs').promises;
// 공통 알림 모듈: 입력 파싱·플랫폼 검증·전송·이스케이프·실패 격리를 제공 (ncc로 함께 번들링됨)
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
// 푸시 액션 전용 순수 헬퍼: 시간대 게이팅·커밋 수 게이트·파일 요약·품질 점수 (ncc로 함께 번들링됨)
const {
  isWithinTimeRange,
  meetsMinCommitCount,
  buildFileSummary,
  calculateQualityScore,
} = require('./lib');

// 메인 실행 함수: 비동기로 동작하며, 푸시 이벤트 처리 및 알림 전송을 담당
async function run() {
  try {
    // --- 입력값 가져오기 ---
    // 알림 플랫폼 입력값은 공통 모듈에서 파싱 (웹훅/토큰은 setSecret로 마스킹됨)
    const inputs = getNotificationInputs();
    // action.yml에서 정의된 푸시 전용 입력값을 가져옴
    const includeDiffLinks = core.getInput('include_diff_links') !== 'false'; // 커밋 diff 링크 포함 여부 (기본값 true)
    const notifyTimeRange = core.getInput('notify_time_range'); // 알림 전송 허용 시간 범위 (예: "09:00-17:00 UTC")
    const minCommitCount = parseInt(core.getInput('min_commit_count')) || 1; // 최소 커밋 수 (기본값 1)
    const batchInterval = parseInt(core.getInput('batch_interval')) || 0; // 배치 간격(분 단위, 기본값 0=즉시 전송)
    const showQualityScore = core.getInput('show_quality_score') === 'true'; // 품질 점수 표시 여부 (기본값 false)
    const messagePrefix = core.getInput('message_prefix'); // 알림 메시지 접두사 (기본값 없음)

    // --- 최소 조건 확인 ---
    // 적어도 하나의 알림 방법(Slack, Discord, Telegram)이 설정되어야 함 (전송 이전에 검증)
    const platformError = validateNotificationPlatforms(inputs);
    if (platformError) {
      setSkippedOutputs();
      core.setFailed(platformError);
      return;
    }

    // --- 시간대 제한 확인 ---
    // notify_time_range가 설정된 경우, 현재 UTC 시간이 허용 범위 내인지 확인
    // (자정을 걸치는 범위 예: "23:00-06:00" 도 lib에서 지원)
    if (notifyTimeRange && !isWithinTimeRange(notifyTimeRange)) {
      setSkippedOutputs();
      core.info(`Notification skipped: outside time range (${notifyTimeRange})`);
      return;
    }

    // --- 배치 처리 ---
    const batchFile = 'batch_data.json'; // 배치 데이터를 저장할 파일 이름
    // 배치 데이터 초기값: 이벤트 배열과 마지막 전송 시간
    let batchedData = { events: [], lastSent: 0 };
    try {
      // 기존 배치 파일이 있으면 읽어서 데이터 복원
      batchedData = JSON.parse(await fs.readFile(batchFile, 'utf8'));
    } catch {
      // 파일이 없거나 오류 시 새로 생성(초기값 유지)
    }

    // GitHub 푸시 이벤트 데이터에서 필요한 정보 추출
    const { repository, pusher, commits } = github.context.payload;
    // 현재 푸시 이벤트를 배치 데이터에 추가
    const eventData = { repository, pusher, commits, timestamp: Date.now() };
    batchedData.events.push(eventData);

    // 배치 간격이 설정된 경우, 지정된 시간이 지나지 않았으면 대기
    if (batchInterval > 0) {
      const now = Date.now(); // 현재 시간(밀리초)
      const timeSinceLastSent = (now - batchedData.lastSent) / (1000 * 60); // 마지막 전송 후 경과 시간(분)
      if (timeSinceLastSent < batchInterval) {
        // 파일에 배치 데이터 저장 후 종료
        await fs.writeFile(batchFile, JSON.stringify(batchedData));
        setSkippedOutputs();
        core.info(`Event batched. Waiting for ${batchInterval} minutes.`);
        return;
      }
    }

    // --- 메시지 생성 준비 ---
    let allCommits = [], // 배치된 모든 커밋을 저장할 배열
      fileSummary = '', // 파일 변경 요약 문자열
      qualityScore = 0; // 품질 점수
    // 배치된 푸시 이벤트 수 (메시지 복수형 표기에 사용; 아래에서 배치 초기화 전에 캡처)
    const eventCount = batchedData.events.length;
    const hasCommits = eventCount > 0; // 실질적으로 항상 true (위에서 방금 이벤트를 추가함)

    // 배치된 이벤트가 있는 경우 처리
    if (hasCommits) {
      // 모든 이벤트에서 커밋을 합침
      batchedData.events.forEach((event) => {
        if (event.commits && event.commits.length > 0) {
          allCommits.push(...event.commits); // 스프레드 연산자로 커밋 추가
        }
      });

      // 최소 커밋 수 미달 시 알림 스킵
      if (!meetsMinCommitCount(allCommits, minCommitCount)) {
        // 배치 데이터 초기화 후 저장
        await fs.writeFile(
          batchFile,
          JSON.stringify({ events: [], lastSent: batchedData.lastSent }),
        );
        setSkippedOutputs();
        core.info(
          `Notification skipped: commit count (${allCommits.length}) below minimum (${minCommitCount})`,
        );
        return;
      }

      // 파일 변경 요약 계산 (lib 헬퍼 사용)
      fileSummary = buildFileSummary(allCommits);

      // 품질 점수 계산 (설정 시, lib 헬퍼 사용)
      if (showQualityScore) {
        qualityScore = calculateQualityScore(allCommits);
      }

      // 배치 데이터 초기화 및 저장
      batchedData.events = [];
      batchedData.lastSent = Date.now();
      await fs.writeFile(batchFile, JSON.stringify(batchedData));
    }

    // --- 플랫폼별 메시지 빌드 헬퍼 ---
    // 커밋 메시지는 사용자가 생성한 자유 텍스트이므로 플랫폼별 이스케이프 함수(escape)를
    // 받아 각 플랫폼 마크업 규칙에 맞게 치환한다.
    // 액터명·저장소명·URL·숫자 등 구조적 필드는 이스케이프하지 않는다.
    const buildCommitDetails = (escape) =>
      allCommits
        .map((c) => {
          let authorName = c.author && c.author.name ? c.author.name : 'Unknown'; // 커밋 작성자 이름, 없으면 'Unknown'
          let commitLine = `- ${escape(c.message)} (by ${authorName})`; // 기본 커밋 라인 (커밋 메시지 이스케이프 적용)
          if (includeDiffLinks && c.html_url) {
            // diff 링크 포함 설정 시 URL 추가
            commitLine += ` [View Diff](${c.html_url})`;
          }
          return commitLine;
        })
        .join('\n'); // 줄바꿈으로 연결

    // 최종 메시지 생성 (커밋 없는 푸시의 경우 기본 메시지)
    // message_prefix가 설정된 경우 각 플랫폼 메시지 앞에 `${prefix}\n`으로 결합한다.
    const buildMessage = (escape) => {
      const body = !hasCommits
        ? `🎉 *New push to ${repository.full_name}* 🎉\n\n` +
          `🔹 *Pusher:* ${pusher.name}\n` +
          `🔹 *Commit count:* 0\n` +
          `🔗 [View Repository](${repository.html_url})`
        : `🎉 *New push${eventCount > 1 ? 'es' : ''} to ${repository.full_name}* 🎉\n\n` + // 배치된 푸시 수에 따라 복수형 처리
          `🔹 *Pusher:* ${pusher.name}${eventCount > 1 ? ' and others' : ''}\n` + // 여러 푸시 시 "and others" 추가
          `🔹 *Commit count:* ${allCommits.length}\n` +
          fileSummary +
          (showQualityScore ? `🔹 *Quality Score:* ${qualityScore.toFixed(1)}/100\n` : '') + // 품질 점수 표시 (소수점 1자리)
          `🔹 *Commits:*\n${buildCommitDetails(escape)}\n` +
          `🔗 [View Repository](${repository.html_url})`;
      return formatMessageWithPrefix(messagePrefix, body);
    };

    // --- 알림 전송 (공통 모듈 notifyAll: 플랫폼별 실패 격리 처리) ---
    // 각 플랫폼은 자신의 이스케이프 함수로 커밋 메시지를 치환한 메시지를 받는다.
    await notifyAll(inputs, {
      slack: () => ({
        text: buildMessage(escapeForSlack),
        attachments: [
          {
            color: '#5865F2', // Slack 메시지 색상 (파란색)
            text: `Push event at ${new Date().toUTCString()}`, // 푸시 시간 표시
          },
        ],
      }),
      discord: () => ({
        content: buildMessage(escapeForDiscord),
        embeds: [
          {
            color: 0x5865f2, // Discord 임베드 색상 (16진수, 파란색)
            description: `Push event at ${new Date().toUTCString()}`,
          },
        ],
      }),
      telegram: () => ({
        text: buildMessage(escapeForTelegram),
        parse_mode: 'Markdown', // Markdown 형식으로 파싱
      }),
    });
  } catch (error) {
    // 전체 실행 중 오류 발생 시 실패 처리
    core.setFailed(`Error: ${error.message}`);
  }
}

// 함수 실행: GitHub Actions 워크플로우에서 이 스크립트가 실행됨
run();
