#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

expected_runtime="node20"
expected_main="dist/index.js"

status=0

for action_file in notify-*/action.yml; do
  if [[ ! -f "$action_file" ]]; then
    continue
  fi

  action_dir="$(dirname "$action_file")"
  runtime="$(awk -F": " '/^[[:space:]]*using:/ {gsub(/'"'"'/, "", $2); print $2; exit}' "$action_file")"
  main="$(awk -F": " '/^[[:space:]]*main:/ {gsub(/'"'"'/, "", $2); print $2; exit}' "$action_file")"

  if [[ "$runtime" != "$expected_runtime" ]]; then
    echo "[FAIL] $action_file runs.using must be '$expected_runtime' (found: '${runtime:-<missing>}')"
    status=1
  fi

  if [[ "$main" != "$expected_main" ]]; then
    echo "[FAIL] $action_file runs.main must be '$expected_main' (found: '${main:-<missing>}')"
    status=1
  fi

  if [[ ! -f "$action_dir/$expected_main" ]]; then
    echo "[FAIL] $action_dir/$expected_main does not exist"
    status=1
  fi

done

if [[ $status -eq 0 ]]; then
  echo "[OK] All action metadata files use runs.using=$expected_runtime and runs.main=$expected_main"
fi

exit $status
