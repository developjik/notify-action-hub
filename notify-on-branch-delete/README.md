# 🗑️ 브랜치 삭제 알림

GitHub 리포지토리에서 브랜치가 삭제될 때 Slack, Discord, Telegram으로 알림을 보내는 GitHub Action입니다.

## 🚀 사용 방법

`.github/workflows/branch-delete-notify.yml` 파일을 생성하고 다음과 같이 설정하세요:

```yaml
name: 브랜치 삭제 알림

on:
  delete:
    branches:
      - '*'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: 브랜치 삭제 알림 보내기
        id: notify
        uses: developjik/notify-action-hub/notify-on-branch-delete@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 🔧 입력값

| 이름                  | 설명                                          | 필수 여부 |
| --------------------- | --------------------------------------------- | --------- |
| `slack_webhook_url`   | Slack Webhook URL                             | ❌ 선택   |
| `discord_webhook_url` | Discord Webhook URL                           | ❌ 선택   |
| `telegram_bot_token`  | Telegram Bot Token                            | ❌ 선택   |
| `telegram_chat_id`    | Telegram Chat ID                              | ❌ 선택   |
| `dry_run`             | 전송 대신 로그만 출력 (true/false)            | ❌ 선택   |
| `message_prefix`      | 알림 메시지 앞에 붙는 접두사 (예: 프로젝트명) | ❌ 선택   |

💡 Slack, Discord, Telegram 중 하나 이상의 Webhook 정보를 제공해야 합니다.

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

✅ **Slack & Discord 메시지 예시**

```
🗑️ *Branch Deleted*

🔹 Branch: `feature-branch` was deleted.
```

✅ **Telegram 메시지 예시**

```
🗑️ Branch Deleted

🔹 Branch: feature-branch was deleted.
```

## 🔧 Webhook 설정 방법

### Slack Webhook 설정

1. **Slack 앱 생성**
   - [Slack API](https://api.slack.com/apps)로 이동하여 "Create New App" 클릭
   - "From scratch" 선택 후 앱 이름과 워크스페이스 지정
2. **Incoming Webhooks 활성화**
   - "Incoming Webhooks" 활성화 후 "Add New Webhook to Workspace" 클릭
   - 알림을 받을 채널을 선택하고 "Allow" 클릭
   - 생성된 Webhook URL을 복사
3. **GitHub Secrets 추가**
   - GitHub 리포지토리 → "Settings" → "Secrets and variables" → "Actions" 이동
   - "New repository secret" 클릭 후 `SLACK_WEBHOOK_URL` 이름으로 Webhook URL 저장

### Discord Webhook 설정

1. **Discord 서버에서 Webhook 생성**
   - Discord 서버 설정으로 이동
   - "통합(Integrations)" → "웹훅(Webhooks)" → "새 웹훅 만들기"
   - 웹훅 URL을 복사하여 `DISCORD_WEBHOOK_URL`로 저장

### Telegram Webhook 설정

1. **Telegram Bot 생성**
   - [@BotFather](https://t.me/BotFather)와 채팅을 시작하여 새로운 봇 생성 (`/newbot` 명령어 입력)
   - 생성된 `TELEGRAM_BOT_TOKEN`을 복사하여 저장
2. **Chat ID 확인**
   - [@userinfobot](https://t.me/userinfobot) 또는 [@getidsbot](https://t.me/getidsbot)을 이용하여 `TELEGRAM_CHAT_ID` 확인
   - `TELEGRAM_CHAT_ID`를 GitHub Secrets에 추가

## 📜 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
