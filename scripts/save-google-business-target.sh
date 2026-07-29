#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
env_path="$root/.env.google-business.local"

read -r -p "Paste the Google Business account ID, then press Return: " account_id
read -r -p "Paste the Google Business location ID, then press Return: " location_id

if [[ -z "$account_id" || -z "$location_id" ]]; then
  echo "Account ID and location ID are both required. Nothing was saved." >&2
  exit 1
fi

upsert() {
  local name="$1"
  local value="$2"
  local temp_path
  temp_path="$(mktemp "${env_path}.XXXXXX")"
  if grep -q "^${name}=" "$env_path"; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" == "$name="* ]]; then
        printf '%s=%s\n' "$name" "$value"
      else
        printf '%s\n' "$line"
      fi
    done < "$env_path" > "$temp_path"
  else
    cat "$env_path" > "$temp_path"
    printf '%s=%s\n' "$name" "$value" >> "$temp_path"
  fi
  mv "$temp_path" "$env_path"
}

upsert "GOOGLE_BUSINESS_ACCOUNT_ID" "$account_id"
upsert "GOOGLE_BUSINESS_LOCATION_ID" "$location_id"
chmod 600 "$env_path"

echo "Google Business account and location IDs saved locally in .env.google-business.local."
