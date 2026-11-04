#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
احراز هویت گوگل با سرویس‌اکانت (JWT) — مشترک بین ga4-report.py و gsc-report.py

فایل کلید: scripts/google-creds.json  (همان فایل JSON که از Google Cloud
→ IAM & Admin → Service Accounts → Keys → «Add key → JSON» دانلود می‌شود)

اگر این فایل نباشد، خطای راهنما می‌دهد — تنظیم آن ۳ قدم دارد که در
پیام تسک توضیح داده شده است.
"""
import json
import os
import sys
import time

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
import requests

CREDS_PATH = os.path.join(os.path.dirname(__file__), "google-creds.json")
TOKEN_URL = "https://oauth2.googleapis.com/token"

_cache: dict[str, tuple[float, str]] = {}


def _load_key_email() -> tuple[str, str]:
    if not os.path.exists(CREDS_PATH):
        print(
            "❌ فایل کلید سرویس‌اکانت پیدا نشد: scripts/google-creds.json\n"
            "   قدم‌های لازم:\n"
            "   ۱) console.cloud.google.com → پروژهٔ takrah-analytics بساز\n"
            "   ۲) «Google Analytics Data API» و «Google Search Console API» را Enable کن\n"
            "   ۳) Credentials → Service Account → بساز → Keys → Add key → JSON → دانلود\n"
            "   ۴) فایل JSON را همین‌جا آپلود کن تا در scripts/google-creds.json قرار بگیرد",
            file=sys.stderr,
        )
        raise SystemExit(1)
    with open(CREDS_PATH, encoding="utf-8") as f:
        data = json.load(f)
    key = data.get("private_key")
    email = data.get("client_email")
    if not key or not email:
        print("❌ فایل google-creds.json سرویس‌اکانت نیست (private_key/client_email ندارد)", file=sys.stderr)
        raise SystemExit(1)
    return key, email


def get_access_token(scope: str) -> str:
    """توکن دسترسی با کش ۵۰ دقیقه‌ای (JWT bearer → oauth2/token)."""
    now = time.time()
    hit = _cache.get(scope)
    if hit and hit[0] > now + 60:
        return hit[1]

    key_pem, email = _load_key_email()
    private_key = serialization.load_pem_private_key(key_pem.encode(), password=None)
    iat = int(now)
    payload = {
        "iss": email,
        "scope": scope,
        "aud": TOKEN_URL,
        "iat": iat,
        "exp": iat + 3600,
    }
    header = {"alg": "RS256", "typ": "JWT"}
    import base64

    def b64(obj: dict) -> str:
        raw = json.dumps(obj, separators=(",", ":"), sort_keys=True).encode()
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    signing_input = f"{b64(header)}.{b64(payload)}".encode()
    sig = private_key.sign(signing_input, padding.PKCS1v15(), hashes.SHA256())
    assertion = f"{signing_input.decode()}.{base64.urlsafe_b64encode(sig).rstrip(b'=').decode()}"

    r = requests.post(
        TOKEN_URL,
        data={"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": assertion},
        timeout=30,
    )
    if r.status_code != 200:
        print(f"❌ گرفتن توکن گوگل ناموفق بود: {r.status_code} {r.text[:300]}", file=sys.stderr)
        raise SystemExit(1)
    token = r.json()["access_token"]
    _cache[scope] = (now, token)
    return token


if __name__ == "__main__":
    tok = get_access_token("https://www.googleapis.com/auth/analytics.readonly")
    print("✅ توکن گوگل سالم است (اولین ۱۵ کاراکتر:", tok[:15] + "...)")
