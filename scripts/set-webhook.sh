#!/usr/bin/env bash
set -euo pipefail

# set-webhook.sh — Register Telegram webhook for a bot
# Usage: bash scripts/set-webhook.sh <BOT_TOKEN> <WEBHOOK_URL> <SECRET_TOKEN>

if [ $# -lt 3 ]; then
    echo "Usage: $0 <BOT_TOKEN> <WEBHOOK_URL> <SECRET_TOKEN>"
    echo ""
    echo "Example:"
    echo "  $0 123456:ABC-DEF1234 https://example.com/api/telegram/webhook/ my-secret"
    exit 1
fi

BOT_TOKEN="$1"
WEBHOOK_URL="$2"
SECRET_TOKEN="$3"

echo "Registering webhook for bot..."
curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{
        \"url\": \"${WEBHOOK_URL}\",
        \"secret_token\": \"${SECRET_TOKEN}\"
    }"

echo ""
echo "Done."
