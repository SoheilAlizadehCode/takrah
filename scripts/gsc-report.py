#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
گزارش Google Search Console تک‌راه — منبع اصلی سنجش «سیو» (SEO)

کلیک/ایمپرشن/میانگین رتبه را برای:
  • کل سایت، بخش فارسی، بخش /en  → ۲۸ روز اخیر در برابر ۲۸ روز قبل
  • پربازدیدترین کوئری‌ها
نشان می‌دهد. این دقیق‌ترین پاسخ به «انگلیسی کمکی کرده یا نه» است چون
کلیک‌های گوگل را قبل از ورود به سایت می‌سنجد (GA4 فقط ورود را می‌بیند).

پیش‌نیازها:
  ۱) scripts/google-creds.json (سرویس‌اکانت — google_auth.py راهنما می‌دهد)
  ۲) همان ایمیل client_email در سرچ‌کنسول اضافه شده باشد:
     search.google.com/search-console → چرخ‌دندهٔ Settings → Users and
     permissions → ADD USER → ایمیل سرویس‌اکانت → نقش Full یا Restricted
اجرا:
  python3 scripts/gsc-report.py
"""
import json
import os
from datetime import date, timedelta
from urllib.parse import quote

from google_auth import get_access_token

import requests

SCOPES = "https://www.googleapis.com/auth/webmasters.readonly"
SITE = "https://takrah.top/"
OUT = os.path.join(os.path.dirname(__file__), "gsc-last-report.json")
API = "https://searchconsole.googleapis.com/webmasters/v3/sites/" + quote(SITE, safe="") + "/searchAnalytics/query"

today = date.today()
CUR = ((today - timedelta(days=28)).isoformat(), (today - timedelta(days=1)).isoformat())
PREV = ((today - timedelta(days=56)).isoformat(), (today - timedelta(days=29)).isoformat())


def query(start: str, end: str, dims: list[str], rows: int = 250) -> list[dict]:
    token = get_access_token(SCOPES)
    body = {"startDate": start, "endDate": end, "dimensions": dims, "rowLimit": rows}
    r = requests.post(API, json=body, headers={"Authorization": f"Bearer {token}"}, timeout=60)
    if r.status_code != 200:
        hint = ""
        if "403" in str(r.status_code):
            hint = (
                "\n   💡 ایمیل client_email (اول فایل google-creds.json) باید در سرچ‌کنسول\n"
                "      Settings → Users and permissions اضافه شده باشد."
            )
        print(f"❌ GSC API {r.status_code}: {r.text[:300]}{hint}", file=sys.stderr)
        raise SystemExit(1)
    return r.json().get("rows", [])


def agg(rows: list[dict], prefix: str | None = None, exclude: str | None = None) -> dict:
    """جمع کلیک/ایمپرشن (+ رتبهٔ وزنی) — با فیلتر اختیاری پیشوند مسیر.
    نکته: هر URL کامل است (https://takrah.top/...)؛ بخش فارسی یعنی همهٔ
    URLهای دامنه که با /en شروع نمی‌شوند."""
    clicks = imps = 0.0
    pos_w = 0.0
    for r in rows:
        keys = r.get("keys", [])
        if prefix is not None and not keys[0].startswith(prefix):
            continue
        if exclude is not None and keys[0].startswith(exclude):
            continue
        clicks += r.get("clicks", 0)
        imps += r.get("impressions", 0)
        pos_w += r.get("position", 0) * r.get("clicks", 0)
    return {
        "clicks": round(clicks),
        "impressions": round(imps),
        "position": round(pos_w / clicks, 1) if clicks else None,
    }


def line(label: str, cur: dict, prev: dict) -> None:
    dc = (cur["clicks"] - prev["clicks"]) if prev["clicks"] else None
    di = (cur["impressions"] - prev["impressions"]) if prev["impressions"] else None
    pos = f"رتبه {cur['position']}" if cur["position"] else "بی‌رتبه"
    print(f"│  {label:<18} {cur['clicks']:>5} کلیک ({'+' if dc and dc>0 else ''}{dc or '—'})  |  {cur['impressions']:>7} نمایش ({'+' if di and di>0 else ''}{di or '—'})  |  {pos}")


def main() -> None:
    report: dict = {"site": SITE, "current": CUR, "previous": PREV}

    # صفحات — سه دهانه: کل / فارسی / انگلیسی
    cur_rows = query(CUR[0], CUR[1], ["page"])
    prev_rows = query(PREV[0], PREV[1], ["page"])
    print("┌─ Search Console — ۲۸ روز اخیر ( vs ۲۸ روز قبل ) ─")
    out_pages = {}
    for label, prefix, exclude in [
        ("کل سایت", None, None),
        ("فارسی", "https://takrah.top/", "https://takrah.top/en"),
        ("انگلیسی /en", "https://takrah.top/en", None),
    ]:
        c, p = agg(cur_rows, prefix, exclude), agg(prev_rows, prefix, exclude)
        out_pages[label] = {"current": c, "previous": p}
        line(label, c, p)
    report["pages"] = out_pages

    # کوئری‌های برتر
    q_rows = query(CUR[0], CUR[1], ["query"], rows=20)
    print("├─ کوئری‌های برتر (۲۸ روز اخیر) ─")
    out_q = []
    for r in sorted(q_rows, key=lambda x: -x.get("clicks", 0))[:12]:
        out_q.append({"query": r["keys"][0], "clicks": r.get("clicks", 0), "impressions": r.get("impressions", 0), "position": round(r.get("position", 0), 1)})
        print(f"│  {r.get('clicks',0):>4} کلیک | {r.get('impressions',0):>7} نمایش | رتبه {r.get('position',0):.1f}  «{r['keys'][0][:48]}»")
    report["top_queries"] = out_q

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print(f"└─ ذخیره شد: {OUT}")


if __name__ == "__main__":
    main()
