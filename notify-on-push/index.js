// GitHub Actions의 핵심 기능(입출력, 로깅 등)을 제공하는 모듈
const core = require('@actions/core');
// GitHub 이벤트 데이터(예: 푸시 이벤트의 페이로드)에 접근할 수 있는 모듈
const github = require('@actions/github');
// HTTP 요청을 보내기 위한 라이브러리(알림 전송에 사용)
const axios = require('axios');
// 파일 시스템 작업(비동기)을 위한 모듈; 배치 데이터를 파일로 저장/읽기 위해 사용
const fs = require('fs').promises;

// 메인 실행 함수: 비동기로 동작하며, 푸시 이벤트 처리 및 알림 전송을 담당
async function run() {
  try {
    // --- 입력값 가져오기 ---
    // action.yml에서 정의된 입력값을 가져옴
    const slackWebhookUrl = core.getInput('slack_webhook_url'); // Slack 알림을 위한 웹훅 URL
    const discordWebhookUrl = core.getInput('discord_webhook_url'); // Discord 알림을 위한 웹훅 URL
    const telegramBotToken = core.getInput('telegram_bot_token'); // Telegram 봇 토큰
    const telegramChatId = core.getInput('telegram_chat_id'); // Telegram 채팅 ID
    const includeDiffLinks = core.getInput('include_diff_links') !== 'false'; // 커밋 diff 링크 포함 여부 (기본값 true)
    const notifyTimeRange = core.getInput('notify_time_range'); // 알림 전송 허용 시간 범위 (예: "09:00-17:00 UTC")
    const minCommitCount = parseInt(core.getInput('min_commit_count')) || 1; // 최소 커밋 수 (기본값 1)
    const batchInterval = parseInt(core.getInput('batch_interval')) || 0; // 배치 간격(분 단위, 기본값 0=즉시 전송)
    const showQualityScore = core.getInput('show_quality_score') === 'true'; // 품질 점수 표시 여부 (기본값 false)

    // --- 최소 조건 확인 ---
    // 적어도 하나의 알림 방법(Slack, Discord, Telegram)이 설정되어야 함
    if (!slackWebhookUrl && !discordWebhookUrl && !telegramBotToken) {
      // 조건 불충족 시 워크플로우 실패 처리
      core.setFailed(
        'At least one notification method (Slack, Discord, or Telegram) must be provided.'
      );
      return; // 함수 종료
    }

    // --- 시간대 제한 확인 ---
    // notify_time_range가 설정된 경우, 현재 시간이 허용 범위 내인지 확인
    if (notifyTimeRange) {
      // "HH:MM-HH:MM" 형식의 문자열을 시작/종료 시간으로 분리
      const [start, end] = notifyTimeRange.split('-').map((t) => t.trim());
      const now = new Date(); // 현재 UTC 시간
      const [startHour, startMin] = start.split(':').map(Number); // 시작 시간(시:분)을 숫자로 변환
      const [endHour, endMin] = end.split(':').map(Number); // 종료 시간(시:분)을 숫자로 변환
      const currentHour = now.getUTCHours(); // 현재 시간(시)
      const currentMin = now.getUTCMinutes(); // 현재 시간(분)

      // 시간을 분 단위로 변환하여 비교
      const startTime = startHour * 60 + startMin; // 시작 시간(분)
      const endTime = endHour * 60 + endMin; // 종료 시간(분)
      const currentTime = currentHour * 60 + currentMin; // 현재 시간(분)

      // 현재 시간이 범위 밖이면 알림 스킵
      if (currentTime < startTime || currentTime > endTime) {
        core.info(
          `Notification skipped: outside time range (${notifyTimeRange})`
        );
        return;
      }
    }

    // --- 배치 처리 ---
    const batchFile = 'batch_data.json'; // 배치 데이터를 저장할 파일 이름
    // 배치 데이터 초기값: 이벤트 배열과 마지막 전송 시간
    let batchedData = { events: [], lastSent: 0 };
    try {
      // 기존 배치 파일이 있으면 읽어서 데이터 복원
      batchedData = JSON.parse(await fs.readFile(batchFile, 'utf8'));
    } catch (e) {
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
        core.info(`Event batched. Waiting for ${batchInterval} minutes.`);
        return;
      }
    }

    // --- 메시지 생성 ---
    let messageText, slackPayload, discordPayload; // 각 플랫폼별 메시지 변수
    let allCommits = [], // 배치된 모든 커밋을 저장할 배열
      fileSummary = '', // 파일 변경 요약 문자열
      qualityScore = 0; // 품질 점수

    // 배치된 이벤트가 있는 경우 처리
    if (batchedData.events.length > 0) {
      // 모든 이벤트에서 커밋을 합침
      batchedData.events.forEach((event) => {
        if (event.commits && event.commits.length > 0) {
          allCommits.push(...event.commits); // 스프레드 연산자로 커밋 추가
        }
      });

      // 최소 커밋 수 미달 시 알림 스킵
      if (allCommits.length < minCommitCount) {
        core.info(
          `Notification skipped: commit count (${allCommits.length}) below minimum (${minCommitCount})`
        );
        // 배치 데이터 초기화 후 저장
        await fs.writeFile(
          batchFile,
          JSON.stringify({ events: [], lastSent: batchedData.lastSent })
        );
        return;
      }

      // 커밋 상세 정보 생성
      let commitDetails = allCommits
        .map((c) => {
          let authorName =
            c.author && c.author.name ? c.author.name : 'Unknown'; // 커밋 작성자 이름, 없으면 'Unknown'
          let commitLine = `- ${c.message} (by ${authorName})`; // 기본 커밋 라인
          if (includeDiffLinks && c.html_url) {
            // diff 링크 포함 설정 시 URL 추가
            commitLine += ` [View Diff](${c.html_url})`;
          }
          return commitLine;
        })
        .join('\n'); // 줄바꿈으로 연결

      // 파일 변경 요약 계산
      let added = 0,
        modified = 0,
        removed = 0; // 추가/수정/삭제 파일 수
      allCommits.forEach((c) => {
        added += c.added?.length || 0; // 추가된 파일 수
        modified += c.modified?.length || 0; // 수정된 파일 수
        removed += c.removed?.length || 0; // 삭제된 파일 수
      });
      fileSummary = `🔸 *Files:* +${added}/~${modified}/-${removed}\n`;

      // 품질 점수 계산 (설정 시)
      if (showQualityScore) {
        qualityScore =
          allCommits.reduce((score, c) => {
            const msgLengthScore = c.message.length > 10 ? 50 : 0; // 메시지 길이 10자 초과 시 +50
            const fileChangeScore =
              (c.added?.length + c.modified?.length + c.removed?.length || 0) <
              10
                ? 30
                : 0; // 변경 파일 10개 미만 시 +30
            return score + msgLengthScore + fileChangeScore; // 총합
          }, 0) / allCommits.length || 0; // 평균 점수
      }

      // 최종 메시지 생성
      messageText =
        `🎉 *New push${batchedData.events.length > 1 ? 'es' : ''} to ${
          repository.full_name
        }* 🎉\n\n` + // 배치된 푸시 수에 따라 복수형 처리
        `🔹 *Pusher:* ${pusher.name}${
          batchedData.events.length > 1 ? ' and others' : ''
        }\n` + // 여러 푸시 시 "and others" 추가
        `🔹 *Commit count:* ${allCommits.length}\n` +
        fileSummary +
        (showQualityScore
          ? `🔹 *Quality Score:* ${qualityScore.toFixed(1)}/100\n`
          : '') + // 품질 점수 표시 (소수점 1자리)
        `🔹 *Commits:*\n${commitDetails}\n` +
        `🔗 [View Repository](${repository.html_url})`;

      // 배치 데이터 초기화 및 저장
      batchedData.events = [];
      batchedData.lastSent = Date.now();
      await fs.writeFile(batchFile, JSON.stringify(batchedData));
    } else {
      // 배치 이벤트가 없는 경우 (커밋 없는 푸시)
      messageText =
        `🎉 *New push to ${repository.full_name}* 🎉\n\n` +
        `🔹 *Pusher:* ${pusher.name}\n` +
        `🔹 *Commit count:* 0\n` +
        `🔗 [View Repository](${repository.html_url})`;
    }

    // --- 플랫폼별 메시지 페이로드 준비 ---
    slackPayload = {
      text: messageText,
      attachments: [
        {
          color: '#5865F2', // Slack 메시지 색상 (파란색)
          text: `Push event at ${new Date().toUTCString()}`, // 푸시 시간 표시
        },
      ],
    };
    discordPayload = {
      content: messageText,
      embeds: [
        {
          color: 0x5865f2, // Discord 임베드 색상 (16진수, 파란색)
          description: `Push event at ${new Date().toUTCString()}`,
        },
      ],
    };

    // --- 알림 전송 ---
    let errors = []; // 전송 실패 시 오류 메시지 저장

    // Slack 알림 전송
    if (slackWebhookUrl) {
      try {
        await axios.post(slackWebhookUrl, slackPayload); // HTTP POST 요청으로 전송
        core.info('Slack notification sent successfully!');
      } catch (e) {
        errors.push(`Slack failed: ${e.message}`); // 오류 기록
      }
    }

    // Discord 알림 전송
    if (discordWebhookUrl) {
      try {
        await axios.post(discordWebhookUrl, discordPayload);
        core.info('Discord notification sent successfully!');
      } catch (e) {
        errors.push(`Discord failed: ${e.message}`);
      }
    }

    // Telegram 알림 전송
    if (telegramBotToken && telegramChatId) {
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`; // Telegram API 엔드포인트
      try {
        await axios.post(telegramUrl, {
          chat_id: telegramChatId,
          text: messageText,
          parse_mode: 'Markdown', // Markdown 형식으로 파싱
        });
        core.info('Telegram notification sent successfully!');
      } catch (e) {
        errors.push(`Telegram failed: ${e.message}`);
      }
    }

    // --- 결과 처리 ---
    if (errors.length > 0) {
      // 일부 알림 실패 시 경고 출력
      core.warning(`Some notifications failed:\n${errors.join('\n')}`);
    } else {
      // 모두 성공 시 정보 로그
      core.info('All notifications sent successfully!');
    }
  } catch (error) {
    // 전체 실행 중 오류 발생 시 실패 처리
    core.setFailed(`Error: ${error.message}`);
  }
}

// 함수 실행: GitHub Actions 워크플로우에서 이 스크립트가 실행됨
run();
