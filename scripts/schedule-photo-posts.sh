#!/bin/bash
# Re-schedule all 7 article posts as PHOTO posts (cover + caption)
# Old text-only scheduled posts were deleted via deleteMessage.
# Schedule: Sep 30 - Oct 6, 21:00 Tehran each night

set -e
cd /home/z/my-project
S="scripts/telegram-post.sh"
C="public/images/covers"

post() {
  local html="$1" cover="$2" when="$3"
  echo "=== $html @ $when ==="
  "$S" "$html" --photo "$cover" --schedule "$when" | grep -oE '"ok":(true|false)|"message_id":[0-9]+'
  sleep 2
}

post "scripts/tg-art1.html"  "$C/ai-income.png"            'TZ="Asia/Tehran" 2026-09-30 21:00'
post "scripts/tg-art2.html"  "$C/freelance-ai.png"         'TZ="Asia/Tehran" 2026-10-01 21:00'
post "scripts/tg-art3.html"  "$C/free-ai-tools.png"        'TZ="Asia/Tehran" 2026-10-02 21:00'
post "scripts/tg-art4.html"  "$C/ai-income-iran.png"       'TZ="Asia/Tehran" 2026-10-03 21:00'
post "scripts/tg-art5.html"  "$C/learn-ai-roadmap.png"     'TZ="Asia/Tehran" 2026-10-04 21:00'
post "scripts/tg-comp1.html" "$C/chatbot-comparison.png"   'TZ="Asia/Tehran" 2026-10-05 21:00'
post "scripts/tg-comp2.html" "$C/ai-income-comparison.png" 'TZ="Asia/Tehran" 2026-10-06 21:00'

echo "=== ALL SCHEDULED ==="
