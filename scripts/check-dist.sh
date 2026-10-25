#!/usr/bin/env bash
# dist 신선도 검사 스크립트
#
# 각 액션을 dist-check/ 임시 디렉터리에 ncc로 다시 빌드한 뒤 커밋된 dist/와
# 비교한다. index.js/lib.js/common 소스 수정 후 dist를 재빌드하지 않고
# 커밋하는 경우를 잡아낸다.
#
# 사용: bash scripts/check-dist.sh  (또는 npm run check-dist)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

shopt -s nullglob

action_dirs=(notify-on-*)
if [ ${#action_dirs[@]} -eq 0 ]; then
  echo "[FAIL] No notify-* action directories found." >&2
  exit 1
fi

fail=0

for dir in "${action_dirs[@]}"; do
  echo "- $dir"
  dist_check_dir="$dir/dist-check"
  rm -rf "$dist_check_dir"

  # 커밋된 dist와 동일한 방식(npx ncc build)으로 재빌드
  if ! (cd "$dir" && npx ncc build index.js -o dist-check > /dev/null 2>&1); then
    echo "[ERROR] $dir: ncc build failed" >&2
    fail=1
    rm -rf "$dist_check_dir"
    continue
  fi

  # 재빌드 결과와 커밋된 dist 비교
  if ! diff -r "$dir/dist" "$dist_check_dir" > /dev/null 2>&1; then
    echo "[ERROR] $dir: dist/index.js is stale. Rebuild with:" >&2
    echo "          (cd $dir && npx ncc build index.js -o dist)" >&2
    fail=1
  else
    echo "  dist is fresh"
  fi

  # 임시 디렉터리 정리
  rm -rf "$dist_check_dir"
done

if [ "$fail" -ne 0 ]; then
  echo "dist freshness check FAILED." >&2
  exit 1
fi

echo "All dist bundles are fresh (${#action_dirs[@]} actions)."
