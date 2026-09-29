#!/usr/bin/env python3
"""ارسال پست عکس‌دار به کانال تلگرام تک‌راه.

چون -F در curl این محیط خراب است (exit 26)، آپلود multipart با requests انجام می‌شود.

Usage:
  python3 telegram-photo.py --photo <img.png> --caption <caption.html> \
      [--schedule '2026-10-05 21:00' (تهران)] [--silent] [--pin]
"""
import argparse
import json
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).parent
TOKEN = (SCRIPT_DIR / "telegram-token.txt").read_text().strip()
CHAT_ID = "@takrahTop"
TEHRAN_TZ = timezone(timedelta(hours=3, minutes=30))  # ایران از ۱۴۰۱ دی‌ساختی ندارد


def send_photo(photo_path: Path, caption: str, schedule_epoch=None, silent=False):
    url = f"https://api.telegram.org/bot{TOKEN}/sendPhoto"
    data = {"chat_id": CHAT_ID, "caption": caption, "parse_mode": "HTML"}
    if schedule_epoch:
        data["schedule_date"] = str(int(schedule_epoch))
    if silent:
        data["disable_notification"] = "true"
    with photo_path.open("rb") as f:
        resp = requests.post(url, data=data, files={"photo": f}, timeout=90)
    return resp


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photo", required=True)
    ap.add_argument("--caption", required=True)
    ap.add_argument("--schedule", help="مثال: '2026-10-05 21:00' به وقت تهران")
    ap.add_argument("--silent", action="store_true")
    ap.add_argument("--pin", action="store_true")
    args = ap.parse_args()

    photo = Path(args.photo)
    caption = Path(args.caption).read_text(encoding="utf-8").strip()

    n_chars = len(caption)
    if n_chars > 1024:
        print(f"خطا: کپشن {n_chars} کاراکتر است (حد مجاز ۱۰۲۴)")
        sys.exit(1)

    schedule_epoch = None
    if args.schedule:
        dt = datetime.strptime(args.schedule, "%Y-%m-%d %H:%M").replace(tzinfo=TEHRAN_TZ)
        schedule_epoch = dt.timestamp()
        print(f"زمان‌بندی: {args.schedule} تهران (epoch: {int(schedule_epoch)})")

    resp = send_photo(photo, caption, schedule_epoch, args.silent)
    print(resp.text[:400])

    ok = resp.ok and resp.json().get("ok")
    if ok and args.pin:
        msg_id = resp.json()["result"]["message_id"]
        time.sleep(1)
        requests.post(
            f"https://api.telegram.org/bot{TOKEN}/pinChatMessage",
            data={"chat_id": CHAT_ID, "message_id": msg_id},
            timeout=30,
        )
        print(f"pinned: {msg_id}")

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
