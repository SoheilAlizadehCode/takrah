# جایزهٔ رفرال ربات تک‌راه — «چک‌لیست ۳۰ روزهٔ پول درآوردن با پک ۵۰ پرامپت»
# ۳ تصویر ۱۰۸۰×۱۳۵۰ در assets/gated/ — فقط ربات بعد از ۳ دعوت موفق می‌فرستد
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path

ROOT = Path("/home/z/my-project")
F_BOLD = str(ROOT / "scripts/fonts/Vazirmatn-Bold.ttf")
F_REG = str(ROOT / "scripts/fonts/Vazirmatn-Regular.ttf")
OUT = ROOT / "assets/gated"
OUT.mkdir(parents=True, exist_ok=True)

BG = (11, 16, 51)
BG2 = (23, 30, 84)
INDIGO = (79, 93, 255)
CYAN = (34, 211, 238)
WHITE = (255, 255, 255)
SOFT = (196, 202, 232)
GREEN = (86, 222, 137)
RTL = {"direction": "rtl", "language": "fa"}

PAGES = [
    {
        "kicker": "پاداش ویژه · بخش ۱ از ۳",
        "title": "چک‌لیست ۳۰ روزه",
        "sub": "روز ۱ تا ۷ — آماده شدن برای پول",
        "rows": [
            ("روز ۱", "پک ۵۰ پرامپت را کامل ورق بزن؛ فقط «یک» مسیر را انتخاب و قفلش کن"),
            ("روز ۲", "پرامپت ۰۱ را اجرا کن: ۵ خدمت قابل‌فروش از مهارتت دربیار"),
            ("روز ۳", "از آن ۵ تا، یکی را بردار و با پرامپت قیمت‌گذاری، قیمتش را بچین"),
            ("روز ۴", "با پرامپت پیام مشتری‌گیری، یک پیام مستقیم کوتاه و صادقانه بنویس"),
            ("روز ۵", "لیست ۲۰ مشتری بالقوه را با پرامپت‌های مسیر اول بساز"),
            ("روز ۶", "به ۱۰ نفر پیام بده؛ جواب‌ها را یکجا یادداشت کن"),
            ("روز ۷", "جمع‌بندی هفته: کدام جواب آمد؟ پیامت را با واقعیت اصلاح کن"),
        ],
        "file": "bonus-checklist-1.png",
    },
    {
        "kicker": "پاداش ویژه · بخش ۲ از ۳",
        "title": "چک‌لیست ۳۰ روزه",
        "sub": "روز ۸ تا ۱۴ — ساختن دارایی",
        "rows": [
            ("روز ۸", "تقویم محتوایی یک‌ماههٔ پیجت را با پرامپت ۰۸ بساز"),
            ("روز ۹", "سه پست اول را با پرامپت‌های مسیر دوم بنویس و زمان‌بندی کن"),
            ("روز ۱۰", "با پرامپت ایدهٔ محصول، ۱۰ ایدهٔ محصول دیجیتال از تجربه‌ات دربیار"),
            ("روز ۱۱", "بهترین ایده را انتخاب کن و فهرست مطالبش را با AI بچین"),
            ("روز ۱۲", "بخش اول محصول را بساز — امروز فقط ۱ ساعت کار واقعی، بدون تعلل"),
            ("روز ۱۳", "بخش دوم را تمام کن و متن صفحهٔ فروش را با پرامپت بنویس"),
            ("روز ۱۴", "محصول را روی یک پلتفرم ساده بالا بیاور و لینکش را تست کن"),
        ],
        "file": "bonus-checklist-2.png",
    },
    {
        "kicker": "پاداش ویژه · بخش ۳ از ۳",
        "title": "چک‌لیست ۳۰ روزه",
        "sub": "روز ۱۵ تا ۳۰ — فروش و رشد",
        "rows": [
            ("روز ۱۵", "پست فروش اول را منتشر کن؛ لینک را در همه‌جای پروفایلت بگذار"),
            ("روز ۱۶ تا ۱۸", "هر روز: یک محتوای ارزشی + یک دعوت آرام به محصول"),
            ("روز ۱۹", "با پرامپت‌های سئو ۵ کلیدواژهٔ دم‌بلند بردار و یک مقاله بنویس"),
            ("روز ۲۰ تا ۲۲", "سه ویدیوی کوتاه با پرامپت‌های مسیر یوتیوب بساز و منتشر کن"),
            ("روز ۲۳", "با پرامپت روزنامهٔ فریلنسر، برنامهٔ هفتگی کار و درآمدت را بچین"),
            ("روز ۲۴ تا ۲۷", "برای خدمتت ۳ مشتری پیچ کن؛ پیگیری را جدی بگیر"),
            ("روز ۲۸ تا ۳۰", "قیمت‌ها را با دیتای واقعی اصلاح کن و گزارش ۳۰ روزه را بنویس"),
        ],
        "file": "bonus-checklist-3.png",
    },
]


def make_page(page: dict):
    W, H = 1080, 1350
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img, "RGBA")
    for yy in range(H):
        t = yy / H
        d.line([(0, yy), (W, yy)], fill=tuple(int(BG[i] + (BG2[i] - BG[i]) * t) for i in range(3)))
    blob = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(blob)
    bd.ellipse([W * 0.55, -H * 0.1, W * 1.3, H * 0.3], fill=INDIGO + (60,))
    bd.ellipse([-W * 0.25, H * 0.85, W * 0.2, H * 1.2], fill=CYAN + (40,))
    img = Image.alpha_composite(img.convert("RGBA"), blob.filter(ImageFilter.GaussianBlur(110))).convert("RGB")
    d = ImageDraw.Draw(img, "RGBA")
    M = 72

    # کیکر
    f_kick = ImageFont.truetype(F_BOLD, 30)
    kw = d.textlength(page["kicker"], font=f_kick, **RTL)
    d.rounded_rectangle([W - M - kw - 44, M, W - M, M + 52], radius=26, fill=INDIGO + (70,), outline=CYAN + (160,), width=2)
    d.text((W - M - (kw + 44) / 2, M + 26), page["kicker"], font=f_kick, fill=CYAN, anchor="mm", **RTL)

    # عنوان
    f_title = ImageFont.truetype(F_BOLD, 76)
    tw = d.textlength(page["title"], font=f_title, **RTL)
    y = M + 92
    d.text((W - M - tw, y), page["title"], font=f_title, fill=WHITE, **RTL)
    y += 106
    f_sub = ImageFont.truetype(F_BOLD, 40)
    sw = d.textlength(page["sub"], font=f_sub, **RTL)
    d.text((W - M - sw, y), page["sub"], font=f_sub, fill=CYAN, **RTL)
    y += 84

    # ردیف‌ها
    f_day = ImageFont.truetype(F_BOLD, 27)
    f_row = ImageFont.truetype(F_REG, 30)
    row_gap = 26
    for day, text in page["rows"]:
        # ارتفاع ردیف: متن ممکن است دو خط شود
        max_w = W - 2 * M - 150
        words, lines, cur = text.split(), [], ""
        for w in words:
            trial = f"{cur} {w}".strip()
            if d.textlength(trial, font=f_row, **RTL) > max_w and cur:
                lines.append(cur)
                cur = w
            else:
                cur = trial
        if cur:
            lines.append(cur)
        rh = max(52, len(lines) * 42 + 18)
        d.rounded_rectangle([M, y, W - M, y + rh], radius=16, fill=(255, 255, 255, 14))
        # تیک سبز
        d.ellipse([W - M - 46, y + rh / 2 - 15, W - M - 16, y + rh / 2 + 15], fill=GREEN + (255,))
        d.line([(W - M - 39, y + rh / 2 + 1), (W - M - 34, y + rh / 2 + 7)], fill=BG, width=4)
        d.line([(W - M - 34, y + rh / 2 + 7), (W - M - 24, y + rh / 2 - 6)], fill=BG, width=4)
        # روز (سمت چپ کادر)
        dw = d.textlength(day, font=f_day, **RTL)
        d.text((M + 20, y + rh / 2), day, font=f_day, fill=SOFT, anchor="lm", **RTL)
        # متن
        ty = y + (rh - len(lines) * 42) / 2 + 2
        for ln in lines:
            lw = d.textlength(ln, font=f_row, **RTL)
            d.text((W - M - 66 - lw, ty), ln, font=f_row, fill=WHITE, **RTL)
            ty += 42
        y += rh + row_gap

    # فوتر
    f_foot = ImageFont.truetype(F_BOLD, 32)
    handle = "t.me/takrahTop"
    site = "takrah.top"
    note = "از پاداش رفرال ربات تک‌راه"
    nw = d.textlength(note, font=ImageFont.truetype(F_REG, 26), **RTL)
    d.text((W - M - nw, H - M + 4), note, font=ImageFont.truetype(F_REG, 26), fill=SOFT, **RTL)
    hw = d.textlength(handle, font=f_foot)
    d.text((M, H - M), handle, font=f_foot, fill=CYAN)
    d.text((M + hw + 24, H - M), "|", font=f_foot, fill=SOFT)
    d.text((M + hw + 48, H - M), site, font=f_foot, fill=CYAN)

    img.save(OUT / page["file"], quality=95)
    print("saved", OUT / page["file"], f"rows_end_y={y}")


for p in PAGES:
    make_page(p)
