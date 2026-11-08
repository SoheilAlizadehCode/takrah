#!/usr/bin/env python3
"""Extract readable text from the 90-day masterplan HTML (skip CSS/base64 fonts)."""
import re, html, sys

src = open('/home/z/my-project/tool-results/read_1794006551032_0d1c8431542d.txt', encoding='utf-8').read()
# strip the persisted-output wrapper lines if present
m = re.search(r'<!DOCTYPE html>.*</html>', src, re.S)
doc = m.group(0) if m else src
# drop style/script blocks
doc = re.sub(r'<style.*?</style>', ' ', doc, flags=re.S)
doc = re.sub(r'<script.*?</script>', ' ', doc, flags=re.S)
# block-level tags -> newlines
doc = re.sub(r'</(h1|h2|h3|h4|p|li|tr|div|section|table|thead|tbody)>', '\n', doc)
doc = re.sub(r'<br\s*/?>', '\n', doc)
doc = re.sub(r'<td[^>]*>', ' | ', doc)
doc = re.sub(r'<[^>]+>', ' ', doc)
doc = html.unescape(doc)
lines = [re.sub(r'[ \t\u200c]*\|[\s|]*', ' | ', re.sub(r'\s+', ' ', l)).strip() for l in doc.split('\n')]
lines = [l for l in lines if l and l != '|']
text = '\n'.join(lines)
out = '/home/z/my-project/scripts/plan-text.txt'
open(out, 'w', encoding='utf-8').write(text)
print(f'lines: {len(lines)}, chars: {len(text)} -> {out}')
