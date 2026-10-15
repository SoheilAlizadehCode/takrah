#!/bin/bash
# Covers for 3 affiliate/income articles (brand style: turquoise/cream, no text)
set -e
COVERS="/home/z/my-project/public/images/covers"

z-ai image -p "Modern tech blog cover illustration, three golden coins with shield symbols standing on podiums next to a smartphone showing a trading chart going up, small safe vault with dial, balance scale comparing coins, security lock icons floating, symbolizing comparing Iranian cryptocurrency exchanges by security and fees, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/best-crypto-exchanges.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a happy person sitting at a laptop with glowing network lines connecting to floating coins and gift boxes that flow back to their wallet, referral link chain icons between people avatars, small rocket taking off with coin trail, symbolizing earning commission by recommending products, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/affiliate-marketing.png" -s 1344x768

z-ai image -p "Modern tech blog cover illustration, a confident young entrepreneur handing a glowing open toolbox filled with AI robot assistant, chat bubble icons, image brush and sound wave tools to a small shop owner in front of a cozy store, coins floating upward between them, growth arrow, symbolizing selling AI powered services to businesses, teal turquoise and warm cream color palette, soft gradient background, flat modern vector illustration style, clean balanced composition, landscape 16:9, high quality, detailed, no text no letters" -o "$COVERS/ai-service-business.png" -s 1344x768

echo "=== DONE ==="
ls -la "$COVERS"/best-crypto-exchanges.png "$COVERS"/affiliate-marketing.png "$COVERS"/ai-service-business.png
