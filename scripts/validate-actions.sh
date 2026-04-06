#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

failures=0

while IFS= read -r -d '' action_file; do
  action_dir="$(dirname "$action_file")"
  rel="${action_dir#./}"

  using=$(awk -F"'" '/^  using:/{print $2}' "$action_file" | head -n1)
  main=$(awk -F"'" '/^  main:/{print $2}' "$action_file" | head -n1)

  if [[ "$using" != "node20" ]]; then
    echo "[FAIL] $rel/action.yml: runs.using must be 'node20' (got: ${using:-<missing>})"
    failures=1
  fi

  if [[ "$main" != "dist/index.js" ]]; then
    echo "[FAIL] $rel/action.yml: runs.main must be 'dist/index.js' (got: ${main:-<missing>})"
    failures=1
  fi

  if [[ ! -f "$action_dir/dist/index.js" ]]; then
    echo "[FAIL] $rel/dist/index.js: file is missing"
    failures=1
  fi
done < <(find . -maxdepth 2 -type f -name action.yml -print0)

if [[ $failures -ne 0 ]]; then
  exit 1
fi

echo "All action metadata checks passed."
