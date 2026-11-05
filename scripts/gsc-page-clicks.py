#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""کلیک‌های ۲۸ روز اخیر GSC روی کدام صفحه‌ها رفته؟ (یک‌باره)"""
import json, sys, urllib.request, ssl
from urllib.parse import quote
from datetime import date, timedelta

token = open(sys.argv[1]).read().strip().splitlines()[0].strip()
TODAY = date(2026, 11, 5)
ctx = ssl.create_default_context()
for label, rng in [("current", (TODAY - timedelta(days=28), TODAY - timedelta(days=1))),
                   ("previous", (TODAY - timedelta(days=56), TODAY - timedelta(days=29)))]:
    url = ("https://www.googleapis.com/webmasters/v3/sites/"
           + quote("https://takrah.top/", safe="")
           + "/searchAnalytics/query")
    body = json.dumps({"startDate": rng[0].isoformat(), "endDate": rng[1].isoformat(),
                       "dimensions": ["page"], "rowLimit": 1000}).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", "Bearer " + token)
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
        rows = json.loads(r.read().decode()).get("rows", [])
    rows.sort(key=lambda x: -x.get("clicks", 0))
    print(f"── {label} ({rng[0]}..{rng[1]}) — {len(rows)} صفحه با نمایش/کلیک ──")
    for x in rows[:10]:
        if x.get("clicks", 0) > 0 or x.get("impressions", 0) > 5:
            print(f"  {x.get('clicks',0)}c {x.get('impressions',0)}i pos {round(x.get('position',0),1)} — {x['keys'][0]}")
