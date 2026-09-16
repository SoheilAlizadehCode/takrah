#!/bin/bash
# Generate article cover images with consistent flat illustration style
# Usage: bash generate-covers.sh <start> <end>  (indices 0..10)

mkdir -p /home/z/my-project/public/images/covers
cd /home/z/my-project/public/images/covers

STYLE="modern flat vector illustration style, teal green emerald and warm cream color palette, minimalist clean design, soft shadows, geometric shapes, professional technology blog cover art, no text, no letters, no words, high quality, detailed"

declare -a PROMPTS=(
"friendly robot head with glowing neural network connections and lightbulb, artificial intelligence concept|$STYLE"
"chat message bubbles with sparkle stars and glowing lightbulb, AI assistant conversation concept|$STYLE"
"modern smartphone surrounded by shopping cart, checklist clipboard and magnifying glass, buying guide concept|$STYLE"
"smartphone with large green battery icon charging with lightning bolt and eco leaves|$STYLE"
"large golden padlock with shield and key, digital security and password protection concept|$STYLE"
"fishing hook trying to steal credit card and envelope while strong shield blocks it, cyber scam warning concept|$STYLE"
"spreadsheet grid with colorful charts, bar graph and pie chart and calculator, office software concept|$STYLE"
"laptop surrounded by floating app icons, checkmarks, clock and calendar, productivity concept|$STYLE"
"laptop screen with code brackets and winding roadmap path with milestone flags, learning journey concept|$STYLE"
"website browser window being built with colorful building blocks and puzzle pieces, web design concept|$STYLE"
"open laptop with robot assistant, floating gears network nodes and books, technology learning blog hero|$STYLE"
)

START=${1:-0}
END=${2:-10}

for i in $(seq $START $END); do
  IFS='|' read -r subject style <<< "${PROMPTS[$i]}"
  names=("ai-guide" "chatgpt-tricks" "phone-buying" "battery-life" "strong-password" "phishing" "excel-tutorial" "productivity" "programming-roadmap" "wordpress" "og-hero")
  name=${names[$i]}
  if [ -f "$name.png" ]; then
    echo "SKIP $name (exists)"
    continue
  fi
  echo "Generating $name ..."
  z-ai image -p "$subject, $style" -o "$name.png" -s 1344x768 && echo "OK $name" || echo "FAIL $name"
done
echo "DONE batch $START-$END"
