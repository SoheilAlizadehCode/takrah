#!/bin/bash
# Covers for 3 trending articles (brand style: turquoise/cream, no text)
set -e
COVERS="/home/z/my-project/public/images/covers"

z-ai image -p "Modern tech blog cover illustration, a big glowing video play button inside a film frame, film reel and golden coins transforming into floating video clips and camera, symbolizing earning income from AI generated videos, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-video-income.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, floating digital product boxes: an ebook with glowing pages, a course card, a template grid and a download arrow, surrounded by AI sparkle stars and a shopping bag, symbolizing creating and selling digital products with artificial intelligence, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/digital-products-ai.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, an open laptop showing a website with articles, two streams of golden coins floating above it and a glowing balance scale between them, symbolizing website monetization comparison, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/adsense-vs-yektanet.png" -s 1344x768

echo "=== DONE ==="
ls -la "$COVERS"/ai-video-income.png "$COVERS"/digital-products-ai.png "$COVERS"/adsense-vs-yektanet.png
