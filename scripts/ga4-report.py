#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
گزارش GA4 تک‌راه — برای سؤال «اضافه‌کردن انگلیسی به سایت کمکی کرده یا نه»

پیش‌نیازها (یک‌بار):
  ۱) scripts/google-creds.json  ← فایل کلید سرویس‌اکانت (google_auth.py راهنما می‌دهد)
  ۲) scripts/ga4-config.json    ← {"property_id": "123456789"}
     عدد Property ID از analytics.google.com → چرخ‌دندهٔ Admin → Property Settings
  ۳) ایمیل client_email داخل فایل کلید باید در GA4:
     Admin → Property Access Management → + → همان ایمیل → نقش Viewer
اجرا:
  python3 scripts/ga4-report.py

خروجی: گزارش خوانا در ترمینال + ذخیرهٔ JSON در scripts/ga4-last-report.json
"""
import json
import os
import sys
from datetime import date, timedelta

from google_auth import get_access_token

SCOPES = "https://www.googleapis.com/auth/analytics.readonly"
CONFIG = os.path.join(os.path.dirname(__file__), "ga4-config.json")
OUT = os.path.join(os.path.dirname(__file__), "ga4-last-report.json")
API = "https://analyticsdata.googleapis.com/v1beta/properties/{pid}:runReport"

today = date.today()
RANGES = [
    {"startDate": (today - timedelta(days=28)).isoformat(), "endDate": (today - timedelta(days=1)).isoformat(), "name": "current"},
    {"startDate": (today - timedelta(days=56)).isoformat(), "endDate": (today - timedelta(days=29)).isoformat(), "name": "previous"},
]


def load_property_id() -> str:
    if not os.path.exists(CONFIG):
        print(
            f"❌ {CONFIG} نیست. یک فایل با این محتوا بساز:\n"
            '   {"property_id": "123456789"}\n'
            "   عدد Property ID: analytics.google.com → Admin (چرخ‌دنده) → Property Settings",
            file=sys.stderr,
        )
        raise SystemExit(1)
    pid = json.load(open(CONFIG, encoding="utf-8")).get("property_id", "")
    if not pid or not str(pid).isdigit():
        print("❌ property_id عددی درست نیست — Property ID در GA4 یک عدد خالص است (نه G-...)", file=sys.stderr)
        raise SystemExit(1)
    return str(pid)


def run_report(pid: str, body: dict) -> dict:
    token = get_access_token(SCOPES)
    import requests

    r = requests.post(API.format(pid=pid), json=body, headers={"Authorization": f"Bearer {token}"}, timeout=60)
    if r.status_code != 200:
        hint = ""
        if "PERMISSION_DENIED" in r.text:
            hint = (
                "\n   💡 دسترسی رد شد: ایمیل client_email (اول فایل google-creds.json) را در\n"
                "      GA4 → Admin → Property Access Management → + با نقش Viewer اضافه کن."
            )
        print(f"❌ GA4 API {r.status_code}: {r.text[:400]}{hint}", file=sys.stderr)
        raise SystemExit(1)
    return r.json()


def rows_to_dicts(res: dict) -> list[dict]:
    headers = [h["name"] for h in res.get("dimensionHeaders", [])] + [h["name"] for h in res.get("metricHeaders", [])]
    return [dict(zip(headers, row["dimensionValues"] + row["metricValues"])) for row in res.get("rows", [])]


def fmt(n: str) -> str:
    try:
        return f"{float(n):,.0f}" if float(n) == int(float(n)) else f"{float(n):.1%}" if float(n) <= 1 else n
    except Exception:
        return n


def delta(cur: float, prev: float) -> str:
    if prev == 0:
        return "جدید" if cur else "۰"
    d = (cur - prev) / prev * 100
    return f"{d:+.0f}%"


def main() -> None:
    pid = load_property_id()
    report: dict = {"generated": today.isoformat(), "ranges": RANGES}

    # ── ۱) نمای کلی: ۲۸ روز اخیر در مقابل ۲۸ روز قبل ──
    overview = run_report(pid, {
        "dateRanges": RANGES,
        "metrics": [
            {"name": "activeUsers"}, {"name": "newUsers"}, {"name": "sessions"},
            {"name": "screenPageViews"}, {"name": "engagementRate"},
            {"name": "averageSessionDuration"}, {"name": "keyEvents"},
        ],
    })
    ov_rows = rows_to_dicts(overview)
    cur = ov_rows[0] if ov_rows else {}
    prev = ov_rows[1] if len(ov_rows) > 1 else {}
    metrics_fa = {
        "activeUsers": "کاربر فعال", "newUsers": "کاربر جدید", "sessions": "جلسه",
        "screenPageViews": "بازدید صفحه", "engagementRate": "نرخ تعامل",
        "averageSessionDuration": "میانگین زمان (ثانیه)", "keyEvents": "رویدادهای کلیدی",
    }
    print("┌─ نمای کلی (۲۸ روز اخیر در برابر ۲۸ روز قبل) ─")
    ov_json = {}
    for m, fa in metrics_fa.items():
        c, p = float(cur.get(m, 0) or 0), float(prev.get(m, 0) or 0)
        ov_json[m] = {"current": c, "previous": p, "delta": delta(c, p)}
        print(f"│  {fa:<22} {fmt(cur.get(m, '0')):>10}   ({delta(c, p)})")
    report["overview"] = ov_json

    # ── ۲) تفکیک انگلیسی در برابر فارسی (بر اساس پیشوند مسیر) ──
    lang = {}
    print("├─ تفکیک زبان (بازدید صفحه / کاربر فعال) ─")
    for label, filt in [("fa", None), ("en", {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "BEGINS_WITH", "value": "/en"}}})]:
        body = {
            "dateRanges": RANGES,
            "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}],
        }
        if filt:
            body["dimensionFilter"] = filt
        res = rows_to_dicts(run_report(pid, body))
        c = res[0] if res else {}
        p = res[1] if len(res) > 1 else {}
        lang[label] = {
            "views": {"current": float(c.get("screenPageViews", 0) or 0), "previous": float(p.get("screenPageViews", 0) or 0)},
            "users": {"current": float(c.get("activeUsers", 0) or 0), "previous": float(p.get("activeUsers", 0) or 0)},
        }
    if lang["fa"]["views"]["previous"]:
        share_now = lang["en"]["views"]["current"] / max(1.0, lang["fa"]["views"]["current"] + lang["en"]["views"]["current"])
        share_prev = lang["en"]["views"]["previous"] / max(1.0, lang["fa"]["views"]["previous"] + lang["en"]["views"]["previous"])
        print(f"│  EN share of views: {share_now:.0%} now vs {share_prev:.0%} previous period")
    report["by_language"] = lang

    # ── ۳) پربازدیدترین صفحه‌ها (کل) ──
    pages = rows_to_dicts(run_report(pid, {
        "dateRanges": [RANGES[0]],
        "dimensions": [{"name": "pagePath"}],
        "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}],
        "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
        "limit": 15,
    }))
    print("├─ پربازدیدترین صفحه‌ها (۲۸ روز اخیر) ─")
    for r in pages:
        print(f"│  {fmt(r['screenPageViews']):>7} بازدید  {r['pagePath']}")
    report["top_pages"] = pages

    # ── ۴) رویدادها — affiliate_click / language_switch / گیت ──
    events = rows_to_dicts(run_report(pid, {
        "dateRanges": [RANGES[0]],
        "dimensions": [{"name": "eventName"}],
        "metrics": [{"name": "eventCount"}],
        "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
        "limit": 20,
    }))
    print("├─ رویدادهای کلیدی (۲۸ روز اخیر) ─")
    for r in events:
        print(f"│  {fmt(r['eventCount']):>7} ×  {r['eventName']}")
    report["events"] = events

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=1)
    print(f"└─ ذخیره شد: {OUT}")


if __name__ == "__main__":
    main()
