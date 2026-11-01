# کاور اینستاگرام برای پست ویدیوی ChatGPT Dots — تک‌راه (نسخهٔ raqm)
# خروجی: download/takrah-dots-cover-feed.png (1080x1350) + takrah-dots-cover-reel.png (1080x1920)
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path

ROOT = Path("/home/z/my-project")
F_BOLD = str(ROOT / "scripts/fonts/Vazirmatn-Bold.ttf")
F_REG = str(ROOT / "scripts/fonts/Vazirmatn-Regular.ttf")

BG = (11, 16, 51)        # سرمه‌ای نیلی تیره (برند تک‌راه)
BG2 = (23, 30, 84)
INDIGO = (79, 93, 255)   # نیلی روشن
CYAN = (34, 211, 238)
WHITE = (255, 255, 255)
SOFT = (196, 202, 232)

RTL = {"direction": "rtl", "language": "fa"}

def glow_dots(draw, xy, r, colors, layers=18):
    x, y = xy
    for i in range(layers, 0, -1):
        rr = r + i * 3
        a = int(90 * (1 - i / layers))
        draw.ellipse([x - rr, y - rr, x + rr, y + rr], fill=colors + (a,))

def make_cover(W, H, out_path):
    # پس‌زمینه گرادیانی
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img, "RGBA")
    for yy in range(H):
        t = yy / H
        d.line([(0, yy), (W, yy)],
               fill=tuple(int(BG[i] + (BG2[i] - BG[i]) * t) for i in range(3)))

    # لکه‌های نور بزرگ محو
    blob = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(blob)
    bd.ellipse([W * 0.62, -H * 0.12, W * 1.35, H * 0.38], fill=INDIGO + (70,))
    bd.ellipse([-W * 0.3, H * 0.78, W * 0.25, H * 1.15], fill=CYAN + (45,))
    blob = blob.filter(ImageFilter.GaussianBlur(120))
    img = Image.alpha_composite(img.convert("RGBA"), blob).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")

    M = int(W * 0.085)  # حاشیه

    # سه نقطهٔ درخشان (موتیف Dots) بالا-چپ
    dots_cx, dots_cy = M + 26, M + 40
    for dx, col in ((0, (255, 107, 107)), (52, (255, 205, 86)), (104, (86, 222, 137))):
        cx = dots_cx + dx
        glow_dots(d, (cx, dots_cy), 10, col, layers=10)
        d.ellipse([cx - 10, dots_cy - 10, cx + 10, dots_cy + 10], fill=col)

    # بج بالای عنوان
    badge_txt = "آموزش ویدیویی + زیرنویس فارسی"
    f_badge = ImageFont.truetype(F_BOLD, int(W * 0.032))
    bw = d.textlength(badge_txt, font=f_badge, **RTL)
    bh = int(W * 0.066)
    bx2, by1 = W - M, M + int(W * 0.075)
    bx1, by2 = int(bx2 - bw - int(W * 0.05)), by1 + bh
    d.rounded_rectangle([bx1, by1, bx2, by2], radius=bh // 2, fill=INDIGO + (38,), outline=CYAN + (200,), width=2)
    d.text(((bx1 + bx2) / 2, by1 + bh / 2), badge_txt, font=f_badge, fill=CYAN,
           anchor="mm", **RTL)

    # خط بالادستی
    overline = "تک‌راه | هوش مصنوعی و درآمد"
    f_over = ImageFont.truetype(F_REG, int(W * 0.030))
    ow = d.textlength(overline, font=f_over, **RTL)
    d.text((W - M - ow, by2 + int(H * 0.038)), overline, font=f_over, fill=SOFT, **RTL)

    # عنوان
    title_lines = ["چت‌جی‌پی‌تی یه", "کامپیوتر ۲۴ ساعته", "داره که کارات رو می‌کنه!"]
    size = int(W * 0.092)
    f_title = ImageFont.truetype(F_BOLD, size)
    y = by2 + int(H * 0.085)
    for i, line in enumerate(title_lines):
        tw = d.textlength(line, font=f_title, **RTL)
        col = WHITE if i < 2 else CYAN
        d.text((W - M - tw, y), line, font=f_title, fill=col, **RTL)
        y += int(size * 1.42)

    # توضیح
    sub = "۵ دقیقه ببین، همون امروز تو کار و درآمدت استفاده کن"
    f_sub = ImageFont.truetype(F_REG, int(W * 0.036))
    y += int(H * 0.018)
    sw = d.textlength(sub, font=f_sub, **RTL)
    d.text((W - M - sw, y), sub, font=f_sub, fill=SOFT, **RTL)

    # دکمهٔ پلی وسط (کارت ویدیو)
    cy = int(H * 0.75)
    pr = int(W * 0.085)
    glow_dots(d, (W // 2, cy), pr - 6, INDIGO, layers=14)
    d.ellipse([W // 2 - pr, cy - pr, W // 2 + pr, cy + pr], fill=INDIGO + (255,))
    tri = int(pr * 0.55)
    d.polygon([(W // 2 - tri // 3, cy - tri), (W // 2 - tri // 3, cy + tri),
               (W // 2 + tri, cy)], fill=WHITE)
    play_txt = "همین حالا تماشا کن"
    f_play = ImageFont.truetype(F_BOLD, int(W * 0.033))
    pw = d.textlength(play_txt, font=f_play, **RTL)
    d.text(((W - pw) / 2, cy + pr + int(H * 0.035)), play_txt, font=f_play, fill=WHITE, anchor="mm", **RTL)

    # نوار پایین: آدرس‌ها
    f_foot = ImageFont.truetype(F_BOLD, int(W * 0.036))
    # بج تلگرام (چپ)
    handle = "t.me/takrahTop"
    hw = d.textlength(handle, font=f_foot)
    fy = H - M - int(W * 0.006)
    pad_x, pad_y = int(W * 0.035), int(W * 0.014)
    box_h = int(W * 0.062)
    d.rounded_rectangle([M, fy - pad_y, M + hw + 2 * pad_x, fy - pad_y + box_h + 2 * pad_y],
                        radius=int((box_h + 2 * pad_y) / 2), fill=INDIGO + (235,))
    d.text((M + pad_x, fy + box_h / 2), handle, font=f_foot, fill=WHITE, anchor="lm")
    # سایت (راست)
    site = "takrah.top"
    sw2 = d.textlength(site, font=f_foot)
    d.text((W - M - sw2, fy + box_h / 2), site, font=f_foot, fill=CYAN, anchor="lm")

    img.save(out_path, quality=95)
    print("saved", out_path, img.size)

make_cover(1080, 1350, str(ROOT / "download/takrah-dots-cover-feed.png"))   # پست فید ۴:۵
make_cover(1080, 1920, str(ROOT / "download/takrah-dots-cover-reel.png"))   # کاور ریلز/استوری ۹:۱۶
