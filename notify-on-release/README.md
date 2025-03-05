# 🚀 릴리스 알림 액션

GitHub에서 새 릴리스가 게시될 때 Slack, Discord, Telegram으로 알림을 보내는 GitHub Action입니다.

## 🔧 기능

- 새 릴리스가 게시될 때 Slack, Discord, Telegram으로 자동 알림 전송
- 릴리스 이름, 태그, 릴리스 페이지 링크 포함
- GitHub Actions 워크플로우와 쉽게 통합 가능

## 🚀 사용 방법

`.github/workflows/release-notify.yml` 파일을 생성하고 다음과 같이 설정하세요:

```yaml
name: 릴리스 알림

on:
  release:
    types:
      - published

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 릴리스 알림 보내기
        uses: developjik/notify-action-hub/notify-on-release@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 입력값

| 이름                  | 설명                | 필수 여부 |
| --------------------- | ------------------- | --------- |
| `slack_webhook_url`   | Slack Webhook URL   | ❌ 선택   |
| `discord_webhook_url` | Discord Webhook URL | ❌ 선택   |
| `telegram_bot_token`  | Telegram Bot Token  | ❌ 선택   |
| `telegram_chat_id`    | Telegram Chat ID    | ❌ 선택   |

⚠️ Slack, Discord, Telegram 중 하나 이상의 Webhook 정보를 제공해야 합니다.

## 📩 알림 예시

✅ **Slack & Discord 메시지 예시**

```
🚀 *New Release Published!*

🔹 *Release:* v1.0.0
🔹 *Tag:* v1.0.0
🔹 [View Release](https://github.com/developjik/my-project/releases/tag/v1.0.0)
```

✅ **Telegram 메시지 예시**

```
🚀 New Release Published!

🔹 Release: v1.0.0
🔹 Tag: v1.0.0
🔹 View Release: https://github.com/developjik/my-project/releases/tag/v1.0.0
```

## 🔧 Webhook 설정 방법

### Slack Webhook 설정 방법

1. Slack 앱 생성
   - [Slack API](https://api.slack.com/)로 이동하여 "Create New App" 클릭
   - "From scratch" 선택 후 앱 이름과 워크스페이스 지정
2. Incoming Webhook 활성화
   - "Incoming Webhooks" 활성화 후 "Add New Webhook to Workspace" 클릭
   - 알림을 받을 채널을 선택하고 "Allow" 클릭
   - 생성된 Webhook URL을 복사
3. GitHub Secrets 추가
   - GitHub 리포지토리 → "Settings" → "Secrets and variables" → "Actions" 이동
   - "New repository secret" 클릭 후 `SLACK_WEBHOOK_URL` 이름으로 Webhook URL 저장

## 📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
