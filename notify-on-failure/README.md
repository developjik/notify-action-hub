# ❌ 워크플로우 실패 알림

GitHub Actions 워크플로우가 실패했을 때 Slack 알림을 보내는 액션입니다.

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
        uses: your-repo/workflow-failure-notify@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          job_name: '테스트 및 빌드'
```

## 🔧 입력값

| 이름                | 설명                    | 필수 여부 |
| ------------------- | ----------------------- | --------- |
| `slack_webhook_url` | Slack Webhook URL       | ✅ 예     |
| `job_name`          | 실패한 작업(Job)의 이름 | ✅ 예     |

## 📩 알림 예시

```
❌ *Workflow Failure Alert*

⚠️ *Job:* 테스트 및 빌드 실패
📌 Repository: developjik/my-project
🔗 [워크플로우 실행 보기](https://github.com/developjik/my-project/actions)
```

## 📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
