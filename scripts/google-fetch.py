#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
تک‌راه — کشیدن GA4 + Search Console با توکن دسترسی کاربر (OAuth Playground)

ورودی:  مسیر فایلی که فقط توکن داخلش است (argv[1]) — پیشنهاد: /tmp/gtoken
        توکن یک‌ساعته است و نباید در پروژه ذخیره شود.
خروجی:  scripts/ga-pull.json  (داده‌های GA4 + GSC، بدون توکن)

کاربردها:
  python3 scripts/google-fetch.py /tmp/gtoken
"""

import json
import ssl
import sys
import urllib.request
from datetime import date, timedelta

PROPERTY_ID = "556099118"
SITE_HINT = "takrah.top"

TODAY = date(2026, 11, 5)  # امروز به وقت تهران
R_CURRENT = (TODAY - timedelta(days=28), TODAY - timedelta(days=1))
R_PREVIOUS = (TODAY - timedelta(days=56), TODAY - timedelta(days=29))

CTX = ssl.create_default_context()


def call(url, token, body=None, method=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method or ("POST" if data else "GET"))
    req.add_header("Authorization", "Bearer " + token)
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
            return r.getcode(), json.loads(r.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or "{}")


def gsc_block(token):
    # ۱) فهرست پراپرتی‌های وریفای‌شده
    code, sites = call("https://www.googleapis.com/webmasters/v3/sites", token)
    if code != 200:
        return {"error": f"sites {code}: {json.dumps(sites)[:200]}"}
    items = sites.get("siteEntry", [])
    mine = [s for s in items if SITE_HINT in s.get("siteUrl", "")]
    if not mine:
        return {"error": "no verified property matches " + SITE_HINT,
                "available": [s["siteUrl"] for s in items][:10]}
    # ترجیح: URL-prefix دقیق، بعد sc-domain
    pick = next((s["siteUrl"] for s in mine if s["siteUrl"] == f"https://{SITE_HINT}/"),
                mine[0]["siteUrl"])
    from urllib.parse import quote
    base = "https://www.googleapis.com/webmasters/v3/sites/" + quote(pick, safe="") + "/searchAnalytics/query"

    def rows(rng, dims, limit):
        c, res = call(base, token, {
            "startDate": rng[0].isoformat(), "endDate": rng[1].isoformat(),
            "dimensions": dims, "rowLimit": limit})
        return res.get("rows", []) if c == 200 else []

    def agg(rows_, want_en):
        c = i = 0
        posw = 0.0
        for r in rows_:
            k = (r.get("keys") or [""])[0]
            is_en = k.rstrip("/").endswith("/en") or "/en/" in k or k.endswith("/en")
            # صفحه‌های /en با پیشوند شروع می‌شوند؛ مقایسه با URL پایه
            if k.startswith(f"https://{SITE_HINT}/en"):
                is_en = True
            if want_en is True and not is_en:
                continue
            if want_en is False and is_en:
                continue
            c += r.get("clicks", 0)
            i += r.get("impressions", 0)
            posw += r.get("position", 0) * r.get("clicks", 0)
        return {"clicks": round(c), "impressions": round(i),
                "position": round(posw / c, 1) if c else None}

    pages_cur = rows(R_CURRENT, ["page"], 1000)
    pages_prev = rows(R_PREVIOUS, ["page"], 1000)
    queries = rows(R_CURRENT, ["query"], 25)
    queries.sort(key=lambda r: -r.get("clicks", 0))
    return {
        "property": pick,
        "current": {"all": agg(pages_cur, None), "fa": agg(pages_cur, False), "en": agg(pages_cur, True)},
        "previous": {"all": agg(pages_prev, None), "fa": agg(pages_prev, False), "en": agg(pages_prev, True)},
        "top_queries": [{"query": r["keys"][0], "clicks": r.get("clicks", 0),
                         "impressions": r.get("impressions", 0),
                         "position": round(r.get("position", 0), 1)} for r in queries[:12]],
    }


def ga4_block(token):
    url = f"https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY_ID}:runReport"

    def rows(body):
        c, res = call(url, token, body)
        if c != 200:
            return [{"_error": f"{c}: {json.dumps(res)[:200]}"}]
        dims = [h["name"] for h in res.get("dimensionHeaders", [])]
        mets = [h["name"] for h in res.get("metricHeaders", [])]
        out = []
        for r in res.get("rows", []):
            o = {}
            for i, v in enumerate(r.get("dimensionValues", [])):
                o[dims[i]] = v["value"]
            for i, v in enumerate(r.get("metricValues", [])):
                o[mets[i]] = float(v["value"])
            out.append(o)
        return out

    def rng(n):
        return {"startDate": (TODAY - timedelta(days=n)).isoformat()}

    R = [dict(rng(28), endDate=(TODAY - timedelta(days=1)).isoformat(), name="current"),
         dict(rng(56), endDate=(TODAY - timedelta(days=29)).isoformat(), name="previous")]

    def pick(rs, name):
        for r in rs:
            if r.get("dateRange") == name:
                return r
        return rs[0] if rs else {}

    ov = rows({"dateRanges": R, "metrics": [{"name": m} for m in
              ["activeUsers", "newUsers", "sessions", "screenPageViews",
               "engagementRate", "averageSessionDuration", "keyEvents"]]})
    if ov and "_error" in ov[0]:
        return {"error": ov[0]["_error"]}

    en_expr = {"filter": {"fieldName": "pagePath",
               "stringFilter": {"matchType": "BEGINS_WITH", "value": "/en"}}}
    fa = rows({"dateRanges": R, "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}],
               "dimensionFilter": {"notExpression": en_expr}})
    en = rows({"dateRanges": R, "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}],
               "dimensionFilter": en_expr})
    pages = rows({"dateRanges": [R[0]], "dimensions": [{"name": "pagePath"}],
                  "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}],
                  "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}], "limit": 15})
    events = rows({"dateRanges": [R[0]], "dimensions": [{"name": "eventName"}],
                   "metrics": [{"name": "eventCount"}],
                   "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}], "limit": 20})

    mets = ["activeUsers", "newUsers", "sessions", "screenPageViews",
            "engagementRate", "averageSessionDuration", "keyEvents"]
    c_, p_ = pick(ov, "current"), pick(ov, "previous")
    return {
        "overview": {"current": {m: c_.get(m, 0) for m in mets},
                     "previous": {m: p_.get(m, 0) for m in mets}},
        "views": {
            "fa": {"current": pick(fa, "current"), "previous": pick(fa, "previous")},
            "en": {"current": pick(en, "current"), "previous": pick(en, "previous")},
        },
        "top_pages": [{"path": p.get("pagePath"), "views": p.get("screenPageViews"),
                       "users": p.get("activeUsers")} for p in pages if "pagePath" in p],
        "events": [{"name": e.get("eventName"), "count": e.get("eventCount")}
                   for e in events if "eventName" in e],
    }


def main():
    if len(sys.argv) < 2:
        print("usage: google-fetch.py <token-file>")
        sys.exit(1)
    token = open(sys.argv[1]).read().strip().splitlines()[0].strip()
    out = {"generated": TODAY.isoformat(), "property_id": PROPERTY_ID}
    out["ga4"] = ga4_block(token)
    out["gsc"] = gsc_block(token)
    with open("/home/z/my-project/scripts/ga-pull.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    # خلاصهٔ چاپی — بدون توکن
    g = out["ga4"]
    if "error" in g:
        print("GA4 ERROR:", g["error"])
    else:
        c, p = g["overview"]["current"], g["overview"]["previous"]
        print(f"GA4 OK — users {c['activeUsers']:.0f} (prev {p['activeUsers']:.0f}), "
              f"views {c['screenPageViews']:.0f} (prev {p['screenPageViews']:.0f}), "
              f"FA views {g['views']['fa']['current'].get('screenPageViews', 0):.0f} "
              f"(prev {g['views']['fa']['previous'].get('screenPageViews', 0):.0f}), "
              f"EN views {g['views']['en']['current'].get('screenPageViews', 0):.0f} "
              f"(prev {g['views']['en']['previous'].get('screenPageViews', 0):.0f})")
    s = out["gsc"]
    if "error" in s:
        print("GSC ERROR:", s["error"])
    else:
        print(f"GSC OK — property {s['property']}")
        for k in ("current", "previous"):
            a = s[k]["all"]
            print(f"  {k}: clicks {a['clicks']}, imps {a['impressions']}, "
                  f"EN clicks {s[k]['en']['clicks']}, FA clicks {s[k]['fa']['clicks']}")


if __name__ == "__main__":
    main()
