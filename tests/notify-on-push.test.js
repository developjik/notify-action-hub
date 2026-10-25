// notify-on-push/lib.js 단위 테스트 (순수 함수: 시간대/게이트/요약/품질 점수)

import { describe, it, expect } from 'vitest';
import {
  parseTimeRange,
  getCurrentMinutesUtc,
  isWithinTimeRange,
  meetsMinCommitCount,
  buildFileSummary,
  calculateQualityScore,
} from '../notify-on-push/lib.js';

// 지정 시각(UTC)의 Date를 만드는 헬퍼
const utc = (hour, min) => new Date(Date.UTC(2026, 0, 15, hour, min));

describe('parseTimeRange', () => {
  it('HH:MM-HH:MM 문자열을 분 단위 시작/종료 값으로 파싱한다', () => {
    expect(parseTimeRange('09:00-17:00')).toEqual({
      startMinutes: 540,
      endMinutes: 1020,
    });
    expect(parseTimeRange('23:00-06:00')).toEqual({
      startMinutes: 1380,
      endMinutes: 360,
    });
  });

  it('공백이 포함되어도 좌우 여백을 무시한다', () => {
    expect(parseTimeRange(' 09:00 - 17:30 ')).toEqual({
      startMinutes: 540,
      endMinutes: 1050,
    });
  });

  it('형식이 잘못되면 NaN을 반환한다', () => {
    const parsed = parseTimeRange('not-a-range');
    expect(Number.isNaN(parsed.startMinutes)).toBe(true);
    expect(Number.isNaN(parsed.endMinutes)).toBe(true);
  });
});

describe('getCurrentMinutesUtc', () => {
  it('UTC 시각을 하루 기준 분 값으로 변환한다', () => {
    expect(getCurrentMinutesUtc(utc(10, 30))).toBe(630);
    expect(getCurrentMinutesUtc(utc(0, 0))).toBe(0);
    expect(getCurrentMinutesUtc(utc(23, 59))).toBe(1439);
  });
});

describe('isWithinTimeRange', () => {
  it('일반 범위 09:00-17:00: 범위 안이면 true (경계 포함)', () => {
    expect(isWithinTimeRange('09:00-17:00', utc(10, 0))).toBe(true);
    expect(isWithinTimeRange('09:00-17:00', utc(9, 0))).toBe(true);
    expect(isWithinTimeRange('09:00-17:00', utc(17, 0))).toBe(true);
  });

  it('일반 범위 09:00-17:00: 범위 밖이면 false', () => {
    expect(isWithinTimeRange('09:00-17:00', utc(8, 59))).toBe(false);
    expect(isWithinTimeRange('09:00-17:00', utc(17, 1))).toBe(false);
  });

  it('자정을 걸치는 범위 23:00-06:00: 밤~새벽 시각은 true', () => {
    expect(isWithinTimeRange('23:00-06:00', utc(23, 30))).toBe(true);
    expect(isWithinTimeRange('23:00-06:00', utc(0, 30))).toBe(true);
    expect(isWithinTimeRange('23:00-06:00', utc(3, 0))).toBe(true);
    expect(isWithinTimeRange('23:00-06:00', utc(6, 0))).toBe(true);
  });

  it('자정을 걸치는 범위 23:00-06:00: 낮 시각은 false', () => {
    expect(isWithinTimeRange('23:00-06:00', utc(12, 0))).toBe(false);
    expect(isWithinTimeRange('23:00-06:00', utc(22, 59))).toBe(false);
    expect(isWithinTimeRange('23:00-06:00', utc(6, 1))).toBe(false);
  });

  it('범위 미설정 또는 파싱 실패 시 제한 없음(true)으로 처리한다', () => {
    expect(isWithinTimeRange('', utc(3, 0))).toBe(true);
    expect(isWithinTimeRange(undefined, utc(3, 0))).toBe(true);
    expect(isWithinTimeRange('broken', utc(12, 0))).toBe(true);
  });
});

describe('meetsMinCommitCount', () => {
  const commits = [{ message: 'a' }, { message: 'b' }, { message: 'c' }];

  it('커밋 수가 최소값 이상이면 true', () => {
    expect(meetsMinCommitCount(commits, 3)).toBe(true);
    expect(meetsMinCommitCount(commits, 1)).toBe(true);
  });

  it('커밋 수가 최소값 미달이면 false', () => {
    expect(meetsMinCommitCount(commits, 4)).toBe(false);
    expect(meetsMinCommitCount([], 1)).toBe(false);
  });
});

describe('buildFileSummary', () => {
  it('+added/~modified/-removed 형식의 요약 라인을 만든다', () => {
    const commits = [
      {
        added: ['a.js', 'b.js'],
        modified: ['c.js'],
        removed: ['d.js', 'e.js'],
      },
      { added: ['f.js'], modified: ['g.js', 'h.js'], removed: [] },
    ];
    expect(buildFileSummary(commits)).toBe('🔸 *Files:* +3/~3/-2\n');
  });

  it('커밋에 added/modified/removed 필드가 없어도 0으로 집계한다', () => {
    expect(buildFileSummary([{ message: 'no file lists' }])).toBe('🔸 *Files:* +0/~0/-0\n');
  });
});

describe('calculateQualityScore', () => {
  const commit = (message, files) => ({
    message,
    added: Array.from({ length: files }, (_, i) => `f${i}.js`),
    modified: [],
    removed: [],
  });

  it('메시지 > 10자 + 파일 < 10개 → 80점', () => {
    expect(calculateQualityScore([commit('a meaningful message', 3)])).toBe(80);
  });

  it('메시지 10자 이하 + 파일 < 10개 → 30점', () => {
    expect(calculateQualityScore([commit('short', 3)])).toBe(30);
  });

  it('메시지 > 10자 + 파일 10개 이상 → 50점', () => {
    expect(calculateQualityScore([commit('a meaningful message', 10)])).toBe(50);
  });

  it('메시지 10자 이하 + 파일 10개 이상 → 0점', () => {
    expect(calculateQualityScore([commit('short', 12)])).toBe(0);
  });

  it('여러 커밋은 평균 점수를 반환한다', () => {
    const commits = [
      commit('a meaningful message', 3), // 80
      commit('short', 3), // 30
    ];
    expect(calculateQualityScore(commits)).toBe(55);
  });

  it('빈 커밋 배열은 0점', () => {
    expect(calculateQualityScore([])).toBe(0);
  });
});
