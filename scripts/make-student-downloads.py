#!/usr/bin/env python3
# ساخت ۲ فایل PDF هدیه برای بخش دانلود دانش‌آموزی تک‌راه:
#  ۱) نقشه‌راه برنامه‌نویسی برای دانش‌آموزان شبکه و نرم‌افزار (۲ صفحه)
#  ۲) برنامه‌ریز مطالعه هفتگی قابل چاپ (۱ صفحه)
# رندر صفحات با PIL + raqm (فارسی RTL درست) و سپس بسته‌بندی به‌صورت PDF.
from PIL import Image, ImageDraw, ImageFont

FONTS = "/home/z/my-project/scripts/fonts"
OUT = "/home/z/my-project/private-downloads"

W, H = 1240, 1754  # A4 @ 150dpi
TEAL_DARK = (14, 77, 92)
TEAL = (22, 128, 118)
TEAL_SOFT = (232, 244, 242)
CREAM = (253, 248, 240)
INK = (28, 42, 48)
MUTED = (96, 116, 124)
WHITE = (255, 255, 255)
BORDER = (224, 232, 230)

REG = f"{FONTS}/Vazirmatn-Regular.ttf"
BOLD = f"{FONTS}/Vazirmatn-Bold.ttf"
M = 92  # حاشیه

def f(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REG, size)

RTL = dict(direction="rtl", language="fa")

def rtl(d, xy, text, font, fill, anchor="ra"):
    d.text(xy, text, font=font, fill=fill, anchor=anchor, **RTL)

def ltr(d, xy, text, font, fill, anchor="la"):
    d.text(xy, text, font=font, fill=fill, anchor=anchor)

def wrap_rtl(d, text, font, maxw):
    words = text.split()
    lines, cur = [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=font, **RTL) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines

def rtl_wrap(d, x_right, y, text, font, fill, maxw, leading=None):
    """متن RTL چندخطی راست‌چین؛ y پایین‌رفته را برمی‌گرداند."""
    lh = leading or int(font.size * 1.5)
    for ln in wrap_rtl(d, text, font, maxw):
        d.text((x_right, y), ln, font=font, fill=fill, anchor="ra", **RTL)
        y += lh
    return y

def page():
    img = Image.new("RGB", (W, H), CREAM)
    return img, ImageDraw.Draw(img)

def header(d, title, subtitle):
    d.rounded_rectangle([48, 48, W - 48, 262], radius=28, fill=TEAL_DARK)
    rtl(d, (W - 92, 88), title, f(44, True), WHITE)
    rtl_wrap(d, W - 92, 158, subtitle, f(22), (190, 224, 220), W - 2 * M - 140, leading=32)
    d.rounded_rectangle([92, 212, 320, 236], radius=8, fill=TEAL)
    ltr(d, (108, 215), "takrah.top", f(17), WHITE)

def footer(d):
    d.line([92, H - 92, W - 92, H - 92], fill=(210, 222, 220), width=2)
    rtl(d, (W - 92, H - 76), "تک‌راه — مسیر تو به دنیای تکنولوژی", f(19), MUTED)
    ltr(d, (92, H - 76), "takrah.top/student/download", f(17), MUTED)

def step_row(d, y, num, title, desc):
    h = 186
    d.rounded_rectangle([M, y, W - M, y + h], radius=20, fill=WHITE, outline=BORDER, width=2)
    d.rounded_rectangle([M + 20, y + 24, M + 30, y + h - 24], radius=5, fill=TEAL_SOFT)
    cx = W - M - 66
    d.ellipse([cx - 34, y + h / 2 - 34, cx + 34, y + h / 2 + 34], fill=TEAL)
    ltr(d, (cx, y + h / 2), str(num), f(34, True), WHITE, anchor="mm")
    rtl(d, (W - M - 126, y + 22), title, f(28, True), INK)
    rtl_wrap(d, W - M - 126, y + 72, desc, f(21), MUTED, W - 2 * M - 196, leading=32)

# ─── PDF ۱: نقشه‌راه برنامه‌نویسی ─────────────────────────────────
img1, d1 = page()
header(d1, "نقشه‌راه برنامه‌نویسی", "ویژه دانش‌آموزان رشته شبکه و نرم‌افزار رایانه — ۵ مرحله تا اولین پروژه و درآمد")
rtl(d1, (W - M, 306), "اگر این ۵ مرحله را با نظم بروی، قبل از پایان مدرسه یک رزومه واقعی داری؛", f(24), INK)
rtl(d1, (W - M, 350), "نه فقط نمره درس، بلکه مهارتی که بازار کار می‌خرد.", f(24), INK)

steps = [
    ("پایتون را از صفر یاد بگیر",
     "با سری آموزش پایتون تک‌راه شروع کن: روزی ۳۰ دقیقه، برنامه ۳۰ روزه. اول متغیر و شرط، بعد حلقه و تابع؛ هیچ‌چیز را نپر."),
    ("شبکه را عملی تمرین کن",
     "درس‌های کارگاهی کتاب را جدی بگیر: Packet Tracer، پیکربندی مودم و سوییچ، عیب‌یابی. همین کارگاه‌ها سؤال امتحان عملی و بازار کار توست."),
    ("پایه وب را بساز",
     "HTML و CSS را یک هفته‌ای یاد بگیر و بعد با وردپرس یک سایت واقعی راه بینداز؛ آموزش قدم‌به‌قدمش در تک‌راه هست."),
    ("پروژه واقعی انجام بده",
     "برای مدرسه‌ات، مغازه اطراف خانه یا کلاس خودت یک کار واقعی بساز: شبکه کوچک، سایت یا ربات ساده. پروژه = رزومه."),
    ("اولین درآمد را بگیر",
     "با مهارت‌های مرحله ۱ تا ۴ در فریلنسری سفارش بگیر یا خدمات شبکه و سایت به مغازه‌ها بده؛ مقاله‌های درآمد تک‌راه نقشه‌اش را داده."),
]
y = 424
for i, (t, ds) in enumerate(steps, 1):
    step_row(d1, y, i, t, ds)
    y += 214

d1.rounded_rectangle([M, y + 8, W - M, y + 84], radius=16, fill=TEAL_SOFT)
rtl(d1, (W / 2, y + 26), "قانون طلایی: هر روز ۳۰ دقیقه، هفت روز هفته — بهتر از ۵ ساعت یک‌جا و هیچ.", f(22, True), TEAL_DARK, anchor="ma")
footer(d1)

img2, d2 = page()
header(d2, "منابع رایگان و برنامه ۹۰ روزه", "همه لینک‌ها رایگان‌اند و در تک‌راه منتشر شده‌اند")
rtl(d2, (W - M, 306), "منابع رایگان تک‌راه", f(32, True), TEAL_DARK)
resources = [
    ("نقشه راه برنامه‌نویسی از صفر", "takrah.top/article/programming-roadmap"),
    ("یادگیری پایتون از صفر (۳۰ روزه)", "takrah.top/article/learn-python-from-zero"),
    ("اتوماسیون پایتون و کسب درآمد", "takrah.top/article/python-automation-income"),
    ("پایتون برای هوش مصنوعی", "takrah.top/article/python-for-ai-guide"),
    ("ساخت سایت با وردپرس", "takrah.top/article/build-website-with-wordpress"),
]
y = 380
for i, (t, u) in enumerate(resources, 1):
    d2.rounded_rectangle([M, y, W - M, y + 78], radius=14, fill=WHITE, outline=BORDER, width=2)
    rtl(d2, (W - M - 24, y + 14), f"{i}. {t}", f(23, True), INK, anchor="ra")
    ltr(d2, (M + 28, y + 44), u, f(19), TEAL)
    y += 96

y += 26
rtl(d2, (W - M, y), "برنامه ۹۰ روزه", f(32, True), TEAL_DARK)
y += 62
cols = [
    ("ماه اول", "پایتون + شبکه عملی", "روزی ۳۰ دقیقه پایتون + تمرین کارگاه‌های کتاب؛ آخر هفته مرور."),
    ("ماه دوم", "وب + پروژه کوچک", "HTML/CSS و وردپرس؛ ساخت یک سایت واقعی برای خودت."),
    ("ماه سوم", "پروژه + درآمد", "یک پروژه کامل برای کسی دیگر + ثبت نمونه‌کار و شروع فریلنسری."),
]
cw = (W - 2 * M - 32) // 3
for i, (m, t, ds) in enumerate(cols):
    x = W - M - (i + 1) * cw - i * 16
    d2.rounded_rectangle([x, y, x + cw, y + 268], radius=16, fill=WHITE, outline=BORDER, width=2)
    d2.rounded_rectangle([x, y, x + cw, y + 54], radius=16, fill=TEAL)
    d2.rectangle([x, y + 40, x + cw, y + 54], fill=TEAL)
    rtl(d2, (x + cw / 2, y + 10), m, f(24, True), WHITE, anchor="ma")
    rtl(d2, (x + cw / 2, y + 76), t, f(21, True), TEAL_DARK, anchor="ma")
    rtl_wrap(d2, x + cw - 18, y + 118, ds, f(19), MUTED, cw - 36, leading=30)

d2.rounded_rectangle([M, y + 296, W - M, y + 388], radius=16, fill=TEAL_DARK)
rtl(d2, (W / 2, y + 318), "یادت باشد: نمره قبولی هر پودمان حداقل ۱۲ است و این درس ضریب ۸ دارد.", f(22, True), WHITE, anchor="ma")
rtl(d2, (W / 2, y + 352), "اول درس، بعد پروژه — هر دو با هم پیش می‌روند.", f(19), (190, 224, 220), anchor="ma")
footer(d2)

img1.save(f"{OUT}/takrah-programming-roadmap.pdf", "PDF", resolution=150, save_all=True, append_images=[img2])
print("OK takrah-programming-roadmap.pdf")

# ─── PDF ۲: برنامه‌ریز مطالعه هفتگی ──────────────────────────────
img3, d3 = page()
header(d3, "برنامه‌ریز مطالعه هفتگی", "چاپ کن، روی میزت بچسبان و هر شب قبل خواب تیک بزن")

rows = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]
# ستون‌ها از راست به چپ: روز | موضوع مطالعه | ساعت | پیشرفت
day_r, day_l = W - M, W - M - 170
sub_r, sub_l = day_l - 8, M + 270
sat_r, sat_l = sub_l - 8, M + 130
chk_r, chk_l = sat_l - 8, M

ty = 306
d3.rounded_rectangle([M, ty, W - M, ty + 64], radius=14, fill=TEAL)
d3.rectangle([M, ty + 40, W - M, ty + 64], fill=TEAL)
for label, xl, xr in [("روز", day_l, day_r), ("موضوع مطالعه (پودمان/درس)", sub_l, sub_r), ("ساعت", sat_l, sat_r), ("پیشرفت", chk_l, chk_r)]:
    rtl(d3, ((xl + xr) / 2, ty + 10), label, f(21, True), WHITE, anchor="ma")

ry = ty + 64
rh = 92
for i, day in enumerate(rows):
    y0 = ry + i * rh
    d3.rounded_rectangle([M, y0, W - M, y0 + rh], radius=0, fill=WHITE if i % 2 == 0 else (246, 242, 234))
    d3.line([M, y0, W - M, y0], fill=(226, 232, 230), width=2)
    rtl(d3, (day_r - 24, y0 + 30), day, f(22, True), INK)
    # جای نوشتن موضوع و ساعت
    d3.line([sub_r - 20, y0 + rh - 26, sub_l + 20, y0 + rh - 26], fill=(200, 210, 208), width=2)
    d3.line([sat_r - 16, y0 + rh - 26, sat_l + 16, y0 + rh - 26], fill=(200, 210, 208), width=2)
    # چک‌باکس پیشرفت
    d3.rounded_rectangle([chk_l + 28, y0 + 26, chk_l + 64, y0 + 62], radius=8, outline=TEAL, width=3)
d3.line([M, ry + 7 * rh, W - M, ry + 7 * rh], fill=(226, 232, 230), width=2)

ny = ry + 7 * rh + 42
rtl(d3, (W - M, ny), "۴ قانون که نتیجه را ده برابر می‌کند", f(30, True), TEAL_DARK)
tips = [
    ("مرور اسپیس‌د ریپتیشن", "هر پودمان را روز ۱، روز ۳ و روز ۷ مرور کن؛ همین سه مرور کافی است تا در امتحان نمره کامل بگیری."),
    ("تایمر ۲۵ دقیقه‌ای (پومودورو)", "۲۵ دقیقه تمرکز کامل + ۵ دقیقه استراحت؛ گوشی را در اتاق دیگر بگذار."),
    ("اول کارگاه، بعد جزوه", "درس‌های کارگاهی را عملی جلوی کامپیوتر تمرین کن؛ خواندنِ خالی فردا فراموش می‌شود."),
    ("خواب = ذخیره یادگیری", "بعد از مطالعه حداقل ۷ ساعت بخواب؛ مغز همان موقع درس را ذخیره می‌کند."),
]
ty2 = ny + 66
for i, (t, ds) in enumerate(tips):
    y = ty2 + i * 126
    d3.rounded_rectangle([M, y, W - M, y + 112], radius=16, fill=WHITE, outline=BORDER, width=2)
    d3.ellipse([W - M - 70, y + 34, W - M - 24, y + 80], fill=TEAL_SOFT)
    ltr(d3, (W - M - 47, y + 57), str(i + 1), f(26, True), TEAL, anchor="mm")
    rtl(d3, (W - M - 96, y + 16), t, f(23, True), INK)
    rtl_wrap(d3, W - M - 96, y + 56, ds, f(19), MUTED, W - 2 * M - 116, leading=28)
footer(d3)

img3.save(f"{OUT}/takrah-study-planner.pdf", "PDF", resolution=150)
print("OK takrah-study-planner.pdf")
