#!/usr/bin/env bash
# ─── بازیابی/ثبت وبهوک ربات تلگرام takrah ───
# استفاده:
#   bash scripts/setup-telegram-webhook.sh
# یا با توکن جدید (بعد از تعویض ربات):
#   BOT_TOKEN=123:AAA WEBHOOK_SECRET=... BOT_USERNAME=New_bot bash scripts/setup-telegram-webhook.sh
# مقادیر پیش‌فرض از scripts/telegram-token.txt خوانده می‌شوند (gitignore شده).
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$DIR/telegram-token.txt"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

TOKEN="${BOT_TOKEN:-}"
SECRET="${WEBHOOK_SECRET:-tk9f4e2c1a7b35d8e0f6a4c2b9d17e35}"
URL="${WEBHOOK_URL:-https://takrah.top/api/telegram-bot}"

if [ -z "$TOKEN" ]; then
  echo "❌ BOT_TOKEN خالی است — در scripts/telegram-token.txt یا متغیر محیطی بده" >&2
  exit 1
fi

echo "→ setWebhook: $URL"
curl -s -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"${URL}\",\"secret_token\":\"${SECRET}\",\"allowed_updates\":[\"message\",\"callback_query\"],\"drop_pending_updates\":true}"
echo ""

echo "→ getWebhookInfo:"
curl -s "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
echo ""
echo "✅ تمام — allowed_updates باید message و callback_query هر دو باشند"
