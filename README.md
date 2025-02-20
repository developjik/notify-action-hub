# 푸시 알림 액션

이 리포지토리는 GitHub에서 `push` 이벤트가 발생할 때 Slack으로 알림을 보내는 GitHub Action을 제공합니다.

## 특징

- 새로운 푸시 이벤트 시 지정된 Slack 채널로 알림을 전송합니다.
- 리포지토리 이름, 푸시한 사용자, 커밋 수를 표시합니다.
- GitHub Actions 워크플로우에 쉽게 통합할 수 있습니다.

---

## 사용법

### 1. 워크플로우 설정하기

`.github/workflows/notify.yml` 파일을 생성하고 다음 설정을 추가하세요:

```yaml
name: 푸시 시 슬랙 알림

on:
  push:
    branches:
      - main  # 필요한 브랜치를 지정할 수 있습니다.

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 푸시 알림 보내기
        uses: your-username/notify-on-push-action@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

2. Slack Webhook URL 설정하기
	1.	Slack 앱 생성
	•	Slack API 페이지로 이동하여 “Create New App”을 클릭합니다.
	•	“From scratch”를 선택하고 앱 이름을 입력한 후 워크스페이스를 선택합니다.
	2.	Incoming Webhooks 활성화
	•	“Incoming Webhooks” 메뉴로 이동하여 스위치를 활성화합니다.
	•	“Add New Webhook to Workspace”를 클릭하고 알림을 보낼 채널을 선택한 후 “Allow”를 클릭합니다.
	•	생성된 Webhook URL을 복사합니다.
	3.	GitHub Secrets에 Webhook URL 추가
	•	GitHub 리포지토리 설정에서 Settings > Secrets and variables > Actions로 이동합니다.
	•	“New repository secret”을 클릭하고 SLACK_WEBHOOK_URL이라는 이름으로 Webhook URL을 추가합니다.

예제 메시지

푸시 이벤트 발생 시 Slack에 다음과 같은 메시지가 전송됩니다:

🎉 *New push to your-repo-name* 🎉
- Pusher: developjik
- Commit count: 3
- [View Repository](https://github.com/your-repo-url)

라이선스

MIT License로 배포됩니다.

