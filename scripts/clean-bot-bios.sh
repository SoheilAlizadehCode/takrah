#!/usr/bin/env bash
# پاک‌سازی بیوهای زبانی ربات از محتوای آلودهٔ باقی‌ماندهٔ هک
# هکر با توکن لو رفته، برای چند language_code بیو پورن ست کرده بود.
# پیش‌فرض فارسی تمیز بود ولی کلاینت‌های انگلیسی‌زبان نسخهٔ زبانی آلوده می‌گرفتند.
set -u
cd /home/z/my-project
TOKEN=$(grep '^BOT_TOKEN=' scripts/telegram-token.txt | cut -d= -f2-)
CLEAN_EN="Official takrah.top bot — 50 money-making AI prompts pack, channel member verification & support"

LANGS=(en en-GB de es fr it nl pl pt pt-BR ru ar tr uk fa id ms ko zh ja th hi bn ta te vi
       uz be ka az kk hy he cs sv ro hu bg da fi no nb el sq sr hr sl lt lv et mk sk sl)

cleaned=0
okcount=0
for L in "${LANGS[@]}"; do
  # --- بیوی پروفایل (short description) ---
  R=$(curl -s --max-time 10 "https://api.telegram.org/bot$TOKEN/getMyShortDescription?language_code=$L")
  if echo "$R" | grep -qi -e 'Undress' -e 'generai' -e 'porn'; then
    echo "[$L] BIO POLLUTED -> cleaning"
    curl -s --max-time 10 "https://api.telegram.org/bot$TOKEN/setMyShortDescription" \
      --data-urlencode "short_description=$CLEAN_EN" -d "language_code=$L" >/dev/null
    R2=$(curl -s --max-time 10 "https://api.telegram.org/bot$TOKEN/getMyShortDescription?language_code=$L")
    if echo "$R2" | grep -qi -e 'Undress' -e 'generai' -e 'porn'; then
      echo "[$L] STILL POLLUTED AFTER FIX! => $R2"
    else
      echo "[$L] bio fixed OK"
    fi
    cleaned=$((cleaned+1))
  else
    okcount=$((okcount+1))
  fi
  # --- دیسکریپشن بلند داخل چت ---
  RD=$(curl -s --max-time 10 "https://api.telegram.org/bot$TOKEN/getMyDescription?language_code=$L")
  if echo "$RD" | grep -qi -e 'Undress' -e 'generai' -e 'porn'; then
    echo "[$L] DESCRIPTION POLLUTED -> cleaning"
    curl -s --max-time 10 "https://api.telegram.org/bot$TOKEN/setMyDescription" \
      --data-urlencode "description=$CLEAN_EN" -d "language_code=$L" >/dev/null
    RD2=$(curl -s --max-time 10 "https://api.telegram.org/bot$TOKEN/getMyDescription?language_code=$L")
    if echo "$RD2" | grep -qi -e 'Undress' -e 'generai' -e 'porn'; then
      echo "[$L] DESCRIPTION STILL POLLUTED! => $RD2"
    else
      echo "[$L] description fixed OK"
    fi
  fi
done
echo "-----"
echo "languages checked: ${#LANGS[@]} | bios cleaned now: $cleaned | already clean: $okcount"
