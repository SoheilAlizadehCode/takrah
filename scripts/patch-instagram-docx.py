#!/usr/bin/env python3
"""Post-process takrah docx: patch footer PAGE fields (ROMAN for TOC section, arabic for body), remove empty pgNumType."""
import zipfile, shutil, re, os, sys

SRC = "/home/z/my-project/download/takrah-instagram-launch-kit.docx"
TMP = "/home/z/my-project/scripts/docx-tmp"

def main():
    if os.path.exists(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)
    with zipfile.ZipFile(SRC) as z:
        z.extractall(TMP)

    doc_path = os.path.join(TMP, "word", "document.xml")
    with open(doc_path, encoding="utf-8") as f:
        doc = f.read()

    # 1. Remove empty pgNumType (cover section confusion in WPS)
    doc, n_removed = re.subn(r"<w:pgNumType/>", "", doc)

    # 2. Map sections -> footer rIds. Find all sectPr blocks in order.
    sects = re.findall(r"<w:sectPr[^>]*>.*?</w:sectPr>", doc, re.S)
    footer_fmt = {}  # rId -> roman|arabic
    for i, s in enumerate(sects):
        refs = re.findall(r'<w:footerReference[^>]*r:id="(rId\d+)"', s)
        fmt = None
        if 'w:fmt="upperRoman"' in s:
            fmt = "roman"
        elif 'w:fmt="decimal"' in s:
            fmt = "arabic"
        for rid in refs:
            if fmt:
                footer_fmt[rid] = fmt

    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(doc)

    # 3. Resolve rIds to footer files via rels
    rels_path = os.path.join(TMP, "word", "_rels", "document.xml.rels")
    with open(rels_path, encoding="utf-8") as f:
        rels = f.read()
    rid2file = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="(footer\d+\.xml)"', rels))

    patched = []
    for rid, fmt in footer_fmt.items():
        fname = rid2file.get(rid)
        if not fname:
            continue
        fpath = os.path.join(TMP, "word", fname)
        with open(fpath, encoding="utf-8") as f:
            fx = f.read()
        switch = "ROMAN" if fmt == "roman" else "arabic"
        fx2, n = re.subn(
            r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)",
            rf"\1 PAGE \\* {switch} \\* MERGEFORMAT \2",
            fx,
        )
        if n:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(fx2)
            patched.append(f"{fname} -> {switch} ({n} field)")

    # Repack
    out = SRC
    if os.path.exists(out):
        os.remove(out)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(TMP):
            for file in files:
                full = os.path.join(root, file)
                rel = os.path.relpath(full, TMP)
                z.write(full, rel)
    shutil.rmtree(TMP)
    print(f"pgNumType removed: {n_removed}; footers patched: {patched}")

if __name__ == "__main__":
    sys.exit(main())
