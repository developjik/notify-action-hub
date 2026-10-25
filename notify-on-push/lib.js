// notify-on-push 순수 헬퍼 함수 모음 (단위 테스트 대상)
//
// 시간대 파싱/게이팅, 최소 커밋 수 게이트, 파일 변경 요약, 품질 점수 계산 등
// 부수효과 없는 로직만 담는다. index.js는 이 모듈을 require해 사용하며
// ncc 빌드 시 함께 번들링된다.

// "HH:MM-HH:MM" 형식의 시간 범위를 분 단위 시작/종료 값으로 파싱한다.
// 형식이 맞지 않으면 NaN이 포함된 객체를 반환한다(제한 없음으로 처리됨).
function parseTimeRange(timeRange) {
  const [start, end] = timeRange.split('-').map((t) => t.trim());
  if (!start || !end) {
    return { startMinutes: NaN, endMinutes: NaN };
  }
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  return {
    startMinutes: startHour * 60 + startMin,
    endMinutes: endHour * 60 + endMin,
  };
}

// Date 객체의 현재 UTC 시각을 "하루 몇 분" 값(0~1439)으로 반환한다.
function getCurrentMinutesUtc(now = new Date()) {
  return now.getUTCHours() * 60 + now.getUTCMinutes();
}

// 현재 UTC 시각이 알림 허용 시간 범위 안인지 확인한다.
// - 일반 범위(예: "09:00-17:00"): start <= 현재 <= end (경계 포함)
// - 자정을 걸치는 범위(예: "23:00-06:00"): start > end인 경우 자정 기준으로 감아서 판정
// - 범위 미설정 또는 파싱 실패: 항상 true (제한 없음)
function isWithinTimeRange(timeRange, now = new Date()) {
  if (!timeRange) {
    return true;
  }
  const { startMinutes, endMinutes } = parseTimeRange(timeRange);
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return true;
  }
  const currentMinutes = getCurrentMinutesUtc(now);
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  // 자정을 걸치는 범위: 시작 시각 이후이거나 종료 시각 이전이면 허용
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

// 커밋 수가 최소 커밋 수 게이트(min_commit_count)를 통과하는지 확인한다.
function meetsMinCommitCount(commits, minCommitCount) {
  return commits.length >= minCommitCount;
}

// 커밋 배열에서 추가/수정/삭제 파일 수를 집계해 요약 라인을 만든다.
function buildFileSummary(commits) {
  let added = 0;
  let modified = 0;
  let removed = 0;
  commits.forEach((commit) => {
    added += commit.added?.length || 0;
    modified += commit.modified?.length || 0;
    removed += commit.removed?.length || 0;
  });
  return `🔸 *Files:* +${added}/~${modified}/-${removed}\n`;
}

// 품질 점수: 커밋별 (메시지 길이 > 10자 → +50) + (변경 파일 수 < 10 → +30) 점수의 평균.
function calculateQualityScore(commits) {
  if (!commits || commits.length === 0) {
    return 0;
  }
  return (
    commits.reduce((score, commit) => {
      const messageLengthScore = commit.message.length > 10 ? 50 : 0;
      const fileChangeScore =
        (commit.added?.length + commit.modified?.length + commit.removed?.length || 0) < 10
          ? 30
          : 0;
      return score + messageLengthScore + fileChangeScore;
    }, 0) / commits.length || 0
  );
}

module.exports = {
  parseTimeRange,
  getCurrentMinutesUtc,
  isWithinTimeRange,
  meetsMinCommitCount,
  buildFileSummary,
  calculateQualityScore,
};
