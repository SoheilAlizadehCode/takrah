#!/bin/bash
# Generate covers for 2 comparison articles (brand style: turquoise/cream, no text)

set -e
COVERS="/home/z/my-project/public/images/covers"

# Cover 1: chatbot-comparison.png — three AI assistants facing off
z-ai image -p "Modern tech blog cover illustration, three glowing AI assistant characters side by side in a friendly versus comparison layout, each with different personality: one glowing orb, one friendly robot face, one elegant hologram silhouette, VS lightning spark between them, turquoise teal and cream color palette, soft gradient background, flat modern vector illustration style, clean composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/chatbot-comparison.png" -s 1344x768

# Cover 2: ai-income-comparison.png — multiple paths leading to different income outcomes
z-ai image -p "Modern tech blog cover illustration, five diverging paths roads starting from one point at bottom leading upward to different glowing destinations: coins, growth chart arrow, shopping bag, graduation cap and gear icons, teal turquoise and warm cream color palette, soft gradient sky background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-income-comparison.png" -s 1344x768

echo "=== DONE ==="
ls -la "$COVERS"/chatbot-comparison.png "$COVERS"/ai-income-comparison.png
