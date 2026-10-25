// common/notify.js 단위 테스트
//
// 이스케이프 헬퍼와 플랫폼 검증은 순수 함수로 직접 검증하고,
// notifyAll/getNotificationInputs은 axios와 @actions/core를 스파이로
// 대체(전송·로깅 부수효과 제거)해서 실패 격리 정책을 검증한다.
//
// common/notify.js는 CommonJS 소스로서 네이티브 require 체인에서 로드되므로,
// 테스트도 createRequire로 동일한 모듈 인스턴스를 얻어 스파이를 적용한다.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const nodeRequire = createRequire(import.meta.url);
const axios = nodeRequire('axios');
const core = nodeRequire('@actions/core');
const notify = nodeRequire('../common/notify.js');

describe('escapeForSlack', () => {
  it('일반 텍스트는 그대로 반환한다', () => {
    expect(notify.escapeForSlack('hello world')).toBe('hello world');
  });

  it('마크업 특수문자 & < >를 HTML 엔티티로 치환한다', () => {
    expect(notify.escapeForSlack('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
  });

  it('빈 값과 falsy 값은 그대로 반환한다', () => {
    expect(notify.escapeForSlack('')).toBe('');
    expect(notify.escapeForSlack(null)).toBe(null);
    expect(notify.escapeForSlack(undefined)).toBe(undefined);
  });
});

describe('escapeForDiscord', () => {
  it('일반 텍스트는 그대로 반환한다', () => {
    expect(notify.escapeForDiscord('plain text 123')).toBe('plain text 123');
  });

  it('마크업 특수문자 앞에 백슬래시를 붙인다', () => {
    expect(notify.escapeForDiscord('*_~`|\\')).toBe('\\*\\_\\~\\`\\|\\\\');
  });

  it('빈 값은 그대로 반환한다', () => {
    expect(notify.escapeForDiscord('')).toBe('');
  });
});

describe('escapeForTelegram', () => {
  it('특수문자 없는 텍스트는 그대로 반환한다', () => {
    expect(notify.escapeForTelegram('hello world')).toBe('hello world');
  });

  it('MarkdownV2 예약문자를 이스케이프한다', () => {
    expect(notify.escapeForTelegram('Hello. (world)!')).toBe('Hello\\. \\(world\\)\\!');
    expect(notify.escapeForTelegram('a_b*c[d]')).toBe('a\\_b\\*c\\[d\\]');
  });

  it('빈 값은 그대로 반환한다', () => {
    expect(notify.escapeForTelegram('')).toBe('');
  });
});

describe('validateNotificationPlatforms', () => {
  it('전체 미설정이면 에러 메시지를 반환한다', () => {
    const error = notify.validateNotificationPlatforms({
      slackWebhookUrl: '',
      discordWebhookUrl: '',
      telegramBotToken: '',
      telegramChatId: '',
    });
    expect(error).toBe(
      'At least one notification method (Slack, Discord, or Telegram) must be provided.',
    );
  });

  it('telegram 봇 토큰만 있고 채팅 ID가 없으면 에러를 반환한다', () => {
    const error = notify.validateNotificationPlatforms({
      slackWebhookUrl: '',
      discordWebhookUrl: '',
      telegramBotToken: 'bot-token',
      telegramChatId: '',
    });
    expect(error).toBe(
      'At least one notification method (Slack, Discord, or Telegram) must be provided.',
    );
  });

  it('정상 설정이면 null을 반환한다 (slack 단독 / telegram 완전 구성)', () => {
    expect(notify.validateNotificationPlatforms({ slackWebhookUrl: 'https://slack' })).toBe(null);
    expect(
      notify.validateNotificationPlatforms({
        telegramBotToken: 'bot-token',
        telegramChatId: '42',
      }),
    ).toBe(null);
  });
});

describe('getNotificationInputs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('값이 있는 웹훅/토큰만 setSecret로 등록한다', () => {
    const inputs = {
      slack_webhook_url: 'https://hooks.slack.test/x',
      discord_webhook_url: '',
      telegram_bot_token: '123:abc',
      telegram_chat_id: '42',
    };
    vi.spyOn(core, 'getInput').mockImplementation((name) => inputs[name] ?? '');
    const setSecret = vi.spyOn(core, 'setSecret').mockImplementation(() => {});

    const parsed = notify.getNotificationInputs();

    expect(parsed).toEqual({
      slackWebhookUrl: 'https://hooks.slack.test/x',
      discordWebhookUrl: '',
      telegramBotToken: '123:abc',
      telegramChatId: '42',
    });
    // 채팅 ID는 시크릿이 아니므로 웹훅 1개 + 토큰 1개만 등록된다
    expect(setSecret).toHaveBeenCalledTimes(2);
    expect(setSecret).toHaveBeenCalledWith('https://hooks.slack.test/x');
    expect(setSecret).toHaveBeenCalledWith('123:abc');
  });
});

describe('formatMessageWithPrefix', () => {
  it('prefix가 있으면 `${prefix}\\n` 형태로 메시지 앞에 결합한다', () => {
    expect(notify.formatMessageWithPrefix('[my-project]', '📢 알림 본문')).toBe(
      '[my-project]\n📢 알림 본문',
    );
  });

  it('prefix가 없으면 메시지를 그대로 반환한다', () => {
    expect(notify.formatMessageWithPrefix('', 'message')).toBe('message');
    expect(notify.formatMessageWithPrefix(undefined, 'message')).toBe('message');
  });
});

describe('setSkippedOutputs', () => {
  it('notification_status=skipped, failed_platforms=빈 문자열을 설정한다', () => {
    const setOutput = vi.spyOn(core, 'setOutput').mockImplementation(() => {});

    notify.setSkippedOutputs();

    expect(setOutput).toHaveBeenCalledWith('notification_status', 'skipped');
    expect(setOutput).toHaveBeenCalledWith('failed_platforms', '');
    vi.restoreAllMocks();
  });
});

describe('notifyAll', () => {
  let postSpy;
  let warningSpy;
  let setOutputSpy;

  const allInputs = {
    slackWebhookUrl: 'https://hooks.slack.test/a',
    discordWebhookUrl: 'https://discord.test/b',
    telegramBotToken: 'tok',
    telegramChatId: '42',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    postSpy = vi.spyOn(axios, 'post').mockResolvedValue({ status: 200 });
    warningSpy = vi.spyOn(core, 'warning').mockImplementation(() => {});
    // notifyAll이 dry_run 입력을 읽고 결과 outputs을 설정하므로 스파이로 대체한다
    vi.spyOn(core, 'getBooleanInput').mockReturnValue(false);
    setOutputSpy = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    // 알림 전송 로그가 테스트 출력을 오염시키지 않도록 출력을 억제한다
    vi.spyOn(core, 'info').mockImplementation(() => {});
  });

  it('전 플랫폼 성공: 각 URL로 POST하고 sent/skipped/failed를 반환한다', async () => {
    const buildSlack = vi.fn(() => ({ text: 'slack msg' }));
    const buildDiscord = vi.fn(() => ({ content: 'discord msg' }));
    const buildTelegram = vi.fn(() => ({ text: 'telegram msg' }));

    const result = await notify.notifyAll(allInputs, {
      slack: buildSlack,
      discord: buildDiscord,
      telegram: buildTelegram,
    });

    expect(result).toEqual({
      sent: ['Slack', 'Discord', 'Telegram'],
      skipped: [],
      failed: [],
    });
    expect(postSpy).toHaveBeenCalledTimes(3);
    expect(postSpy).toHaveBeenCalledWith(
      'https://hooks.slack.test/a',
      expect.objectContaining({ text: 'slack msg' }),
    );
    expect(postSpy).toHaveBeenCalledWith(
      'https://discord.test/b',
      expect.objectContaining({ content: 'discord msg' }),
    );
    // Telegram은 sendMessage 엔드포인트 + chat_id 병합
    expect(postSpy).toHaveBeenCalledWith(
      'https://api.telegram.org/bottok/sendMessage',
      expect.objectContaining({ chat_id: '42', text: 'telegram msg' }),
    );
    expect(warningSpy).not.toHaveBeenCalled();
    // lazy 페이로드 빌더는 설정된 플랫폼만큼만 호출된다
    expect(buildSlack).toHaveBeenCalledTimes(1);
    expect(buildDiscord).toHaveBeenCalledTimes(1);
    expect(buildTelegram).toHaveBeenCalledTimes(1);
  });

  it('일부 실패: warning을 남기고 나머지 플랫폼은 전송한다 (throw하지 않음)', async () => {
    postSpy.mockImplementation((url) => {
      if (url.startsWith('https://discord')) {
        return Promise.reject(
          Object.assign(new Error('bad gateway'), { response: { status: 502 } }),
        );
      }
      return Promise.resolve({ status: 200 });
    });

    const result = await notify.notifyAll(allInputs, {
      slack: () => ({ text: 'slack msg' }),
      discord: () => ({ content: 'discord msg' }),
      telegram: () => ({ text: 'telegram msg' }),
    });

    expect(result.sent).toEqual(['Slack', 'Telegram']);
    expect(result.failed).toEqual(['Discord']);
    expect(result.skipped).toEqual([]);
    expect(postSpy).toHaveBeenCalledTimes(3);
    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith('일부 플랫폼 전송 실패: Discord: status 502');
  });

  it('설정된 전체 플랫폼 실패: throw한다', async () => {
    postSpy.mockRejectedValue(Object.assign(new Error('down'), { code: 'ECONNREFUSED' }));

    await expect(
      notify.notifyAll(allInputs, {
        slack: () => ({ text: 'a' }),
        discord: () => ({ content: 'b' }),
        telegram: () => ({ text: 'c' }),
      }),
    ).rejects.toThrow(/All configured notification platforms failed: .*/);

    expect(warningSpy).not.toHaveBeenCalled();
    expect(postSpy).toHaveBeenCalledTimes(3);
  });

  it('미설정 플랫폼은 스킵한다 (전송·페이로드 빌드 모두 발생하지 않음)', async () => {
    const buildDiscord = vi.fn(() => ({ content: 'never' }));
    const buildTelegram = vi.fn(() => ({ text: 'never' }));

    const result = await notify.notifyAll(
      { slackWebhookUrl: 'https://hooks.slack.test/a' },
      {
        slack: () => ({ text: 'slack msg' }),
        discord: buildDiscord,
        telegram: buildTelegram,
      },
    );

    expect(result).toEqual({
      sent: ['Slack'],
      skipped: ['Discord', 'Telegram'],
      failed: [],
    });
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(buildDiscord).not.toHaveBeenCalled();
    expect(buildTelegram).not.toHaveBeenCalled();
  });

  it('객체 페이로드(lazy 함수 아님)도 전송할 수 있다', async () => {
    const result = await notify.notifyAll(
      { discordWebhookUrl: 'https://discord.test/b' },
      { slack: { text: 'unused' }, discord: { content: 'plain object' } },
    );

    expect(result.sent).toEqual(['Discord']);
    expect(result.skipped).toEqual(['Slack', 'Telegram']);
    expect(postSpy).toHaveBeenCalledWith('https://discord.test/b', {
      content: 'plain object',
    });
  });

  it('전부 성공 시 outputs에 notification_status=sent, failed_platforms=빈 문자열을 설정한다', async () => {
    await notify.notifyAll(allInputs, {
      slack: () => ({ text: 'a' }),
      discord: () => ({ content: 'b' }),
      telegram: () => ({ text: 'c' }),
    });

    expect(setOutputSpy).toHaveBeenCalledWith('notification_status', 'sent');
    expect(setOutputSpy).toHaveBeenCalledWith('failed_platforms', '');
  });

  it('일부 실패 시 notification_status=partial, failed_platforms=실패 플랫폼 목록을 설정한다', async () => {
    postSpy.mockImplementation((url) =>
      url.startsWith('https://discord')
        ? Promise.reject(Object.assign(new Error('bad gateway'), { response: { status: 502 } }))
        : Promise.resolve({ status: 200 }),
    );

    const result = await notify.notifyAll(allInputs, {
      slack: () => ({ text: 'a' }),
      discord: () => ({ content: 'b' }),
      telegram: () => ({ text: 'c' }),
    });

    expect(result.failed).toEqual(['Discord']);
    expect(setOutputSpy).toHaveBeenCalledWith('notification_status', 'partial');
    expect(setOutputSpy).toHaveBeenCalledWith('failed_platforms', 'Discord');
  });

  it('전체 실패 시 throw 전에 notification_status=failed와 failed_platforms를 설정한다', async () => {
    postSpy.mockRejectedValue(Object.assign(new Error('down'), { code: 'ECONNREFUSED' }));

    await expect(
      notify.notifyAll(allInputs, {
        slack: () => ({ text: 'a' }),
        discord: () => ({ content: 'b' }),
        telegram: () => ({ text: 'c' }),
      }),
    ).rejects.toThrow(/All configured notification platforms failed: .*/);

    expect(setOutputSpy).toHaveBeenCalledWith('notification_status', 'failed');
    expect(setOutputSpy).toHaveBeenCalledWith('failed_platforms', 'Slack,Discord,Telegram');
  });

  it('dry_run=true면 전송하지 않고 각 플랫폼·페이로드(JSON)를 로그로 출력한다', async () => {
    vi.spyOn(core, 'getBooleanInput').mockReturnValue(true);
    const infoSpy = vi.spyOn(core, 'info').mockImplementation(() => {});

    const result = await notify.notifyAll(allInputs, {
      slack: () => ({ text: 'slack msg' }),
      discord: () => ({ content: 'discord msg' }),
      telegram: () => ({ text: 'telegram msg', parse_mode: 'Markdown' }),
    });

    expect(postSpy).not.toHaveBeenCalled();
    // dry-run에서는 실제 전송 없이 설정된 플랫폼 전부를 sent로 간주한다
    expect(result).toEqual({
      sent: ['Slack', 'Discord', 'Telegram'],
      skipped: [],
      failed: [],
    });
    expect(setOutputSpy).toHaveBeenCalledWith('notification_status', 'dry-run');
    expect(setOutputSpy).toHaveBeenCalledWith('failed_platforms', '');
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('[dry-run] Slack'));
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('"text":"slack msg"'));
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('"content":"discord msg"'));
    // Telegram은 실제 전송과 동일하게 chat_id가 병합된 페이로드로 표시된다
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('"chat_id":"42","text":"telegram msg"'),
    );
  });

  it('dry_run=true일 때 미설정 플랫폼은 로그도 출력하지 않고 스킵한다', async () => {
    vi.spyOn(core, 'getBooleanInput').mockReturnValue(true);

    const result = await notify.notifyAll(
      { slackWebhookUrl: 'https://hooks.slack.test/a' },
      {
        slack: () => ({ text: 'slack msg' }),
        discord: () => ({ content: 'never' }),
        telegram: () => ({ text: 'never' }),
      },
    );

    expect(postSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ sent: ['Slack'], skipped: ['Discord', 'Telegram'], failed: [] });
  });
});
