#!/bin/bash
# Covers for 3 Python tutorial articles (brand style: turquoise/cream, no text)
set -e
COVERS="/home/z/my-project/public/images/covers"

z-ai image -p "Modern tech blog cover illustration, a friendly smiling python snake coiled around a laptop screen showing colorful code blocks and a play button, floating learning path dots connecting milestones like a treasure map, graduation cap, symbolizing learning python programming from zero, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/learn-python-zero.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a small robot arm on a laptop automatically sorting emails into folders, gears turning, clock with clock hands spinning, folder icons moving on conveyor belt lines, coins floating, symbolizing python automation scripts saving time and making money, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/python-automation.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a glowing neural network brain connected by circuit lines to a python snake logo on a laptop, floating chart bubbles and lightbulb icons, small robot head, symbolizing python for artificial intelligence and machine learning, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/python-for-ai.png" -s 1344x768

echo "=== DONE ==="
ls -la "$COVERS"/learn-python-zero.png "$COVERS"/python-automation.png "$COVERS"/python-for-ai.png