#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""اسمبل سند ۹۰روزه: سه بخش + تزریق فونت Vazirmatn base64 + اصلاحات واژه"""
import base64

BASE = "/home/z/my-project"
parts = [f"{BASE}/scripts/plan-part{i}.html" for i in (1, 2, 3)]
html = "\n".join(open(p, encoding="utf-8").read() for p in parts)

# اصلاحات واژه
fixes = {
    "نیوزلترer": "نیوزلتر",
    "dictation تجربهٔ ۱۰ ابزار": "روایت تجربهٔ ۱۰ ابزار",
    "dictation می‌کنی": "روایت می‌کنی",
    "dictation تجربه و تست ابزارها": "روایت تجربه و تست ابزارها",
    "استفاد از AI": "استفاده از AI",
}
for a, b in fixes.items():
    if a in html:
        html = html.replace(a, b)
        print("fix:", a, "->", b)
if "dictation" in html:  # باقی‌مانده‌ها
    html = html.replace("dictation", "روایت")
    print("fix: dictation (باقی‌مانده) -> روایت")

# تزریق فونت
b64 = base64.b64encode(open(f"{BASE}/download/fonts/Vazirmatn-Variable.woff2", "rb").read()).decode()
html = html.replace("__VAZIR_B64__", b64)
print("font embedded:", len(b64), "chars b64")

out = f"{BASE}/download/takrah-90day-masterplan.html"
open(out, "w", encoding="utf-8").write(html)
print("written:", out, len(html), "chars")
assert "__VAZIR_B64__" not in html and "dictation" not in html and "نیوزلترer" not in html
print("OK")
