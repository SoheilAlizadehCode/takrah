#!/usr/bin/env python3
"""افزودن عنوان فارسی به کاور ai-service-business (با raqm برای شکل‌دهی درست حروف)."""
from PIL import Image, ImageDraw, ImageFont

BASE = "/home/z/my-project/scripts/ai-service-regen.png"
FONT = "/home/z/my-project/scripts/fonts/Vazirmatn-Bold.ttf"
OUT = "/home/z/my-project/scripts/ai-service-final.png"

TITLE = "آژانس هوش مصنوعی تک‌نفره"
BRAND = "تک‌راه | takrah.top"

img = Image.open(BASE).convert("RGBA")
W, H = img.size
draw = ImageDraw.Draw(img)

title_font = ImageFont.truetype(FONT, 54)
brand_font = ImageFont.truetype(FONT, 26)

RTL = dict(direction="rtl", language="fa")

tb = draw.textbbox((0, 0), TITLE, font=title_font, **RTL)
tw, th = tb[2] - tb[0], tb[3] - tb[1]
bb = draw.textbbox((0, 0), BRAND, font=brand_font, **RTL)
bw, bh = bb[2] - bb[0], bb[3] - bb[1]

pad_x, pad_y, gap = 44, 26, 14
pill_w = max(tw, bw) + pad_x * 2
pill_h = th + bh + gap + pad_y * 2
px, py = 40, 44  # گوشه بالا-چپ، آسمون خالی

# قرص شیشه‌ای نیمه‌شفاف
overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
od.rounded_rectangle(
    [px, py, px + pill_w, py + pill_h],
    radius=28,
    fill=(255, 255, 255, 216),
    outline=(20, 120, 130, 90),
    width=2,
)
img = Image.alpha_composite(img, overlay)
draw = ImageDraw.Draw(img)

# متن: تیره روی قرص سفید
tc = (14, 77, 92, 255)      # teal تیره برند
bc = (60, 130, 140, 230)    # teal روشن‌تر برای برند

tx = px + (pill_w - tw) // 2 - tb[0]
ty = py + pad_y - tb[1]
draw.text((tx, ty), TITLE, font=title_font, fill=tc, **RTL)

bx = px + (pill_w - bw) // 2 - bb[0]
by = py + pad_y + th + gap - bb[1]
draw.text((bx, by), BRAND, font=brand_font, fill=bc, **RTL)

img.convert("RGB").save(OUT, "PNG")
print(f"OK pill {pill_w}x{pill_h} at ({px},{py}) -> {OUT}")
