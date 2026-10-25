# PR 알림 보내기

GitHub에서 Pull Request가 열리거나 업데이트될 때 알림을 보내는 액션입니다. Slack, Discord, Telegram을 지원합니다.

## 🚀 사용 방법

`.github/workflows/pr-notify.yml` 파일을 생성하고 다음과 같이 설정하세요:

```yaml
name: PR 알림

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: PR 알림 보내기
        id: notify
        uses: developjik/notify-action-hub/notify-on-pr@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 입력값

| 이름                  | 설명                                          | 필수 여부 |
| --------------------- | --------------------------------------------- | --------- |
| `slack_webhook_url`   | Slack Webhook URL                             | ❌ 아니오 |
| `discord_webhook_url` | Discord Webhook URL                           | ❌ 아니오 |
| `telegram_bot_token`  | Telegram Bot 토큰                             | ❌ 아니오 |
| `telegram_chat_id`    | Telegram Chat ID (Telegram 사용 시 필수)      | ❌ 아니오 |
| `dry_run`             | 전송 대신 로그만 출력 (true/false)            | ❌ 아니오 |
| `message_prefix`      | 알림 메시지 앞에 붙는 접두사 (예: 프로젝트명) | ❌ 아니오 |

> **참고:** 최소 하나 이상의 알림 방법(Slack, Discord, Telegram)이 필요합니다.

## 📤 출력값

| 이름                  | 설명                                                              |
| --------------------- | ----------------------------------------------------------------- |
| `notification_status` | 알림 결과 (`sent` / `partial` / `failed` / `dry-run` / `skipped`) |
| `failed_platforms`    | 전송에 실패한 플랫폼의 쉼표 목록 (없으면 빈 문자열)               |

후속 스텝에서 `steps.notify.outputs.*` 형태로 참조할 수 있습니다:

```yaml
- name: 알림 결과 확인
  if: ${{ steps.notify.outputs.notification_status == 'partial' }}
  run: echo "실패한 플랫폼 = ${{ steps.notify.outputs.failed_platforms }}"
```

## 📩 알림 예시

### Slack & Discord

```
📢 Pull Request 알림 📢

🔹 제목: 인증 버그 수정
🔹 작성자: developjik
🔹 상태: open
🔹 [PR 보기](https://github.com/example/repo/pull/42)
```

### Telegram

```
📢 *Pull Request 알림* 📢

🔹 *제목:* 인증 버그 수정
🔹 *작성자:* developjik
🔹 *상태:* open
🔹 [PR 보기](https://github.com/example/repo/pull/42)
```

## 📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
