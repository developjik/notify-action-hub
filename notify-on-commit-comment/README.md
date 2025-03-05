# 🚀 커밋 댓글 알림 액션

이 GitHub Action은 커밋에 댓글이 달릴 때 알림을 보냅니다. Slack, Discord, Telegram 알림을 지원합니다.

## 📌 사용 방법

`.github/workflows/notify-on-commit-comment.yml` 파일을 생성하고 아래와 같이 설정하세요:

```yaml
name: 커밋 댓글 알림

on:
  issue_comment:
    types: [created]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 알림 보내기
        uses: developjik/notify-action-hub/notify-commit-comment@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 입력값

| 이름                  | 설명                  | 필수 여부 |
| --------------------- | --------------------- | --------- |
| `slack_webhook_url`   | Slack 수신 웹훅 URL   | ❌ 아니요 |
| `discord_webhook_url` | Discord 수신 웹훅 URL | ❌ 아니요 |
| `telegram_bot_token`  | Telegram 봇 토큰      | ❌ 아니요 |
| `telegram_chat_id`    | Telegram 채팅 ID      | ❌ 아니요 |

`slack_webhook_url`, `discord_webhook_url`, 또는 `telegram_bot_token` + `telegram_chat_id` 중 최소 하나는 제공되어야 합니다.

## 📩 알림 예시

### ✅ Slack & Discord 메시지 예시

```
💬 커밋 댓글 알림

🔹 작성자: johndoe
🔹 댓글: 이건 테스트 댓글입니다
🔹 [댓글 보기](https://github.com/developjik/my-repo/commit/abcdef123456)
```

### ✅ Telegram 메시지 예시

```
💬 커밋 댓글 알림

🔹 작성자: johndoe
🔹 댓글: 이건 테스트 댓글입니다
🔹 댓글 보기: https://github.com/developjik/my-repo/commit/abcdef123456
```

## 🔧 웹훅 설정 방법

### Slack 웹훅 설정

1. [Slack API](https://api.slack.com/)로 이동합니다.
2. "Create New App" → "From scratch"를 클릭하고 앱 이름과 워크스페이스를 선택합니다.
3. "Incoming Webhooks"를 활성화하고 "Add New Webhook to Workspace"를 클릭합니다.
4. 알림을 받을 채널을 선택하고 "Allow"를 클릭합니다.
5. 생성된 웹훅 URL을 복사하여 GitHub Secret(`SLACK_WEBHOOK_URL`)으로 추가합니다.

### Discord 웹훅 설정

1. Discord를 열고 "서버 설정"으로 이동합니다.
2. "통합" → "웹훅"으로 이동합니다.
3. "새 웹훅"을 클릭하고 설정합니다.
4. 웹훅 URL을 복사하여 GitHub Secret(`DISCORD_WEBHOOK_URL`)으로 추가합니다.

### Telegram 봇 설정

1. Telegram을 열고 "BotFather"를 검색합니다.
2. 대화를 시작하고 `/newbot`을 보내 새 봇을 생성합니다.
3. 봇 토큰을 복사하여 GitHub Secret(`TELEGRAM_BOT_TOKEN`)으로 추가합니다.
4. 봇에게 메시지를 보내고 `https://api.telegram.org/bot<YourBotToken>/getUpdates`를 통해 채팅 ID를 확인하여 `telegram_chat_id`로 추가합니다.

## 📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
