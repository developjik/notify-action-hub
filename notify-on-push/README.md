# 푸시 알림 액션

GitHub의 `push` 이벤트가 발생할 때 Slack, Discord, Telegram으로 알림을 보내는 GitHub Action입니다.

## 기능

- 지정된 플랫폼(Slack/Discord/Telegram)에 푸시 이벤트 알림 전송
- 저장소 이름, 푸시한 사용자, 커밋 개수, 파일 변경 요약 표시
- 알림 허용 시간대·최소 커밋 수 지정, 여러 푸시 묶어 배치 전송 지원
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
        id: notify
        uses: developjik/notify-action-hub/notify-on-push@v1
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

## 🔧 입력값

| 이름                  | 설명                                                                                                                                        | 필수 여부 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `slack_webhook_url`   | Slack Webhook URL                                                                                                                           | ❌ 선택   |
| `discord_webhook_url` | Discord Webhook URL                                                                                                                         | ❌ 선택   |
| `telegram_bot_token`  | Telegram Bot 토큰 (`telegram_chat_id`와 함께 사용)                                                                                          | ❌ 선택   |
| `telegram_chat_id`    | Telegram Chat ID (`telegram_bot_token`와 함께 사용)                                                                                         | ❌ 선택   |
| `include_diff_links`  | 각 커밋의 diff 보기 링크 포함 (기본값 `true`)                                                                                               | ❌ 선택   |
| `notify_time_range`   | 알림 허용 시간 범위. **UTC 기준 `HH:MM-HH:MM`** (예: `09:00-17:00`). 자정을 걸치는 범위(예: `23:00-06:00`)도 지원. 범위 밖 푸시는 알림 생략 | ❌ 선택   |
| `min_commit_count`    | 알림을 보내는 최소 커밋 수. 배치에 쌓인 푸시의 커밋을 합산해 판정 (기본값 `1`)                                                              | ❌ 선택   |
| `batch_interval`      | 알림을 묶는 배치 간격(**분 단위**). `0`이면 즉시 전송 (기본값 `0`). 자세한 내용은 아래 배치 기능 안내 참고                                  | ❌ 선택   |
| `show_quality_score`  | 커밋 품질 점수(0~100, 커밋 메시지 길이·파일 수 기준 평균) 표시 (기본값 `false`)                                                             | ❌ 선택   |
| `dry_run`             | 전송 대신 로그만 출력 (true/false, 기본값 `false`)                                                                                          | ❌ 선택   |
| `message_prefix`      | 알림 메시지 앞에 붙는 접두사 (예: 프로젝트명)                                                                                               | ❌ 선택   |

> **참고:** 최소 하나 이상의 알림 플랫폼(Slack, Discord, Telegram)이 설정되어야 합니다.

## 🧪 고급 사용 예시 (시간대 + 최소 커밋 수)

UTC 야간 시간대에만, 커밋 5개 이상일 때만 알림을 보내는 조합 예시입니다:

```yaml
- name: 푸시 알림 보내기
  id: notify
  uses: developjik/notify-action-hub/notify-on-push@v1
  with:
    slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    # UTC 기준 야간 시간대에만 알림 (자정을 걸치는 범위 지원)
    notify_time_range: '23:00-06:00'
    # 쌓인 커밋을 합쳐 5개 미만이면 알림 생략
    min_commit_count: '5'
```

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

## 🗃️ 배치 기능과 actions/cache 연동

`batch_interval`에 0보다 큰 값(분)을 설정하면, 마지막 전송 후 지정한 간격이 지나기 전의 푸시를 `batch_data.json` 파일에 쌓아 두고, 간격이 지난 다음 실행에서 한 번에 묶어 보냅니다.

**한계:** 배치 상태 파일(`batch_data.json`)은 러너의 워크스페이스(작업 디렉터리 루트)에 기록됩니다. GitHub Actions 러너는 실행할 때마다 초기화되므로, 이 파일은 **실행 간에 자동으로 유지되지 않습니다.** 배치가 여러 실행에 걸쳐 이어지게 하려면 아래처럼 `actions/cache`로 상태 파일을 캐싱해야 합니다:

```yaml
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      # 이전 실행의 배치 상태 복원 (캐시가 없으면 생략됨)
      - name: 배치 상태 복원
        uses: actions/cache@v4
        with:
          path: batch_data.json
          key: notify-batch-${{ github.run_id }}
          restore-keys: notify-batch-

      - name: 푸시 알림 보내기
        id: notify
        uses: developjik/notify-action-hub/notify-on-push@v1
        with:
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          batch_interval: '30'

      # actions/cache는 잡 종료 시(post) 현재 상태를 새 키로 저장한다
```

주의사항:

- 캐시는 브랜치 스코프를 따릅니다. 기본 브랜치에서 만든 캐시는 모든 브랜치에서 읽을 수 있고, PR 브랜치의 캐시는 해당 브랜치와 자식 브랜치에서만 읽을 수 있습니다. 같은 브랜치의 연속 실행에서 가장 잘 동작합니다.
- 7일간 사용되지 않은 캐시는 제거되며, 저장소 캐시 총량(10GB) 한도도 있습니다.
- 알림이 정상 전송되면 배치 데이터는 초기화된 상태로 다시 저장됩니다.

## 📩 알림 예시

푸시 이벤트 발생 시 다음과 같은 메시지가 전송됩니다:

```
🎉 *New push to your-repo-name* 🎉

🔹 *Pusher:* developjik
🔹 *Commit count:* 3
🔸 *Files:* +5/~2/-1
🔹 *Commits:*
- Fix authentication bug (by developjik) [View Diff](https://github.com/your-repo-url/commit/abc1234)
🔗 [View Repository](https://github.com/your-repo-url)
```

## 📜 라이선스

MIT 라이선스로 배포됩니다.
