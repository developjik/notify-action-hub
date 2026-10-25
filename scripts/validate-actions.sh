#!/usr/bin/env bash
# notify-* 액션 메타데이터 통합 검증 스크립트
# 검사 항목:
#   1) action.yml 표준 (runs.using node20 / runs.main dist/index.js / branding)
#   2) dist/index.js 번들 존재
#   3) package.json 교차검사 (main = dist/index.js, engines.node = >=20)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

shopt -s nullglob

# 모든 notify-* 액션의 action.yml을 대상으로 전수 검사
action_files=(notify-*/action.yml)

if [ ${#action_files[@]} -eq 0 ]; then
  echo "[FAIL] No action.yml files found under notify-* directories." >&2
  exit 1
fi

fail=0

for file in "${action_files[@]}"; do
  dir="$(dirname "$file")"
  package_json="$dir/package.json"

  echo "- $file"

  # 1) action.yml 표준 검사
  grep -Eq "^runs:" "$file" || { echo "[ERROR] $file: missing runs block" >&2; fail=1; }
  grep -Eq "^[[:space:]]+using:[[:space:]]*'node20'" "$file" || { echo "[ERROR] $file: runs.using must be 'node20'" >&2; fail=1; }
  grep -Eq "^[[:space:]]+main:[[:space:]]*'dist/index.js'" "$file" || { echo "[ERROR] $file: runs.main must be 'dist/index.js'" >&2; fail=1; }
  grep -Eq "^branding:" "$file" || { echo "[ERROR] $file: missing branding block" >&2; fail=1; }

  # 2) dist 번들 존재 검사
  if [ ! -f "$dir/dist/index.js" ]; then
    echo "[ERROR] $file: $dir/dist/index.js is missing" >&2
    fail=1
  fi

  # 3) package.json 교차검사
  if [ ! -f "$package_json" ]; then
    echo "[ERROR] $file: $package_json is missing" >&2
    fail=1
    continue
  fi

  package_main="$(node -p "try { require('./$package_json').main || '' } catch (e) { '' }")"
  package_engine="$(node -p "try { (require('./$package_json').engines || {}).node || '' } catch (e) { '' }")"

  if [ "$package_main" != "dist/index.js" ]; then
    echo "[ERROR] $package_json: main must be dist/index.js (found: ${package_main:-<missing>})" >&2
    fail=1
  fi

  if [ "$package_engine" != ">=20" ]; then
    echo "[ERROR] $package_json: engines.node must be >=20 (found: ${package_engine:-<missing>})" >&2
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "All action metadata checks passed (${#action_files[@]} actions)."
