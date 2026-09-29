#!/bin/bash
# ارسال پیام به کانال تلگرام تک‌راه (@takrahTop)
# Usage:
#   telegram-post.sh <message-file.html> [--pin] [--silent] [--schedule "TZ=\"Asia/Tehran\" 2026-09-30 21:00"]
# فایل پیام باید HTML معتبر تلگرام باشد (<b>, <i>, <a> و...)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOKEN=$(cat "$SCRIPT_DIR/telegram-token.txt" | tr -d '[:space:]')
CHAT_ID="@takrahTop"
API="https://api.telegram.org/bot${TOKEN}"

MSG_FILE=""
PIN=0
SILENT=0
SCHEDULE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pin) PIN=1 ;;
    --silent) SILENT=1 ;;
    --schedule) SCHEDULE="$2"; shift ;;
    *) MSG_FILE="$1" ;;
  esac
  shift
done

if [[ -z "$MSG_FILE" || ! -f "$MSG_FILE" ]]; then
  echo "خطا: فایل پیام پیدا نشد. Usage: $0 <message-file.html> [--pin] [--silent] [--schedule ...]"
  exit 1
fi

PARAMS=(--data-urlencode "chat_id=${CHAT_ID}" \
        --data-urlencode "text@${MSG_FILE}" \
        --data-urlencode "parse_mode=HTML")

[[ $SILENT -eq 1 ]] && PARAMS+=(--data-urlencode "disable_notification=true")

if [[ -n "$SCHEDULE" ]]; then
  EPOCH=$(date -d "$SCHEDULE" +%s)
  PARAMS+=(--data-urlencode "schedule_date=${EPOCH}")
  echo "زمان‌بندی: $SCHEDULE (epoch: $EPOCH)"
fi

RESPONSE=$(curl -s -m 30 -X POST "${API}/sendMessage" "${PARAMS[@]}")
echo "$RESPONSE"

# اگر موفق بود و پرچم pin داشت، پیام را پین کن
OK=$(echo "$RESPONSE" | grep -o '"ok":true' || true)
if [[ -n "$OK" && $PIN -eq 1 ]]; then
  MSG_ID=$(echo "$RESPONSE" | grep -oE '"message_id":[0-9]+' | grep -oE '[0-9]+' | head -1)
  if [[ -n "$MSG_ID" ]]; then
    sleep 1
    curl -s -m 15 -X POST "${API}/pinChatMessage" \
      --data-urlencode "chat_id=${CHAT_ID}" \
      --data-urlencode "message_id=${MSG_ID}"
    echo
  fi
fi
