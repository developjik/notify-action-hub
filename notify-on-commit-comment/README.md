🚀 커밋 코멘트 알림 액션

이 GitHub Action은 커밋에 코멘트가 달렸을 때 알림을 전송합니다. Slack, Discord, Telegram 알림을 지원합니다.

📌 사용 방법

.github/workflows/notify-on-commit-comment.yml 파일을 생성하고 아래와 같이 구성하세요:

name: 커밋 코멘트 알림

on:
issue_comment:
types: [created]

jobs:
notify:
runs-on: ubuntu-latest
steps: - name: 알림 전송
uses: developjik/notify-commit-comment@v1
with:
slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}

🔧 입력값

이름 설명 필수 여부
slack_webhook_url Slack 인커밍 웹훅 URL ❌ 아니오
discord_webhook_url Discord 인커밍 웹훅 URL ❌ 아니오
telegram_bot_token Telegram 봇 토큰 ❌ 아니오
telegram_chat_id Telegram 채팅 ID ❌ 아니오

slack_webhook_url, discord_webhook_url, 또는 telegram_bot_token + telegram_chat_id 중 적어도 하나는 제공해야 합니다.

📩 알림 예시

✅ Slack & Discord 메시지 예시

💬 커밋 코멘트 알림

🔹 작성자: johndoe
🔹 코멘트: 이건 테스트 코멘트입니다.
🔹 [코멘트 보기](https://github.com/developjik/my-repo/commit/abcdef123456)

✅ Telegram 메시지 예시

💬 커밋 코멘트 알림

🔹 작성자: johndoe
🔹 코멘트: 이건 테스트 코멘트입니다.
🔹 코멘트 보기: https://github.com/developjik/my-repo/commit/abcdef123456

🔧 웹훅 설정 방법

Slack 웹훅 설정 1. Slack API로 이동합니다. 2. “Create New App” → “From scratch”를 클릭하고 앱 이름과 워크스페이스를 선택합니다. 3. “Incoming Webhooks”를 활성화하고 “Add New Webhook to Workspace”를 클릭합니다. 4. 알림을 받을 채널을 선택하고 “Allow”를 클릭합니다. 5. 생성된 웹훅 URL을 복사하여 GitHub 비밀(SLACK_WEBHOOK_URL)로 추가합니다.

Discord 웹훅 설정 1. Discord를 열고 “서버 설정”으로 이동합니다. 2. “통합” → “웹훅”으로 이동합니다. 3. “새 웹훅”을 클릭하고 설정합니다. 4. 웹훅 URL을 복사하여 GitHub 비밀(DISCORD_WEBHOOK_URL)로 추가합니다.

Telegram 봇 설정 1. Telegram에서 “BotFather”를 검색하여 채팅을 시작합니다. 2. /newbot 명령어를 입력하여 새 봇을 만듭니다. 3. 봇 토큰을 복사하여 GitHub 비밀(TELEGRAM_BOT_TOKEN)로 추가합니다. 4. 봇에게 메시지를 보내고 https://api.telegram.org/bot<YourBotToken>/getUpdates를 통해 telegram_chat_id를 확인합니다.

📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 LICENSE 파일을 참조하세요.
