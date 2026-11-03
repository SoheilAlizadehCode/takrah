# پایپ‌لاین پست ویدیویی تک‌راه 🎬

از لینک یوتیوب → ویدیوی زیرنویس‌دار فارسی + متن آمادهٔ پست تلگرام.

## اجزای این پوشه

| فایل | نقش |
|---|---|
| `pipeline.py` | ارکستراتور: دانلود ← ترجمه ← چسباندن زیرنویس ← ساخت پست |
| `translate.mjs` | ترجمهٔ زیرنویس با هوش مصنوعی + تولید عنوان/خلاصهٔ پست + حالت `fix` |
| `retiming.py` | اصلاح زمان‌بندی: اندازه‌گیری «جلو بودن» از سکوت‌های گفتار + شیفت + حداقل مدت نمایش |
| `qa_sync.py` | QA همگامی با ASR: صدا را پیاده می‌کند و چک می‌کند جمله همزمان با زیرنویس گفته شود |
| `rebuild_final.py` | بازساخت final.mp4 بدون ترجمهٔ مجدد (پس از ویرایش دستی fa.srt) |
| `out/<video-id>/` | خروجی هر ویدیو: `final.mp4`، `post.txt`، `fa.srt`، `en.srt` |

## پیش‌نیازها

```bash
pip install yt-dlp arabic-reshaper python-bidi
# ffmpeg (نسخهٔ ۵ به بالا) و node (برای ترجمه) نصب باشند
```

### مهم: JS Runtime برای دانلود از یوتیوب (deno)

yt-dlp برای حل چالش n-challenge یوتیوب به یک JS runtime نیاز دارد؛ بدون آن
خطای «Only images are available» می‌گیری. بهترین گزینه **deno** است:

```bash
# لینوکس x86_64 — باینری مستقیم:
curl -sL -o /tmp/deno.zip \
  "https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip"
unzip -o -q /tmp/deno.zip -d ~/.local/bin && chmod +x ~/.local/bin/deno
export PATH="$HOME/.local/bin:$PATH"   # موقع اجرای pipeline.py لازم است
```

اگر کوکی هم لازم شد (خط «Sign in to confirm you're not a bot»): با افزونهٔ
Get cookies.txt LOCALLY فایل بگیر و با `--cookies` بده. هرگز فایل کوکی را
کامیت نکن (در .gitignore هست).

## استفاده

```bash
# کامل — همه‌چیز خودکار:
python3 pipeline.py "https://www.youtube.com/watch?v=XXXX"

# اگر یوتیوب خط «Sign in to confirm you're not a bot» داد:
# با افزونهٔ Get cookies.txt LOCALLY از مرورگرت cookies.txt بگیر و:
python3 pipeline.py "https://www.youtube.com/watch?v=XXXX" --cookies cookies.txt

# فقط دانلود (وقتی ترجمه را سیستم دیگری انجام می‌دهد):
python3 pipeline.py "<لینک>" --download-only

# تست سریع روی ۶۰ ثانیهٔ اول:
python3 pipeline.py "<لینک>" --limit-seconds 60
```

## اصلاح زیرنویس بعد از ترجمه (بدون ترجمهٔ مجدد)

```bash
# ۱) خطوط ترجمه‌نشده (انگلیسی‌مانده) پیدا و ترجمه می‌شوند:
node translate.mjs fix out/<id>/en.srt out/<id>/fa.srt

# ۲) زمان‌بندی: زیرنویس یوتیوب ~۰/۳-۰/۸ ثانیه جلوتر از گفتار است؛
#    اندازه‌گیری خودکار از سکوت‌های گفتار + شیفت + حداقل ۲ ثانیه نمایش:
python3 retiming.py out/<id>/fa.srt --video out/<id>/source.mp4
#    یا عدد دستی:
python3 retiming.py out/<id>/fa.srt --offset 0.4

# ۳) بازساخت ویدیو (preset/crf اختیاری — در سندباکسِ ۲ هسته‌ای veryfast ~۲ دقیقه):
python3 rebuild_final.py veryfast 23

# ۴) QA خودکار همگامی (۶ نقطه با ASR):
python3 qa_sync.py
```

درس‌های QA ویدیوی E3xKmcHBOzY:
- یک کیو انگلیسی‌مانده (#۳۰) — علت: شکست یک chunk ترجمه؛ حالت `fix` این را درست می‌کند.
- مترجم گاهی کاراکتر CJK هالوسینیت می‌کند («صبح起来» بود!) — بعد از هر ترجمه rg کن: `rg "[\x{4e00}-\x{9fff}]" fa.srt`
- افکت‌های ffmpeg `silencedetect` و انکود را همیشه با `-nostdin` و تایم‌اوت جدا اجرا کن.

## نکتهٔ فنی مهم (bidi فارسی)

libass با اینکه fribidi دارد، متن فارسی را درست مرتب نمی‌کند و حروف
برعکس رندر می‌شوند. برای همین `pipeline.py` قبل از چسباندن، متن را با
`arabic-reshaper` + `python-bidi` به «ترتیب دیداری» تبدیل می‌کند و فونت
**وزیرمتن** (که فرم‌های presentation دارد) از پوشهٔ `scripts/fonts`
استفاده می‌شود. فایل `fa-visual.srt` فقط برای رندر است؛ برای ویرایش،
همیشه `fa.srt` را ویرایش کن.

## نکتهٔ کپی‌رایت ⚠️

ویدیو متعلق به سازندهٔ اصلی است. در پست همیشه اعتبار منبع و لینک اصلی
می‌آید (خود `post.txt` این کار را می‌کند)، ویدیوهای کوتاه‌تر انتخاب کن،
و اگر سازنده‌ای اعتراض کرد فوراً پست را حذف کن.
