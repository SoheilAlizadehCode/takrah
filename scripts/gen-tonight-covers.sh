#!/bin/bash
# Covers for tonight's 2 articles (brand style: turquoise/cream, no text)
set -e
COVERS="/home/z/my-project/public/images/covers"

z-ai image -p "Modern tech blog cover illustration, a glowing chat bubble transforming into an organized glowing blueprint with structured gears and magic sparkles, symbolizing turning simple commands into professional AI prompts, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/prompt-engineering.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, several floating stylized picture frames with different artworks inside: mountain painting, abstract art, portrait silhouette, connected by glowing AI sparkles and a paintbrush, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-image-tools.png" -s 1344x768

echo "=== DONE ==="
ls -la "$COVERS"/prompt-engineering.png "$COVERS"/ai-image-tools.png
