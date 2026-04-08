#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail() {
  echo "❌ $1" >&2
  exit 1
}

echo "🔎 Validating action metadata..."

mapfile -t action_files < <(find . -mindepth 2 -maxdepth 2 -name action.yml | sort)
[[ ${#action_files[@]} -gt 0 ]] || fail "No action.yml files found"

for file in "${action_files[@]}"; do
  dir="$(dirname "$file")"
  echo "- $file"

  grep -Eq "^runs:" "$file" || fail "$file: missing runs block"
  grep -Eq "^[[:space:]]+using:[[:space:]]*'node20'" "$file" || fail "$file: runs.using must be 'node20'"
  grep -Eq "^[[:space:]]+main:[[:space:]]*'dist/index.js'" "$file" || fail "$file: runs.main must be 'dist/index.js'"
  grep -Eq "^branding:" "$file" || fail "$file: missing branding block"

  [[ -f "$dir/dist/index.js" ]] || fail "$dir/dist/index.js is missing"
done

echo "✅ Metadata validation passed"
