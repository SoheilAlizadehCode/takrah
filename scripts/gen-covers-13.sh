#!/bin/bash
# Covers for 4 trendy articles (brand style: turquoise/cream, no text)
set -e
COVERS="/home/z/my-project/public/images/covers"

z-ai image -p "Modern tech blog cover illustration, several small friendly robots working autonomously at different tasks on a large glowing digital dashboard, one robot checking calendar, one robot sending messages, one robot analyzing charts, connected by flowing data streams lines, symbolizing autonomous AI agents, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-agents.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a person sitting at a laptop with glowing chat bubbles turning into website and app interface blocks floating above the keyboard, magic wand sparkle trail from chat bubble to UI elements, symbolizing building apps with AI natural language, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/vibe-coding.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a glowing musical note and sound waves emerging from a laptop screen, headphones, floating coins and play button icons, small robot DJ mixing music, symbolizing AI music creation and income, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-music-income.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a smartphone screen showing a suspicious face half real and half pixelated glitch effect, magnifying glass revealing fake digital mask, warning shield icon, symbolizing deepfake detection and media literacy, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/deepfake-guide.png" -s 1344x768

echo "=== DONE ==="
ls -la "$COVERS"/ai-agents.png "$COVERS"/vibe-coding.png "$COVERS"/ai-music-income.png "$COVERS"/deepfake-guide.png