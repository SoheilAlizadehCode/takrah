#!/usr/bin/env python3
"""استخراج اسلاگ/تاریخ/عنوان مقالات فارسی و تبدیل تاریخ شمسی به میلادی
خروجی: scripts/en-dates.json  (slug -> {"date_en": "...", "fa_date": "...", "file": "...", "title": "..."})
"""
import json, re, subprocess, sys
from pathlib import Path

FA_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")
MONTHS = {"فروردین":1,"اردیبهشت":2,"ارديبهشت":2,"خرداد":3,"تیر":4,"تير":4,"مرداد":5,"امرداد":5,
          "شهریور":6,"شهريور":6,"مهر":7,"آبان":8,"aban":8,"آذر":9,"دی":10,"دي":10,"بهمن":11,"اسفند":12}

try:
    import jdatetime  # type: ignore
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "jdatetime"], check=False)
    try:
        import jdatetime  # type: ignore
    except ImportError:
        jdatetime = None

def to_gregorian(y: int, m: int, d: int) -> str:
    if jdatetime:
        g = jdatetime.date(y, m, d).togregorian()
        return g.strftime("%B %-d, %Y") if sys.platform != "win32" else f"{g.strftime('%B')} {g.day}, {g.year}"
    raise RuntimeError("jdatetime unavailable")

files = sorted(Path("/home/z/my-project/src/data").glob("articles-*.ts"),
               key=lambda p: int(re.search(r"\d+", p.stem).group()))
out: dict[str, dict] = {}
for f in files:
    src = f.read_text(encoding="utf-8")
    # هر بلوک مقاله از slug تا قبل از slug بعدی یا انتهای آرایه
    chunks = re.split(r'(?=\n\s*\{\s*\n\s*slug: ")', src)
    for ch in chunks:
        m = re.search(r'slug: "([^"]+)"', ch)
        if not m:
            continue
        slug = m.group(1)
        dm = re.search(r'date: "([^"]+)"', ch)
        title = re.search(r'title: "([^"]+)"', ch)
        cat = re.search(r'category: "([^"]+)"', ch)
        feat = "featured: true" in ch
        book = re.search(r'book: "([^"]+)"', ch)
        fa_date = dm.group(1) if dm else ""
        date_en = ""
        if fa_date:
            norm = fa_date.translate(FA_DIGITS)
            mm = re.search(r'(\d{1,2})\s+([\u0600-\u06FF]+)\s+(\d{4})', norm)
            if mm:
                d, mon, y = int(mm.group(1)), MONTHS.get(mm.group(2)), int(mm.group(3))
                if mon:
                    date_en = to_gregorian(y, mon, d)
        out[slug] = {"date_en": date_en, "fa_date": fa_date,
                     "file": f.name, "title": title.group(1) if title else "",
                     "category": cat.group(1) if cat else "",
                     "featured": feat, "book": book.group(1) if book else ""}

Path("/home/z/my-project/scripts/en-dates.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
missing = [s for s, v in out.items() if not v["date_en"]]
print(f"total={len(out)}  missing_date={len(missing)}  {missing[:5]}")
for s, v in list(out.items())[:4]:
    print(s, "|", v["fa_date"], "->", v["date_en"], "|", v["file"])
