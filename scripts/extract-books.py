#!/usr/bin/env python3
"""Extract full text from the two unique textbook PDFs, per page."""
import fitz
import os

JOBS = [
    ("upload/C212288.pdf", "scripts/book-212288.txt"),
    ("upload/C212290.pdf", "scripts/book-212290.txt"),
]

for src, dst in JOBS:
    doc = fitz.open(src)
    out = []
    for i, page in enumerate(doc):
        text = page.get_text("text")
        out.append(f"\n===== PAGE {i+1} =====\n{text}")
    with open(dst, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"{src}: {len(doc)} pages -> {dst} ({os.path.getsize(dst)} bytes)")
    doc.close()
