#!/usr/bin/env python3
"""ویرایش عکس پست ۶۴ کانال @takrahTop با editMessageMedia (کپشن قبلی حفظ می‌شود)."""
import json
import sys
from pathlib import Path

import requests

SCRIPT_DIR = Path(__file__).parent
TOKEN = (SCRIPT_DIR / "telegram-token.txt").read_text().strip()
CHAT_ID = "@takrahTop"
MSG_ID = 64
PHOTO = SCRIPT_DIR / "ai-service-final.png"
CAPTION = (SCRIPT_DIR / "tg-art15-3.html").read_text(encoding="utf-8").strip()

media = {
    "type": "photo",
    "media": "attach://photo",
    "caption": CAPTION,
    "parse_mode": "HTML",
}

with PHOTO.open("rb") as f:
    resp = requests.post(
        f"https://api.telegram.org/bot{TOKEN}/editMessageMedia",
        data={"chat_id": CHAT_ID, "message_id": MSG_ID, "media": json.dumps(media)},
        files={"photo": f},
        timeout=90,
    )

print(resp.status_code, resp.text[:300])
sys.exit(0 if resp.ok and resp.json().get("ok") else 1)
