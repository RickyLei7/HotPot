#!/usr/bin/env zsh
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
env_path="$root/.env.facebook.local"

read "page_id?Paste the Facebook Page ID, then press Return: "
read -s "page_token?Paste the new Facebook Page access token, then press Return: "
echo

if [[ ! "$page_id" =~ '^[0-9]+$' ]]; then
  echo "Token was not saved: the Page ID must contain only digits." >&2
  exit 1
fi

if [[ ! "$page_token" =~ '^EAA' ]]; then
  echo "Token was not saved: this does not look like a Facebook Page access token." >&2
  exit 1
fi

# Some terminal paste managers duplicate a clipboard value. Keep the one token.
if (( ${#page_token} % 2 == 0 )); then
  midpoint=$(( ${#page_token} / 2 ))
  first_half="${page_token[1,$midpoint]}"
  second_half="${page_token[$((midpoint + 1)),-1]}"
  if [[ "$first_half" == "$second_half" ]]; then
    page_token="$first_half"
    echo "A duplicated token paste was detected and reduced to one token."
  fi
fi

umask 077
cat > "$env_path" <<EOF
FACEBOOK_PAGE_ID=$page_id
FACEBOOK_PAGE_ACCESS_TOKEN=$page_token
EOF
chmod 600 "$env_path"
echo "Facebook Page token saved locally in .env.facebook.local."
