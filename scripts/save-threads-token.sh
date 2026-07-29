#!/usr/bin/env zsh
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
env_path="$root/.env.threads.local"

read -s "token?Paste the Threads access token, then press Return: "
echo

if (( ${#token} < 20 )); then
  echo "Token was not saved: it is too short to be a Threads access token." >&2
  exit 1
fi

# Some terminal paste managers duplicate a clipboard value. Keep the one token.
if (( ${#token} % 2 == 0 )); then
  midpoint=$(( ${#token} / 2 ))
  first_half="${token[1,$midpoint]}"
  second_half="${token[$((midpoint + 1)),-1]}"
  if [[ "$first_half" == "$second_half" ]]; then
    token="$first_half"
    echo "A duplicated token paste was detected and reduced to one token."
  fi
fi

umask 077
cat > "$env_path" <<EOF
THREADS_ACCESS_TOKEN=$token
EOF
chmod 600 "$env_path"
unset token
echo "Threads token saved locally in .env.threads.local."
