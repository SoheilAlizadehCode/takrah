#!/bin/bash
# Send 3 new avatar options to user's private chat with @TakrahTop_bot
# chat_id: 5289089807 (Arash)

TOKEN=$(cat /home/z/my-project/scripts/telegram-token.txt)
CHAT="5289089807"
DL="/home/z/my-project/download"

send_photo() {
  local file="$1"
  local caption="$2"
  curl -s -X POST "https://api.telegram.org/bot$TOKEN/sendPhoto" \
    -F "chat_id=$CHAT" \
    -F "photo=@$file" \
    -F "caption=$caption" \
    -F "parse_mode=HTML"
}

echo "=== 1: minimal (road->arrow) ==="
send_photo "$DL/takrah-avatar-v2-minimal.png" "گزینه ۱ — جاده و فلش ✨
استعاره دقیق «تک‌راه»: مسیری که به بالا ختم می‌شه
فیروزه‌ای روی کرم — هماهنگ با رنگ سایت
💡 پیشنهاد من همین است"

echo "=== 2: dark (neural brain) ==="
send_photo "$DL/takrah-avatar-v2-dark.png" "گزینه ۲ — مغز نورونی 🧠
نئون فیروزه‌ای روی سرمه‌ای تیره
حس لوکس و تکنولوژی جدی"

echo "=== 3: robot mascot ==="
send_photo "$DL/takrah-avatar-v2-robot.png" "گزینه ۳ — ربات بامزه 🤖
ماسکات سه‌بعدی دوست‌داشتنی
به‌یادموندنی و صمیمی"

echo "=== done ==="
