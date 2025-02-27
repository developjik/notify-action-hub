# ❌ 워크플로우 실패 알림

GitHub Actions 워크플로우가 실패했을 때 Slack, Discord, Telegram으로 알림을 보내는 GitHub Action입니다.

## 🚀 사용 방법

`.github/workflows/workflow-failure-notify.yml` 파일을 생성하고 다음과 같이 설정하세요:

```yaml
name: 워크플로우 실패 알림

on:
  workflow_run:
    workflows: ['*']
    types:
      - completed

jobs:
  notify:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - name: 실패 알림 보내기
        uses: developjik/workflow-failure-notify@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          job_name: '테스트 및 빌드'

🔧 입력값

이름	설명	필수 여부
slack_webhook_url	Slack Webhook URL	❌ 선택
discord_webhook_url	Discord Webhook URL	❌ 선택
telegram_bot_token	Telegram Bot Token	❌ 선택
telegram_chat_id	Telegram Chat ID	❌ 선택
job_name	실패한 작업(Job)의 이름	✅ 필수

	Slack, Discord, Telegram 중 하나 이상의 Webhook 정보를 제공해야 합니다.

📩 알림 예시

✅ Slack & Discord 메시지 예시

❌ *Workflow Failure Alert*

⚠️ *Job:* 테스트 및 빌드 실패
📌 Repository: developjik/my-project
🔗 [워크플로우 실행 보기](https://github.com/developjik/my-project/actions)

✅ Telegram 메시지 예시

❌ Workflow Failure Alert

⚠️ Job: 테스트 및 빌드 실패
📌 Repository: developjik/my-project
🔗 워크플로우 실행 보기: https://github.com/developjik/my-project/actions

🔧 Slack Webhook 설정 방법
	1.	Slack 앱 생성
	•	Slack API로 이동하여 “Create New App” 클릭
	•	“From scratch” 선택 후 앱 이름과 워크스페이스 지정
	2.	Incoming Webhook 활성화
	•	“Incoming Webhooks” 활성화 후 “Add New Webhook to Workspace” 클릭
	•	알림을 받을 채널을 선택하고 “Allow” 클릭
	•	생성된 Webhook URL을 복사
	3.	GitHub Secrets 추가
	•	GitHub 리포지토리 → “Settings” → “Secrets and variables” → “Actions” 이동
	•	“New repository secret” 클릭 후 SLACK_WEBHOOK_URL 이름으로 Webhook URL 저장

📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 LICENSE 파일을 참고하세요.

```
