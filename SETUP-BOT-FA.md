# راهنمای کامل راه‌اندازی ربات‌ها و هوش مصنوعی تک‌راه

> این راهنما برای راه‌اندازی از صفر روی یک اکانت Vercel تازه نوشته شده است.
> معماری کامل سیستم را در `download/takrah-architecture-map.png` ببینید (یا `public/images/`).

---

## ۱) معماری در یک نگاه

- **بک‌اند:** Next.js روی Vercel (Serverless) — هر ربات یک API Route است:
  - پلن ۲ → `/api/telegram/clinic` (نوبت‌دهی) + `/api/telegram/clinic-reminders` (یادآوری کرونی)
  - پلن ۳ → `/api/telegram/vip` (منشی هوشمند «آوا»: متن + وویس)
  - ربات عمومی سایت → `/api/telegram-bot`
- **دیتابیس:** Upstash Redis (REST) — وضعیت گفتگو، نوبت‌ها، کش، لاگ خطا
- **هوش مصنوعی آوا (همه با پلن رایگان):**
  - گوش (ASR): **Whisper روی Groq** ← فال‌بک ElevenLabs Scribe ← فال‌بک GLM-ASR
  - مغز (LLM): **GLM-4.5-Flash زدات** (رایگان) با retry خودکار
  - صدا (TTS): **Edge Neural فارسی «دلارا»** (رایگان، بدون کلید) ← فال‌بک gTTS ← فال‌بک ElevenLabs
- **یادآوری نوبت:** پیام تلگرام + وویس ضبط‌شده (پیش‌فرض: صدای باندل‌شده‌ی سایت) + تماس تلفنی کاوه‌نگار (اختیاری)

---

## ۲) پیش‌نیازها (اکانت‌های لازم)

| سرویس | برای چه | پلن |
|---|---|---|
| [Vercel](https://vercel.com) | میزبانی سایت و API | رایگان (Hobby) |
| [Upstash](https://upstash.com) | دیتابیس Redis | رایگان (۱۰هزار دستور/روز) |
| [Z.ai](https://z.ai) | مغز آوا (LLM) | رایگان (GLM-4.5-Flash) |
| [Groq](https://console.groq.com) | گوش آوا (Whisper) | رایگان |
| [Telegram](https://t.me/BotFather) | ساخت ربات‌ها | رایگان |
| ElevenLabs (اختیاری) | فال‌بک صدا/گوش | رایگان (ممکن است بلاک شود) |
| کاوه‌نگار (اختیاری) | تماس تلفنی یادآوری | پولی (پرداخت به ازای تماس) |

---

## ۳) متغیرهای محیطی Vercel (قلب راه‌اندازی)

در Vercel → Project → **Settings → Environment Variables** اضافه کنید (برای Production و Preview هر دو):

### تلگرام — ربات‌ها

| متغیر | توضیح | نمونه |
|---|---|---|
| `VIP_BOT_TOKEN` | توکن ربات VIP (آوا) از BotFather | `7123456789:AAH...` |
| `CLINIC_BOT_TOKEN` | توکن ربات کلینیک (پلن ۲) از BotFather | `7234567890:AAE...` |
| `TELEGRAM_BOT_TOKEN` | توکن ربات عمومی سایت (بخش دانشجو) | `7345678901:AAD...` |
| `VIP_WEBHOOK_SECRET` | سکرت وبهوک ربات VIP — رشته‌ی تصادفی دلخواه | `vip-…` |
| `CLINIC_WEBHOOK_SECRET` | سکرت وبهوک ربات کلینیک | `clinic-…` |
| `TELEGRAM_WEBHOOK_SECRET` | سکرت وبهوک ربات عمومی | `site-…` |
| `VIP_ADMIN_CHAT_ID` | چت‌آی‌دی مدیر (ناتیفیکیشن VIP) | `5289089807` |
| `CLINIC_ADMIN_CHAT_ID` | چت‌آی‌دی مدیر (ناتیفیکیشن پلن ۲) | `5289089807` |
| `DIRECTOR_CHAT_ID` | چت‌آی‌دی مدیر ارشد (اختیاری) | `5289089807` |
| `SETUP_KEY` | کلید فراخوانی endpoint ست‌کردن وبهوک | رشته‌ی تصادفی |

> 💡 چت‌آی‌دی خودتان را از [@userinfobot](https://t.me/userinfobot) بگیرید. سکرت‌ها را با `openssl rand -hex 24` بسازید.

### دیتابیس — Upstash Redis

| متغیر | توضیح |
|---|---|
| `UPSTASH_REDIS_REST_URL` | از کنسول Upstash → دیتابیس → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | همان‌جا (توکن REST) |

> بدون این دو، ربات در حالت memory کار می‌کند و بعد از هر ری‌استارت، گفتگوها و نوبت‌ها پاک می‌شوند. **حتماً تنظیم کنید.**

### هوش مصنوعی — آوا

| متغیر | الزامی؟ | توضیح |
|---|---|---|
| `ZAI_API_KEY` | ✅ بله | کلید Z.ai — مغز آوا (پنل z.ai → API Keys) |
| `ZAI_BASE_URL` | پیش‌فرض هست | `https://api.z.ai/api/paas/v4` |
| `ZAI_MODEL` | پیش‌فرض هست | `glm-4.5-flash` (رایگان) |
| `WHISPER_API_KEY` | ✅ برای وویس | کلید Groq (console.groq.com → API Keys) |
| `WHISPER_BASE_URL` | پیش‌فرض هست | `https://api.groq.com/openai/v1` |
| `WHISPER_MODEL` | پیش‌فرض هست | `whisper-large-v3` |
| `TTS_VOICE` | پیش‌فرض هست | `fa-IR-DilaraNeural` (صدای پیش‌فرض آوا) |
| `ELEVENLABS_API_KEY` | اختیاری | فال‌بک صدا/گوش — اگر اکانت Free بلاک شد، حذفش مشکلی ایجاد نمی‌کند |
| `ELEVENLABS_VOICE_ID` / `_TTS_MODEL` / `_STT_MODEL` | اختیاری | سفارشی‌سازی فال‌بک ElevenLabs |
| `VOICE_ASR_URL` / `VOICE_ASR_KEY` / `VOICE_ASR_MODEL` | اختیاری | مسیر سوم ASR (پیش‌فرض: GLM-ASR زدات) |

### یادآوری نوبت‌ها

| متغیر | الزامی؟ | توضیح |
|---|---|---|
| `CRON_SECRET` | توصیه می‌شود | محافظ endpoint کرون؛ در vercel.json زمان‌ها ست است |
| `REMINDER_VOICE_URL` | اختیاری | آدرس وویس دلخواه شما؛ **بدون تنظیم = صدای باندل‌شده‌ی سایت** (`/audio/reminder-voice.ogg` — صدای «دلارا») |
| `KAVENEGAR_API_KEY` | اختیاری | برای تماس تلفنی واقعی یادآوری — از پنل kavenegar.com → Settings → API Key |
| `KAVENEGAR_CALLER` | اختیاری | شماره‌ی خط ارسال تماس (در پنل کاوه‌نگار فعال شده باشد) |

### سایت

| متغیر | توضیح |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | آدرس سایت — پیش‌فرض `https://takrah.top` |
| `NEXT_PUBLIC_GA_ID` | آنالیتیکس گوگل (اختیاری) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | لاگین گوگل بخش دانشجو (اختیاری) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | وریفای سرچ‌کنسول (اختیاری) |

---

## ۴) گام‌به‌گام: ساخت ربات و ست‌کردن وبهوک

1. در تلگرام به [@BotFather](https://t.me/BotFather) پیام بدهید: `/newbot` → اسم و یوزرنیم → توکن را کپی کنید (برای هر ۳ ربات تکرار کنید).
2. توکن‌ها و سکرت‌ها را در Vercel بگذارید (بخش ۳) و صبر کنید دیپلوی تمام شود.
3. وبهوک هر ربات را یک‌بار ست کنید:

```
GET https://takrah.top/api/telegram/setup?key=<SETUP_KEY>&bot=vip
GET https://takrah.top/api/telegram/setup?key=<SETUP_KEY>&bot=clinic
```

4. سلامت هر بخش را چک کنید:

```
GET https://takrah.top/api/telegram/vip        ← وضعیت کلی (ai / voiceAsr / storage)
GET https://takrah.top/api/telegram/clinic
```

پاسخ سالم باید شامل `"storage":"redis"` و `"ai":true` و `"voiceAsr":true` باشد.

---

## ۵) تست زنده‌ی هوش مصنوعی (عیب‌یابی)

همه با کلید سکرت وبهوک (VIP یا کلینیک):

```
# مغز آوا (LLM) — وضعیت و سرعت
GET /api/telegram/ai-diag?key=<SECRET>

# گوینده‌ی صدا (TTS) — باید bytes > 0 باشد
GET /api/telegram/ai-diag?key=<SECRET>&tts=1

# گوش آوا (ASR) — تست با فایل صوتی base64
POST /api/telegram/ai-diag?key=<SECRET>&provider=whisper
Body: {"file_base64": "..."}

# آخرین خطاهای واقعی ربات + ۲۰ رویداد آخر
GET /api/telegram/ai-diag?key=<SECRET>&last=1

# اتصال کاوه‌نگار — فقط اعتبارسنجی کلید (بدون تماس و بدون هزینه)
GET /api/telegram/ai-diag?key=<SECRET>&kavenegar=1
```

کلیدهای دیباگ در Redis: `dbg:llm` (مغز)، `dbg:voice` (گوش)، `dbg:tts` (صدا).

---

## ۶) یادآوری نوبت‌ها (کرون وریسل)

زمان‌بندی در `vercel.json` ست شده:

| مسیر | زمان (UTC) | معادل تهران |
|---|---|---|
| `/api/telegram/clinic-reminders` | `30 5 * * *` | ۹:۰۰ صبح هر روز |
| `/api/telegram/daily-report` | `45 19 * * *` | ۲۳:۱۵ هر روز |

کارکرد یادآوری ۲۴ ساعته برای نوبت‌های فردا:
1. پیام متن + دکمه‌های «تأیید/جابه‌جایی»
2. **وویس یادآوری** (پیش‌فرض: `/audio/reminder-voice.ogg` — فایل در همین ریپو؛ برای تعویض، فایل را جایگزین کنید یا `REMINDER_VOICE_URL` را ست کنید)
3. **تماس تلفنی واقعی** — فقط اگر `KAVENEGAR_API_KEY` تنظیم باشد؛ متن تماس شامل روز، ساعت و نام پزشک است.

### فعال‌سازی تماس کاوه‌نگار (۳ قدم)
1. ثبت‌نام در [kavenegar.com](https://kavenegar.com) → تأیید هویت (برای تماس TTS الزامی است).
2. پنل → Settings → API Key را کپی کنید → در Vercel: `KAVENEGAR_API_KEY`.
3. اگر خط اختصاصی دارید: `KAVENEGAR_CALLER`. تمام — از یادآوری بعدی خودکار تماس می‌خورد و نتیجه‌اش در رویدادها (`type:"call"`) ثبت می‌شود.

> ⚠️ بعد از هر تغییر متغیر در Vercel یک **Redeploy** لازم است تا اعمال شود. برای تست صحت کلید (بدون تماس):
> `GET /api/telegram/ai-diag?key=<SECRET>&kavenegar=1` → پاسخ سالم: `"ok":true, "status":200`

---

## ۷) امنیت — چرخش توکن‌ها (مهم)

اگر توکن ربات یا کلیدی جایی لو رفته (چت، اسکرین‌شات، ریپو):

1. **ربات:** BotFather → `/mybots` → ربات → API Token → **Revoke current token** → توکن جدید → در Vercel آپدیت → Redeploy → وبهوک را دوباره ست کنید (بخش ۴).
2. **GitHub PAT:** GitHub → Settings → Developer settings → Personal access tokens → توکن قدیمی را Revoke → توکن جدید → در ماشین محلی: `git remote set-url origin https://<TOKEN>@github.com/<user>/<repo>` (Vercel از اتصال GitHub App خودش استفاده می‌کند و نیازی به PAT ندارد).
3. هرگز توکن/کلید را در کد یا داکیومنت نگذارید — فقط Environment Variables وریسل.

---

## ۸) چک‌لیست نهایی راه‌اندازی

- [ ] ۳ توکن ربات از BotFather گرفته شد
- [ ] متغیرهای بخش «تلگرام» در Vercel ست شد
- [ ] Upstash ساخته شد و دو متغیر REST ست شد (`storage:redis` در health)
- [ ] `ZAI_API_KEY` ست شد (`ai:true` در health)
- [ ] `WHISPER_API_KEY` ست شد (`voiceAsr:true` در health)
- [ ] وبهوک ۳ ربات ست شد و پیام آزمایشی جواب گرفت
- [ ] یک وویس فارسی فرستادید و آوا با صدا جواب داد
- [ ] `CRON_SECRET` ست شد (امنیت کرون)
- [ ] (اختیاری) کاوه‌نگار + `KAVENEGAR_API_KEY`
- [ ] (اختیاری) ElevenLabs — فقط اگر فال‌بک پرمیوم خواستید
