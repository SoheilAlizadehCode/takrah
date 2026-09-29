#!/bin/bash
# ارسال پیام به کانال تلگرام تک‌راه (@takrahTop)
# Usage:
#   telegram-post.sh <message-file.html> [--photo <image.png>] [--pin] [--silent] [--schedule 'TZ="Asia/Tehran" 2026-10-05 21:00']
# فایل پیام باید HTML معتبر تلگرام باشد (<b>, <i>, <a> و...)
# با --photo، پست به‌صورت عکس + کپشن ارسال می‌شود (کپشن حداکثر ۱۰۲۴ کاراکتر)
# نکته: در این محیط -F در curl خراب است؛ حالت عکس به telegram-photo.py (پایتون/requests) سپرده می‌شود

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOKEN=$(cat "$SCRIPT_DIR/telegram-token.txt" | tr -d '[:space:]')
CHAT_ID="@takrahTop"
API="https://api.telegram.org/bot${TOKEN}"

MSG_FILE=""
PHOTO=""
PIN=0
SILENT=0
SCHEDULE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pin) PIN=1 ;;
    --silent) SILENT=1 ;;
    --photo) PHOTO="$2"; shift ;;
    --schedule) SCHEDULE="$2"; shift ;;
    *) MSG_FILE="$1" ;;
  esac
  shift
done

if [[ -z "$MSG_FILE" || ! -f "$MSG_FILE" ]]; then
  echo "خطا: فایل پیام پیدا نشد. Usage: $0 <message-file.html> [--photo <img>] [--pin] [--silent] [--schedule ...]"
  exit 1
fi

if [[ -n "$PHOTO" && ! -f "$PHOTO" ]]; then
  echo "خطا: فایل عکس پیدا نشد: $PHOTO"
  exit 1
fi

if [[ -n "$PHOTO" ]]; then
  # حالت عکس: curl -F در این محیط خراب است (exit 26) → پایتون
  PY_ARGS=(--photo "$PHOTO" --caption "$MSG_FILE")
  [[ $PIN -eq 1 ]] && PY_ARGS+=(--pin)
  [[ $SILENT -eq 1 ]] && PY_ARGS+=(--silent)
  if [[ -n "$SCHEDULE" ]]; then
    # 'TZ="Asia/Tehran" 2026-10-05 21:00' → '2026-10-05 21:00'
    PY_ARGS+=(--schedule "$(echo "$SCHEDULE" | sed 's/TZ=.*[" ]\+//')")
  fi
  exec python3 "$SCRIPT_DIR/telegram-photo.py" "${PY_ARGS[@]}"
fi

# حالت متن ساده (sendMessage با --data-urlencode)
PARAMS=(--data-urlencode "chat_id=${CHAT_ID}" \
        --data-urlencode "text@${MSG_FILE}" \
        --data-urlencode "parse_mode=HTML")
[[ $SILENT -eq 1 ]] && PARAMS+=(--data-urlencode "disable_notification=true")
if [[ -n "$SCHEDULE" ]]; then
  EPOCH=$(date -d "$SCHEDULE" +%s)
  PARAMS+=(--data-urlencode "schedule_date=${EPOCH}")
  echo "زمان‌بندی: $SCHEDULE (epoch: $EPOCH)"
fi

RESPONSE=$(curl -s -m 60 -X POST "${API}/sendMessage" "${PARAMS[@]}")
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
