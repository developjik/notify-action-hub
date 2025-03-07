# 🔔 GitHub 알림 액션 허브

GitHub 이벤트에 대한 알림을 다양한 플랫폼으로 전송하는 GitHub Actions 모음입니다.

## 🌟 주요 기능

- 다중 플랫폼 지원: Slack, Discord, Telegram
- 다양한 GitHub 이벤트 알림:
  - 🐞 이슈 생성/수정
  - 🔄 PR 생성/업데이트
  - 🚀 릴리스 배포
  - 💬 커밋 댓글
  - ⬆️ 코드 푸시
  - ❌ 워크플로우 실패
  - 🗑️ 브랜치 삭제

## 🔧 설정 방법

### Slack 웹훅 설정

1. [Slack API](https://api.slack.com/)에서 앱 생성
2. "Incoming Webhooks" 활성화
3. 웹훅 URL을 GitHub Secrets에 추가 (`SLACK_WEBHOOK_URL`)

### Discord 웹훅 설정

1. Discord 서버 설정 → 통합 → 웹훅
2. 새 웹훅 생성 및 URL 복사
3. GitHub Secrets에 추가 (`DISCORD_WEBHOOK_URL`)

### Telegram 봇 설정

1. [@BotFather](https://t.me/BotFather)에서 봇 생성
2. 봇 토큰을 GitHub Secrets에 추가 (`TELEGRAM_BOT_TOKEN`)
3. 채팅 ID 확인 후 GitHub Secrets에 추가 (`TELEGRAM_CHAT_ID`)

## 📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
