#!/bin/bash
# Covers for 4 business articles (brand style: turquoise/cream, no text)
set -e
COVERS="/home/z/my-project/public/images/covers"

z-ai image -p "Modern tech blog cover illustration, a rising sales chart turning into a glowing rocket, surrounded by floating AI sparkle stars, a handshake silhouette and a small robot assistant holding a megaphone, symbolizing AI boosting sales, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-in-sales.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a friendly robot chat assistant inside a smartphone screen talking with customer speech bubbles, shopping cart icon and glowing AI sparkles around, symbolizing AI sales and support chatbot, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-chatbot-business.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, an online store storefront box on a laptop screen with floating product cards, price tags, glowing recommendation stars and a small AI robot arranging products, symbolizing AI powered e-commerce, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-ecommerce.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a big glowing magnet attracting floating customer avatars and hearts, surrounded by megaphone, envelope icons and AI sparkle stars, symbolizing smart AI marketing and customer attraction, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-marketing.png" -s 1344x768

echo "=== DONE ==="
ls -la "$COVERS"/ai-in-sales.png "$COVERS"/ai-chatbot-business.png "$COVERS"/ai-ecommerce.png "$COVERS"/ai-marketing.png
