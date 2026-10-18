#!/usr/bin/env python3
"""Split each book into پودمان section files (front matter offset ~10 pages)."""
import re, os

BOOKS = {
    "book1": ("scripts/book-212288.txt", [11, 51, 101, 151, 195, 248]),
    "book2": ("scripts/book-212290.txt", [11, 65, 119, 157, 193, 256]),
}
os.makedirs("scripts/book-sections", exist_ok=True)

for name, (src, starts) in BOOKS.items():
    txt = open(src, encoding="utf-8").read()
    pages = re.split(r"===== PAGE (\d+) =====", txt)
    pg = {}
    for i in range(1, len(pages), 2):
        pg[int(pages[i])] = pages[i + 1]
    for p in range(5):
        lo, hi = starts[p], starts[p + 1]
        body = "\n".join(f"--- p{n} ---\n{pg.get(n, '')}" for n in range(lo, hi))
        with open(f"scripts/book-sections/{name}-podman{p+1}.txt", "w", encoding="utf-8") as f:
            f.write(body)
        print(f"{name}-podman{p+1}.txt: pages {lo}-{hi-1}, {len(body)} chars")
