# راهنمای راه‌اندازی «آوای اینستاگرام» — منشی هوشمند دایرکت و کامنت

> آوا روی اینستاگرام همان مغز تلگرام است: گوش (Whisper) ← مغز (GLM-4.5-Flash) ← صدا (دلارا).
> دو قابلیت: **منشی دایرکت** (متن + ویس) و **کامنت→دایرکت** (کلمه‌کلید → دایرکت خودکار).
> وبهوک: `/api/instagram/webhook` | شبیه‌ساز بدون متا: `/api/instagram/simulate`

---

## ۰) معماری در یک نگاه

- **مسیر رسمی ۱ (پیش‌فرض ما):** «Instagram API with Instagram Login» → `graph.instagram.com`
  توکن مستقیم از اینستاگرام می‌آید و **نیازی به پیج فیسبوک نیست.**
- **مسیر رسمی ۲ (کلاسیک):** Messenger Platform → `graph.facebook.com` (توکن پیج فیسبوک).
  اگر روزی برای مشتری‌ای لازم شد، فقط دو متغیر را عوض کن؛ کد یکی است.
- **پنجره‌ی مجاز ارسال:** جواب به هر دایرکت تا **۲۴ ساعت** بعد از آخرین پیام کاربر آزاد است.
- **کامنت→دایرکت:** روی هر کامنت فقط **یک پیام خصوصی** ممکن است (تا ۷ روز) — «Private Reply» رسمی متا.

---

## ۱) گام اول — تبدیل پیج اینستاگرام به Business (۵ دقیقه)

1. اینستاگرام → پروفایل → منوی بالا → **Settings and privacy**
2. **Account type and tools → Switch to professional account** → **Business**
3. دسته‌بندی را انتخاب کن (مثلاً «Digital creator» یا حوزه‌ی کسب‌وکار) و اطلاعات تماس را کامل کن.
4. بعداً در همین مسیر می‌توانی ببینی: صفحه‌ات الان **Professional/Business** است.

> ⚠️ فقط پیج Professional (Business) می‌تواند به API وصل شود. صفحه‌ی معمولی کار نمی‌کند.

## ۲) گام دوم — ساخت اپ در متا (با VPN، حدود ۱۵ دقیقه)

از ایران همه‌ی آدرس‌های meta.com را **با VPN** باز کن (فقط برای تنظیمات؛ سرور ما در Vercel خارج از ایران است و مشکلی ندارد).

1. برو به [developers.facebook.com/apps](https://developers.facebook.com/apps) → **Create App**
   - Use case: **Other** → App type: **Business** → نام دلخواه (مثلاً `Takrah Ava`) → Create
2. توی صفحه‌ی اپ، از **Add products** محصول **Instagram** را اضافه کن.
3. به **Instagram → API setup with Instagram login** برو:
   - بخش **Add accounts**: با اکانت اینستاگرام Business خودت لاگین کن و دسترسی‌ها را تأیید کن.
   - بخش **Generate access token**: توکن را **کپی کن** (همان `INSTAGRAM_ACCESS_TOKEN` ما).
4. از **App settings → Basic**: **App secret** را کپی کن (همان `INSTAGRAM_APP_SECRET`).

> 💡 توکن این مسیر معمولاً ~۶۰ روز اعتبار دارد؛ قبل از انقضا از همان صفحه دوباره Generate کن.
> (برای مشتری‌های واقعی بعداً فرآیند App Review و توکن دائمی System User را می‌رویم — فعلاً برای پیج خودت لازم نیست.)

## ۳) گام سوم — متغیرهای Vercel

Vercel → Project → Settings → Environment Variables (Production + Preview):

| متغیر | الزامی؟ | مقدار |
|---|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | ✅ بله | توکن بخش ۲ |
| `INSTAGRAM_VERIFY_TOKEN` | ✅ بله | یک رشته‌ی تصادفی که خودت می‌سازی: `openssl rand -hex 16` |
| `INSTAGRAM_APP_SECRET` | توصیه‌شده | App secret بخش ۲ (امنیت وبهوک) |
| `INSTAGRAM_USER_ID` | اختیاری | آی‌دی پیج (پروب خودش نشانت می‌دهد) |
| `INSTAGRAM_SYSTEM_PROMPT` | اختیاری | شخصیت و اطلاعات کسب‌وکار آوا (قیمت‌ها، آدرس و…) |
| `INSTAGRAM_COMMENT_KEYWORDS` | اختیاری | پیش‌فرض: `قیمت,هزینه,تعرفه,نرخ,چند` |
| `INSTAGRAM_PUBLIC_REPLY` | اختیاری | متن پاسخ عمومی زیر کامنت |
| `IG_GRAPH_BASE` / `IG_GRAPH_VERSION` | اختیاری | پیش‌فرض: `graph.instagram.com` / `v26.0` |

بعد از اضافه‌کردن، **Redeploy** بگیر (تغییر متغیر بدون دیپلوی اعمال نمی‌شود).

## ۴) گام چهارم — تست اتصال (بدون متا)

```
GET https://takrah.top/api/telegram/ai-diag?key=<SECRET>&ig=1
```

پاسخ سالم: `"ok":true` و `username` پیجت. اگر `configured:false` بود یعنی توکن ست نشده؛
اگر خطای گراف بود، پیام خطا نمایش داده می‌شود.

## ۵) گام پنجم — وصل‌کردن وبهوک در داشبورد متا

1. داشبورد اپ → **Instagram → API setup with Instagram login** (یا Webhooks)
2. **Webhooks → Configure**:
   - Callback URL: `https://takrah.top/api/instagram/webhook`
   - Verify token: همان مقدار `INSTAGRAM_VERIFY_TOKEN`
   - **Verify and save** — باید سبز شود (GET ما challenge را جواب می‌دهد)
3. روی همان صفحه دکمه‌ی **Webhook fields → Subscribe**: تیک این فیلدها:
   - `messages` ← دایرکت‌ها
   - `messaging_postbacks`
   - `comments` ← کامنت‌ها (برای کامنت→دایرکت)

## ۶) گام ششم — تست واقعی

1. از یک اکانت دیگر به پیجت **دایرکت بده** («سلام، قیمت چطوریه؟») → آوا باید متن جواب بدهد.
2. **ویس بفرست** → آوا می‌شنود (Whisper) و جواب متنی + ویس دلارا برمی‌گرداند.
3. زیر یک پست **کامنت کن: «قیمت چنده؟»** → آوا زیرش عمومی جواب می‌دهد + دایرکت خصوصی می‌فرستد.
4. رویدادها را ببین: `GET /api/telegram/ai-diag?key=<SECRET>&last=1` → رویدادهای `ig_msg` / `ig_voice` / `ig_comment`.

## ۷) تست بدون متا (شبیه‌ساز — همین الان قابل استفاده است)

تا وقتی اپ متا آماده نیست، کل زنجیره‌ی AI را با شبیه‌ساز تست کن:

```bash
# دایرکت متنی
curl -X POST "https://takrah.top/api/instagram/simulate?key=<SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"text":"سلام، برای نوبت باید چیکار کنم؟"}'

# کامنت
curl -X POST "https://takrah.top/api/instagram/simulate?key=<SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"comment_text":"قیمت چنده؟"}'

# ویس (base64 فایل صوتی)
curl -X POST "https://takrah.top/api/instagram/simulate?key=<SECRET>&ext=ogg" \
  -H "Content-Type: application/json" \
  -d '{"voice_base64":"<BASE64>"}'
```

---

## ۸) نکات و محدودیت‌های رسمی متا

- **پنجره‌ی ۲۴ ساعته:** پیام‌های خوش‌آمد/تبلیغاتی آزاد نیستند؛ فقط پاسخ به کاربر.
- **Private Reply:** روی هر کامنت فقط یک دایرکت؛ برای ادامه، کاربر باید در دایرکت جواب دهد.
- **سرعت:** وبهوک متا انتظار پاسخ سریع دارد؛ ما همیشه ۲۰۰ برمی‌گردانیم و جواب تکراری با `ig:seen` حذف می‌شود.
- **ریسک بلاک صفر:** چون API رسمی است، پیج‌ات هیچ ریسکی ندارد (برخلاف روش‌های غیررسمی).
- **حریم خصوصی:** جواب‌ها از LLM زدات می‌گذرد؛ داده‌ی حساس مشتری را در پرامپت آوا نگذار.

## ۹) چک‌لیست سریع

- [ ] پیج اینستاگرام Business شد
- [ ] اپ متا ساخته شد + توکن و App secret گرفته شد
- [ ] متغیرها در Vercel ست شد + Redeploy
- [ ] پروب `&ig=1` سبز شد
- [ ] وبهوک Verify و فیلدهای messages/comments سابسکرایب شد
- [ ] دایرکت تستی جواب آمد (متن + ویس)
- [ ] کامنت «قیمت» → پاسخ عمومی + دایرکت خصوصی
