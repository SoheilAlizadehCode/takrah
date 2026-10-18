#!/usr/bin/env python3
"""افزودن عنوان فارسی به کاورهای بخش دانش‌آموز (با raqm برای شکل‌دهی درست حروف)."""
import os
from PIL import Image, ImageDraw, ImageFont

SRC = "/home/z/my-project/scripts/student-covers"
DST = "/home/z/my-project/public/images/covers"
FONT = "/home/z/my-project/scripts/fonts/Vazirmatn-Bold.ttf"
os.makedirs(DST, exist_ok=True)

RTL = dict(direction="rtl", language="fa")
TITLE_COLOR = (14, 77, 92, 255)     # teal تیره برند
BRAND_COLOR = (60, 130, 140, 230)   # teal روشن‌تر

# (فایل پایه، فایل خروجی، عنوان، زیرنویس)
JOBS = [
    ("book-network-hardware.png",        "book-network-hardware.png",        "نصب و نگهداری تجهیزات شبکه و سخت‌افزار", "کتاب درسی دوازدهم | تک‌راه"),
    ("book-ecommerce-security.png",      "book-ecommerce-security.png",      "تجارت الکترونیک و امنیت شبکه",           "کتاب درسی دوازدهم | تک‌راه"),
    ("network-equipment-installation.png","network-equipment-installation.png","نصب تجهیزات شبکه",                      "پودمان ۱ | دانش‌آموز تک‌راه"),
    ("network-setup-dhcp-dns.png",       "network-setup-dhcp-dns.png",       "راه‌اندازی شبکه: DHCP و DNS",            "پودمان ۲ | دانش‌آموز تک‌راه"),
    ("wireless-network-modem.png",       "wireless-network-modem.png",       "شبکه بی‌سیم و مودم",                     "پودمان ۳ | دانش‌آموز تک‌راه"),
    ("network-management-ad-gpo.png",    "network-management-ad-gpo.png",    "مدیریت متمرکز منابع شبکه",               "پودمان ۴ | دانش‌آموز تک‌راه"),
    ("network-troubleshooting.png",      "network-troubleshooting.png",      "عیب‌یابی شبکه",                           "پودمان ۵ | دانش‌آموز تک‌راه"),
    ("ecommerce-business-idea.png",      "ecommerce-business-idea.png",      "ایجاد کار و کسب الکترونیکی",             "پودمان ۱ | دانش‌آموز تک‌راه"),
    ("online-store-development.png",     "online-store-development.png",     "ساخت فروشگاه اینترنتی و سئو",            "پودمان ۲ | دانش‌آموز تک‌راه"),
    ("mikrotik-router-setup.png",        "mikrotik-router-setup.png",        "راه‌اندازی مسیریاب میکروتیک",            "پودمان ۳ | دانش‌آموز تک‌راه"),
    ("network-security-firewall.png",    "network-security-firewall.png",    "امنیت شبکه و فایروال",                   "پودمان ۴ | دانش‌آموز تک‌راه"),
    ("ip-camera-nvr.png",                "ip-camera-nvr.png",                "دوربین مداربسته و NVR",                  "پودمان ۵ | دانش‌آموز تک‌راه"),
]

MAX_TEXT_W = 860  # حداکثر عرض متن داخل قرص


def fit_font(draw, text, start_size):
    """کاهش اندازه فونت تا وقتی متن داخل حد مجاز شود."""
    size = start_size
    while size > 30:
        f = ImageFont.truetype(FONT, size)
        bb = draw.textbbox((0, 0), text, font=f, **RTL)
        if bb[2] - bb[0] <= MAX_TEXT_W:
            return f, bb
        size -= 2
    f = ImageFont.truetype(FONT, size)
    return f, draw.textbbox((0, 0), text, font=f, **RTL)


for src, out, title, brand in JOBS:
    img = Image.open(os.path.join(SRC, src)).convert("RGBA")
    W, H = img.size
    draw = ImageDraw.Draw(img)

    title_font, tb = fit_font(draw, title, 54)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    brand_font = ImageFont.truetype(FONT, 26)
    bb = draw.textbbox((0, 0), brand, font=brand_font, **RTL)
    bw, bh = bb[2] - bb[0], bb[3] - bb[1]

    pad_x, pad_y, gap = 44, 26, 14
    pill_w = max(tw, bw) + pad_x * 2
    pill_h = th + bh + gap + pad_y * 2
    px, py = 40, 44

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

    tx = px + (pill_w - tw) // 2 - tb[0]
    ty = py + pad_y - tb[1]
    draw.text((tx, ty), title, font=title_font, fill=TITLE_COLOR, **RTL)

    bx = px + (pill_w - bw) // 2 - bb[0]
    by = py + pad_y + th + gap - bb[1]
    draw.text((bx, by), brand, font=brand_font, fill=BRAND_COLOR, **RTL)

    dest = os.path.join(DST, out)
    img.convert("RGB").save(dest, "PNG")
    print(f"OK {out}  pill {pill_w}x{pill_h}")
