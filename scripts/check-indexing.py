#!/usr/bin/env python3
"""Check indexing status of takrah.top URLs via web_search API (site: queries)."""
import json
import subprocess
import time
import urllib.parse

ARTICLES = [
    "what-is-ai-beginners-guide", "chatgpt-pro-tips", "smartphone-buying-guide",
    "battery-life-tips", "strong-password-guide", "phishing-awareness",
    "excel-for-everyday", "free-productivity-tools", "programming-roadmap",
    "build-website-with-wordpress", "make-money-with-ai", "freelancing-with-ai-guide",
    "free-ai-tools", "ai-income-iran", "learn-ai-from-zero",
    "chatgpt-vs-gemini-vs-claude", "ai-income-methods-comparison",
    "prompt-engineering-guide", "ai-image-generators-comparison",
    "ai-video-income", "digital-products-ai-income", "adsense-vs-yektanet",
    "ai-in-sales-guide", "ai-chatbot-business", "ai-ecommerce-guide",
    "ai-marketing-business",
]
EXTRA = ["https://takrah.top", "https://takrah.top/about", "https://takrah.top/contact"]

def search(query: str, num: int = 5):
    args = json.dumps({"query": query, "num": num})
    out = f"/tmp/ws-{abs(hash(query)) % 99999}.json"
    r = subprocess.run(
        ["z-ai", "function", "-n", "web_search", "-a", args, "-o", out],
        capture_output=True, text=True, timeout=60,
        cwd="/home/z/my-project",
    )
    try:
        with open(out) as f:
            return json.load(f)
    except Exception:
        return []

indexed, missing = [], []
for slug in ARTICLES:
    url = f"https://takrah.top/article/{slug}"
    q = f'site:takrah.top {slug}'
    res = search(q)
    hits = [r.get("url", "") for r in res if "takrah.top" in r.get("url", "")]
    exact = url in [h.rstrip("/") for h in hits] or url in hits
    status = "INDEXED" if (hits or exact) else "NOT-FOUND"
    if hits:
        indexed.append(url)
    else:
        missing.append(url)
    detail = hits[0] if hits else "-"
    print(f"{status:10s} {slug:35s} {detail}")
    time.sleep(1)

print("\n===== SUMMARY =====")
print(f"Indexed articles: {len(indexed)}/{len(ARTICLES)}")
print(f"Not found yet: {len(missing)}")
for u in missing:
    print("  -", u)

with open("/home/z/my-project/scripts/indexing-report.json", "w") as f:
    json.dump({"indexed": indexed, "missing": missing}, f, indent=2, ensure_ascii=False)
