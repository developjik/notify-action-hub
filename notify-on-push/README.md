# 푸시 알림 액션

GitHub의 `push` 이벤트가 발생할 때 Slack에 알림을 보내는 GitHub Action입니다.

## 기능

- 지정된 Slack 채널에 푸시 이벤트 발생 시 알림 전송
- 저장소 이름, 푸시한 사용자, 커밋 개수 표시
- GitHub Actions 워크플로우와 간편하게 통합 가능

---

## 사용 방법

### 1. 워크플로우 설정

`.github/workflows/notify.yml` 파일을 생성하고 다음과 같이 설정하세요:

```yaml
name: Push 이벤트 알림

on:
  push:
    branches:
      - main # 필요한 경우 다른 브랜치도 지정 가능

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 푸시 알림 보내기
        uses: developjik/notify-on-push-action@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 2. Slack Webhook URL 설정

1. **Slack 앱 생성**

   - [Slack API](https://api.slack.com/)로 이동하여 "Create New App"을 클릭합니다.
   - "From scratch"를 선택하고 앱 이름을 입력한 후 워크스페이스를 선택합니다.

2. **Incoming Webhooks 활성화**

   - "Incoming Webhooks"로 이동하여 기능을 활성화합니다.
   - "Add New Webhook to Workspace"를 클릭하고 채널을 선택한 후 "Allow"를 누릅니다.
   - 생성된 Webhook URL을 복사합니다.

3. **GitHub Secrets에 Webhook URL 추가**
   - GitHub 저장소에서 **Settings > Secrets and variables > Actions**로 이동합니다.
   - "New repository secret"을 클릭하고 이름을 `SLACK_WEBHOOK_URL`로 설정한 후 Webhook URL을 입력합니다.

### 📩 알림 예시

푸시 이벤트 발생 시 Slack에 아래와 같은 메시지가 전송됩니다:

```
🎉 *New push to your-repo-name* 🎉
- Pusher: developjik
- Commit count: 3
- [View Repository](https://github.com/your-repo-url)
```

## 📜 라이선스

MIT 라이선스로 배포됩니다.
