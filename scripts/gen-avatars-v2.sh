#!/bin/bash
# Generate 3 new avatar options for @takrahTop Telegram channel
# 1024x1024 square (Telegram crops to circle) — keep key elements centered

set -e
OUT="/home/z/my-project/download"

# Option 1: Premium dark tech — glowing neural brain + luminous path
z-ai image -p "Premium circular logo avatar for AI technology brand, glowing neon turquoise neural network brain made of circuit lines, a luminous glowing path leading toward the brain symbolizing a journey into artificial intelligence, deep dark navy blue background, perfectly centered composition designed for a round profile picture, modern minimalist vector style, vibrant cyan turquoise gradient glow, clean high contrast, reads clearly at small size, high quality, detailed" -o "$OUT/takrah-avatar-v2-dark.png" -s 1024x1024

# Option 2: Minimal flat brand style — turquoise on cream, path turning into arrow
z-ai image -p "Minimalist flat vector logo avatar, stylized winding road path curving upward transforming into a rising arrow with small AI sparkle stars and connected nodes, teal and turquoise colors on soft warm cream background, perfectly centered circular badge composition designed for round profile picture, generous negative space, modern tech branding, geometric clean shapes, reads clearly at small size, high quality" -o "$OUT/takrah-avatar-v2-minimal.png" -s 1024x1024

# Option 3: Cute 3D robot mascot
z-ai image -p "Adorable friendly 3D robot head mascot avatar, glossy turquoise and white rounded body, big expressive glowing cyan eyes, small antenna with a glowing spark on top, subtle circuit patterns, Pixar style 3D render, soft warm cream gradient background, soft studio lighting, perfectly centered head and shoulders composition for round profile picture, cute trustworthy tech mascot, high quality, detailed" -o "$OUT/takrah-avatar-v2-robot.png" -s 1024x1024

echo "=== DONE ==="
ls -la "$OUT"/takrah-avatar-v2-*.png
