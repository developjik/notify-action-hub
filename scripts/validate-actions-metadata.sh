#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

shopt -s nullglob

action_files=(notify-*/action.yml)
if [ ${#action_files[@]} -eq 0 ]; then
  echo "No action.yml files found under notify-* directories."
  exit 1
fi

fail=0

for file in "${action_files[@]}"; do
  dir="$(dirname "$file")"
  using="$(sed -nE "s/^[[:space:]]*using:[[:space:]]*'?(node[0-9]+)'?[[:space:]]*$/\1/p" "$file" | head -n1)"
  main="$(sed -nE "s/^[[:space:]]*main:[[:space:]]*'?(dist\/index\.js)'?[[:space:]]*$/\1/p" "$file" | head -n1)"

  if [ "$using" != "node20" ]; then
    echo "[ERROR] $file -> runs.using must be node20 (found: ${using:-<missing>})"
    fail=1
  fi

  if [ "$main" != "dist/index.js" ]; then
    echo "[ERROR] $file -> runs.main must be dist/index.js (found: ${main:-<missing>})"
    fail=1
  fi

  if [ ! -f "$dir/dist/index.js" ]; then
    echo "[ERROR] $file -> $dir/dist/index.js is missing"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "All action metadata checks passed (${#action_files[@]} actions)."