#!/usr/bin/env python3
"""تولید خودکار src/data/en/index.ts و src/data/en-slugs.ts برای همهٔ مقاله‌های ترجمه‌شده"""
import json, re
from pathlib import Path

dates = json.load(open("/home/z/my-project/scripts/en-dates.json", encoding="utf-8"))
en_dir = Path("/home/z/my-project/src/data/en")

# فایل‌های موجود را مبنا بگیر (ترتیب = ترتیب مقالات فارسی)
slugs = [s for s in dates if (en_dir / f"{s}.ts").exists()]
assert len(slugs) == 46, f"expected 46, got {len(slugs)}"

# نام export برای فایل‌های پایلوت متفاوت است
PILOTS = {"what-is-ai-beginners-guide": "enWhatIsAi", "phishing-awareness": "enPhishing"}

imports, names = [], []
for s in slugs:
    if s in PILOTS:
        alias, fname = PILOTS[s], s
        imports.append(f'import {{ {alias} }} from "./{fname}";')
    else:
        alias = "en_" + s.replace("-", "_")
        fname = s
        imports.append(f'import {{ EN_ARTICLE as {alias} }} from "./{fname}";')
    names.append(alias)

index_ts = f'''import type {{ Article }} from "@/lib/blog-types";
{chr(10).join(imports)}
import {{ EN_ARTICLE_SLUGS }} from "@/data/en-slugs";

/**
 * مقاله‌های ترجمه‌شدهٔ انگلیسی — ۴۶ مقاله (برابر کامل نسخهٔ فارسی).
 * این فایل به‌صورت خودکار با scripts/build-en-index.py تولید شده؛
 * برای ترجمهٔ جدید فقط فایل را در همین پوشه بساز و اسکریپت را اجرا کن.
 */
export const englishArticles: Article[] = [
{chr(10).join(f"  {n}," for n in names)}
];

export const getEnArticle = (slug: string): Article | undefined =>
  englishArticles.find((a) => a.slug === slug);

/** آیا برای این اسلاگ نسخهٔ انگلیسی وجود دارد؟ */
export const hasEnglishVersion = (slug: string): boolean =>
  EN_ARTICLE_SLUGS.includes(slug);

/** نام انگلیسی دسته‌بندی‌ها */
export const EN_CATEGORY_NAMES: Record<string, string> = {{
  ai: "Artificial Intelligence",
  mobile: "Mobile",
  security: "Security & Privacy",
  software: "Software",
  "web-tools": "Web & Tools",
  programming: "Programming",
  student: "Student",
}};
'''

slugs_ts = f'''// فهرست سبک اسلاگ‌های مقاله‌های انگلیسی — برای استفاده در کامپوننت‌های کلاینت
// (کامپوننت کلاینت نباید کل محتوای مقاله را ایمپورت کند تا باندل سنگین نشود)
export const EN_ARTICLE_SLUGS: string[] = [
{chr(10).join(f'  "{s}",' for s in slugs)}
];
'''

(en_dir / "index.ts").write_text(index_ts, encoding="utf-8")
(Path("/home/z/my-project/src/data") / "en-slugs.ts").write_text(slugs_ts, encoding="utf-8")
print(f"index.ts: {len(imports)} imports | en-slugs.ts: {len(slugs)} slugs")
# چک: هر فایل EN_ARTICLE یا پایلوت export دارد؟
bad = []
for s in slugs:
    txt = (en_dir / f"{s}.ts").read_text(encoding="utf-8")
    if s in PILOTS:
        if f"export const {PILOTS[s]}" not in txt:
            bad.append(s)
    elif "export const EN_ARTICLE" not in txt:
        bad.append(s)
print("export check:", "OK" if not bad else f"MISSING: {bad}")
# چک: اسلاگ داخل فایل با نام فایل یکی باشد
mismatch = [s for s in slugs if f'slug: "{s}"' not in (en_dir / f"{s}.ts").read_text(encoding="utf-8")]
print("slug check:", "OK" if not mismatch else f"MISMATCH: {mismatch}")
