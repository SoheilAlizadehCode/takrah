#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Takrah backlink targets — Persian RTL xlsx (20 sites + 4-week action plan)."""
import sys, os
XLSX_SKILL_DIR = "/home/z/my-project/skills/xlsx"
for sub in [XLSX_SKILL_DIR, os.path.join(XLSX_SKILL_DIR, "templates")]:
    if sub not in sys.path:
        sys.path.insert(0, sub)
import base
base.use_palette_explicit("bottega")   # dark green — closest to Takrah teal brand
base.FONT_NAME = "Tahoma"              # Persian: universal Arabic-script font
base.HEADER_BOLD = True

from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

OUT = "/home/z/my-project/download/takrah-backlink-targets.xlsx"

SITES = [
    ["۱", "ویرگول", "virgool.io", "پلتفرم انتشار مقاله (میانم فارسی)", "انتشار مقاله با لینک به تک‌راه", "رایگان", "★ بالاترین", "هر مقاله‌ی سایت را بازنویسی کوتاه کن (۴۰۰ کلمه) و با لینک مقاله اصلی منتشر کن؛ پربخواننده‌ترین بلاگ‌پلتفرم فارسی"],
    ["۲", "همیار وردپرس", "hamyarwp.com", "وردپرس و سئو", "پست مهمان (صفحه‌ی رسمی پذیرش دارد)", "رایگان", "★ بالاترین", "صفحه «پذیرش پست مهمان» را بخوان، قوانین را رعایت کن و مقاله‌ی «سایت‌سازی با AI» را پیشنهاد بده"],
    ["۳", "سخن", "sokhan.ai", "هوش مصنوعی فارسی", "پست مهمان / معرفی ابزارها", "رایگان", "★ بالاترین", "دقیقاً هم‌حوزه‌ی ماست؛ ایمیلی با پیشنهاد ۳ سوژه‌ی تازه بفرست (ایجنت‌ها، وایب کدینگ، دایپ‌فیک)"],
    ["۴", "تکنا نیوز", "techna.news", "اخبار هوش مصنوعی", "معرفی ابزار و مقاله مهمان", "رایگان", "★ بالاترین", "سایت خبری تخصصی AI؛ پیشنهاد تحلیل خبری یا معرفی ابزارهای رایگان بده"],
    ["۵", "همراه آکادمی", "hamrah.academy/blog", "آموزش ابزارهای AI", "پست مهمان / معرفی مقالات", "رایگان", "★ بالا", "بلاگش ابزارهای AI را فعال معرفی می‌کند؛ پیشنهاد مقاله‌ی مهمان با داده‌های اختصاصی بده"],
    ["۶", "راست‌چین", "rtl-theme.com/blog", "قالب وردپرس و سئو", "پست مهمان / رپورتاژ", "تماس اولیه رایگان", "★ بالا", "بلاگ فعال با مخاطب توسعه‌دهنده؛ سوژه‌ی «ساخت سایت با وایب کدینگ» جذابش است"],
    ["۷", "ویکی‌دمی", "wikidemy.ir", "دیجیتال مارکتینگ و سئو", "پست مهمان", "رایگان", "بالا", "لیست‌های بک‌لینک رایگان هم منتشر می‌کند؛ سوژه‌ی افیلیت مارکتینگ برایش بفرست"],
    ["۸", "بلاگ فرادرس", "blog.faradars.org", "آموزش آنلاین", "پست مهمان (سخت‌گیر)", "رایگان", "بالا", "اعتبار بالا؛ مقاله‌ی عمیق و آماری بده (مثلاً مقایسه‌ی مدل‌های زبانی)؛ لینک بده softly"],
    ["۹", "تریبون", "triboon.net", "دیجیتال مارکتینگ", "پست مهمان", "رایگان", "متوسط", "خودش درباره‌ی پست مهمان مطلب نوشته یعنی می‌پذیرد؛ با سوژه‌ی بازاریابی با AI پیشنهاد بده"],
    ["۱۰", "جت‌سئو", "jetseo.ir", "سئو", "پست مهمان", "رایگان", "متوسط", "سوژه‌های سئوی محتوایی و رپورتاژ؛ مقاله‌ی «بک‌لینک قانونی» ما منبع خوبی است"],
    ["۱۱", "وب‌وان", "webone.co", "دیجیتال مارکتینگ", "پست مهمان", "رایگان", "متوسط", "راهنمای Guest Posting دارد؛ با کیس‌استادی واقعی تک‌راه پیشنهاد بده"],
    ["۱۲", "پیشگام ویرا", "pishgamvira.com", "هاستینگ و تولید محتوا", "پست مهمان", "رایگان", "متوسط", "بلاگ پرتولید؛ سوژه‌ی «امنیت سایت» یا «هوش مصنوعی برای وردپرس» بده"],
    ["۱۳", "کارینو وب", "karinoweb.ir", "وب و وبلاگ‌نویسی", "پست مهمان", "رایگان", "متوسط", "درباره‌ی وبلاگ‌های فارسی می‌نویسد؛ معرفی تک‌راه به‌عنوان پروژه‌ی موفق را پیشنهاد بده"],
    ["۱۴", "وینت", "wenet.website", "آژانس تولید محتوا AI", "پست مهمان", "رایگان", "متوسط", "هم‌حوزه‌ی تولید محتوا با AI؛ سوژه‌ی مقایسه‌ی ابزارها جذابش است"],
    ["۱۵", "سئو لب", "seolab.ir", "سئو و لینک‌سازی", "ثبت در لیست‌های لینک‌سازی رایگان", "رایگان", "★ بالا", "لیست‌های «لینک‌سازی رایگان» منتشر می‌کند؛ کل لیستش را هم برای پست‌های بعدی بیرون بکش"],
    ["۱۶", "سل‌فری", "sellfree.ir", "آگهی رایگان", "ثبت آگهی معرفی سایت", "رایگان", "فوری", "همین امروز ثبت کن؛ آگهی «وبلاگ آموزشی رایگان هوش مصنوعی» با لینک"],
    ["۱۷", "آگهی‌نو", "adsinoo.com", "آگهی رایگان و سئو", "ثبت آگهی رایگان", "رایگان", "فوری", "ثبت آگهی با متن کوتاه و لینک؛ ۱۰ دقیقه کار"],
    ["۱۸", "رایا مارکتینگ", "rayamarketing.com", "آژانس سئو", "پست مهمان / ورود به لیست وبلاگ‌ها", "تماس", "متوسط", "لیست «۴۵ وبلاگ پست مهمان» دارد؛ قدم اول: برو تو لیستش، قدم دوم: پیشنهاد پست مهمان"],
    ["۱۹", "زومیت", "zoomit.ir", "رسانه تکنولوژی شماره ۱", "رپورتاژ آگهی (پولی)", "پولی - گران", "بعد از درآمد", "تاثیرگذارترین دامنه‌ی فارسی؛ برای وقتی که اولین کمیسیون‌ها آمد؛ فرم در صفحه رپورتاژ"],
    ["۲۰", "دیجیاتو", "digiato.com", "رسانه تکنولوژی", "رپورتاژ آگهی (پولی)", "پولی", "بعد از درآمد", "گزینه‌ی دوم رپورتاژ؛ از واسطه‌ها (reportaj.ir) هم می‌شود خرید"],
]

PLAN = [
    ["هفته ۱", "ویرگول + سل‌فری + آگهی‌نو", "۳ لینک رایگان فوری", "دو مقاله بازنویسی‌شده در ویرگول با لینک؛ دو ثبت‌آگهی"],
    ["هفته ۲", "همیار وردپرس + سئو لب", "اولین پست مهمان + ثبت‌ها", "ارسال پیشنهاد مقاله به همیاروردپرس؛ ثبت در لیست سئولب"],
    ["هفته ۳", "سخن + تکنا + همراه آکادمی", "۳ ایمیل پیشنهاد پست مهمان", "ایمیل کوتاه با ۳ سوژه‌ی تازه و لینک نمونه مقاله"],
    ["هفته ۴", "راست‌چین + ویکی‌دمی + تریبون", "۲ ایمیل + پیگیری هفته ۲", "پگیو هفته دوم + ارسال پیشنهادهای تازه"],
]

RULES = [
    "۱. لینک داخل محتوای ارزشمند بگذار، نه در کامنت اسپم — یک مقاله مهمان خوب از ۵۰ کامنت بهتر است.",
    "۲. انکرتکست‌ها را متنوع کن: گاهی نام برند (تک‌راه)، گاهی عنوان مقاله، گاهی URL خام؛ هرگز همان عبارت را تکرار نکن.",
    "۳. سرعت را قربانی طبیعی بودن نکن: هفته‌ای ۲ تا ۴ لینک جدید کافی است؛ جهش ناگهانی لینک مشکوک می‌شود.",
    "۴. هر لینک را در همین فایل ثبت کن (تاریخ، صفحه مقصد، نتیجه) تا بعداً پرفورمنسشان را مقایسه کنی.",
    "۵. لینک‌های nofollow (مثل ویرگول) هم ارزش دارند: ترافیک واقعی و اعتبار برند می‌سازند؛ ترکیب بده.",
    "۶. هرگز از سایت‌های فروش بک‌لینک انبوه نخر — الگوریتم اسپم گوگل سایت را جریمه می‌کند.",
]

wb = Workbook()

# ---------- Sheet 1: سایت‌ها ----------
ws = wb.active
ws.title = "لیست سایت‌ها"
ws.sheet_view.rightToLeft = True

headers = ["ردیف", "نام سایت", "آدرس", "حوزه", "روش گرفتن بک‌لینک", "هزینه", "اولویت", "اقدام عملی پیشنهادی"]
last_col = len(headers) + 1  # B..I
base.setup_sheet(ws, title="هدف‌های بک‌لینک تک‌راه — ۲۰ سایت فارسی تاییدشده", last_col=last_col)

for col_idx, h in enumerate(headers, start=2):
    ws.cell(row=4, column=col_idx, value=h)
base.style_header_row(ws, row_num=4, col_start=2, col_end=last_col)

for i, row in enumerate(SITES):
    rn = 5 + i
    for ci, v in enumerate(row, start=2):
        ws.cell(row=rn, column=ci, value=v)
    base.style_data_row(ws, row_num=rn, col_start=2, col_end=last_col, row_index=i)
    # priority column highlight
    pr = ws.cell(row=rn, column=8)
    if "بالاترین" in str(pr.value) or "فوری" in str(pr.value):
        pr.font = Font(name=base.FONT_NAME, size=11, bold=True, color=base.ACCENT_POSITIVE)

note_row = 5 + len(SITES) + 2
ws.cell(row=note_row, column=2, value="یادداشت: اولویت‌های ستاره‌دار از همین هفته شروع شوند؛ رپورتاژهای پولی (زومیت/دیجیاتو) فقط بعد از اولین درآمد افیلیت.")
ws.cell(row=note_row, column=2).font = base.font_caption()
ws.cell(row=note_row + 1, column=2, value="تهیه‌شده در مهر ۱۴۰۵ برای takrah.top — قبل از هر تماس، صفحه همکاری/تماس همان سایت را یک‌بار چک کن.")
ws.cell(row=note_row + 1, column=2).font = base.font_caption()

widths = {"A": 3, "B": 7, "C": 16, "D": 18, "E": 22, "F": 30, "G": 15, "H": 13, "I": 52}
for col, w in widths.items():
    ws.column_dimensions[col].width = w
ws.freeze_panes = "C5"

# ---------- Sheet 2: برنامه اجرا ----------
ws2 = wb.create_sheet("برنامه ۴ هفته و قوانین")
ws2.sheet_view.rightToLeft = True
h2 = ["هفته", "هدف‌ها", "خروجی", "اقدام‌ها"]
last2 = len(h2) + 1
base.setup_sheet(ws2, title="برنامه‌ی اجرایی ۴ هفته‌ی اول", last_col=last2)
for ci, h in enumerate(h2, start=2):
    ws2.cell(row=4, column=ci, value=h)
base.style_header_row(ws2, row_num=4, col_start=2, col_end=last2)
for i, row in enumerate(PLAN):
    rn = 5 + i
    for ci, v in enumerate(row, start=2):
        ws2.cell(row=rn, column=ci, value=v)
    base.style_data_row(ws2, row_num=rn, col_start=2, col_end=last2, row_index=i)

r0 = 5 + len(PLAN) + 2
ws2.cell(row=r0, column=2, value="قوانین طلایی بک‌لینک‌سازی امن")
ws2.cell(row=r0, column=2).font = base.font_subheader()
for i, rule in enumerate(RULES):
    cell = ws2.cell(row=r0 + 1 + i, column=2, value=rule)
    cell.font = base.font_body()
    cell.alignment = Alignment(horizontal="right", vertical="center", wrap_text=False)

w2 = {"A": 3, "B": 12, "C": 30, "D": 26, "E": 46}
for col, w in w2.items():
    ws2.column_dimensions[col].width = w

wb.properties.creator = "Z.ai"
wb.save(OUT)
print("saved:", OUT)
