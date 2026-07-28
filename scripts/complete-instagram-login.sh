#!/bin/zsh
set -euo pipefail

read -rs "app_secret?Paste the Instagram app secret, then press Return: "
print
read -rs "redirect_url?Paste the full redirect URL, then press Return: "
print

INSTAGRAM_APP_SECRET="$app_secret" \
INSTAGRAM_AUTH_REDIRECT="$redirect_url" \
node "$(dirname "$0")/complete-instagram-login.mjs"

unset app_secret redirect_url
