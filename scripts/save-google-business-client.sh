#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
env_path="$root/.env.google-business.local"

read -r -p "Paste the Google OAuth client ID, then press Return: " client_id
read -r -s -p "Paste the Google OAuth client secret, then press Return: " client_secret
printf "\n"

if [[ "$client_id" != *.apps.googleusercontent.com || -z "$client_secret" ]]; then
  echo "Google OAuth client ID or client secret is not valid. Nothing was saved." >&2
  exit 1
fi

umask 077
cat > "$env_path" <<EOF
GOOGLE_BUSINESS_CLIENT_ID=$client_id
GOOGLE_BUSINESS_CLIENT_SECRET=$client_secret
EOF

echo "Google OAuth client credentials saved locally in .env.google-business.local."
