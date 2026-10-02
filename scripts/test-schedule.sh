#!/bin/bash
# تست مکانیزم زمان‌بندی تلگرام: متن vs عکس
TOKEN=$(cat /home/z/my-project/scripts/telegram-token.txt)
API="https://api.telegram.org/bot${TOKEN}"
CHAT="@takrahTop"
NOW=$(date -u +%s)

echo "=== TEST A: schedule TEXT at +2min ==="
EPOCH_A=$((NOW + 120))
curl -s "$API/sendMessage" --data-urlencode "chat_id=$CHAT" \
  --data-urlencode "text=🔧 تست فنی زمان‌بندی (متن) — نادیده بگیرید" \
  --data-urlencode "schedule_date=$EPOCH_A" | head -c 120; echo
echo "epoch A: $EPOCH_A (publish at $(date -u -d @$EPOCH_A '+%H:%M:%S UTC'))"

echo "=== TEST B: schedule PHOTO at +2.5min ==="
EPOCH_B=$((NOW + 150))
curl -s "$API/sendPhoto" --data-urlencode "chat_id=$CHAT" \
  --data-urlencode "caption=🔧 تست فنی زمان‌بندی (عکس) — نادیده بگیرید" \
  --data-urlencode "schedule_date=$EPOCH_B" \
  --data-urlencode "photo=AgACAgQAAyEGAAMBAZFUPgADDmq8PE1J1FW3HH2pOfi9o0iv9T2lAAL4EGsb77TgURnBqXo4ZnbjAQADAgADcwADPQQ" \
  | head -c 120; echo
echo "epoch B: $EPOCH_B (publish at $(date -u -d @$EPOCH_B '+%H:%M:%S UTC'))"

echo "=== waiting 200s for both to publish... ==="
sleep 200

echo "=== getUpdates check ==="
curl -s "$API/getUpdates?allowed_updates=%5B%22channel_post%22%5D" | python3 -c "
import json,sys
from datetime import datetime, timezone
d=json.load(sys.stdin)
res=d.get('result',[])
print(f'total updates: {len(res)}')
for u in res[-10:]:
    cp=u.get('channel_post',{})
    if cp:
        dt=datetime.fromtimestamp(cp.get('date',0),tz=timezone.utc).strftime('%H:%M:%S UTC')
        print(f\"msg_id={cp.get('message_id')} at={dt} photo={'YES' if 'photo' in cp else 'no'} txt={str(cp.get('text') or cp.get('caption') or '')[:45]!r}\")
"
