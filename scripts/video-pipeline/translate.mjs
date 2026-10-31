/**
 * مترجم زیرنویس و تولیدکنندهٔ متن پست تلگرام — تک‌راه
 *
 * استفاده:
 *   node translate.mjs subs  <input.srt> <output.srt>   ترجمهٔ زیرنویس به فارسی
 *   node translate.mjs post  <input.srt> "<video title>" <output.json>
 *       تولید عنوان و خلاصهٔ فارسی برای پست تلگرام از روی متن ویدیو
 *
 * ترجمه با z-ai-web-dev-sdk (بک‌اند فقط) انجام می‌شود؛ هر بار ~۳۰ خط
 * فرستاده می‌شود و پاسخ باید JSON سخت‌گیرانه باشد. خطای شبکه/JSON دو بار
 * تلاش مجدد می‌شود و در بدترین حالت متن انگلیسی حفظ می‌شود تا پایپ‌لاین نشکند.
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "node:fs";

// ─── ابزارهای SRT ───

function parseSrt(raw) {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const cues = [];
  for (const block of text.split(/\n{2,}/)) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length < 2) continue;
    let idx = 0;
    if (/^\d+$/.test(lines[0].trim())) idx = 1;
    const m = lines[idx]?.match(
      /(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/
    );
    if (!m) continue;
    const body = lines
      .slice(idx + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\{\\[^}]*\}/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!body) continue;
    cues.push({
      start: m[1].replace(",", "."),
      end: m[2].replace(",", "."),
      text: body,
    });
  }

  // ادغام تکرارهای پشت‌سرهم (زیرنویس رولینگ یوتیوب)
  const merged = [];
  for (const c of cues) {
    const prev = merged[merged.length - 1];
    if (prev && prev.text.toLowerCase() === c.text.toLowerCase()) {
      prev.end = c.end;
    } else {
      merged.push({ ...c });
    }
  }
  return merged;
}

function writeSrt(cues) {
  return cues
    .map((c, i) => `${i + 1}\n${c.start.replace(".", ",")} --> ${c.end.replace(".", ",")}\n${c.text}\n`)
    .join("\n");
}

// ─── تماس با مدل ───

async function ask(zai, system, user, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: system },
          { role: "user", content: user },
        ],
        thinking: { type: "disabled" },
      });
      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) throw new Error("پاسخ خالی");
      return content;
    } catch (err) {
      console.error(`  ⚠ تلاش ${attempt} ناموفق: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("JSON یافت نشد");
  return JSON.parse(text.slice(start, end + 1));
}

// ─── حالت subs: ترجمهٔ زیرنویس ───

const SYS_TRANSLATE = `تو مترجم حرفه‌ای زیرنویس ویدیوهای آموزشی تکنولوژی و هوش مصنوعی از انگلیسی به فارسی هستی.
قواعد:
- ترجمه باید خودمونی، روان و گفتاری باشد (مثل دوبلهٔ آموزشی خوب)، نه رسمی و کتابی.
- هر خط باید کوتاه بماند تا در یک سطر زیرنویس جا شود (حداکثر ~۵۰ کاراکتر).
- اصطلاح‌های تخصصی رایج (مثل ChatGPT، API، Prompt) را همان‌طور لاتین/رایج نگه دار یا معادل مصطلح فارسی بزن.
- اسامی خاص را انتقال آوانگاری رایج فارسی بده.
- هیچ توضیح اضافه‌ای ننویس. خروجی فقط و فقط یک JSON معتبر است.
- ساختار خروجی: یک شیء JSON که هر کلید همان کلید ورودی است و مقدارش متن فارسی آن خط است.`;

async function translateSubs(inPath, outPath) {
  const cues = parseSrt(fs.readFileSync(inPath, "utf8"));
  console.log(`  📄 ${cues.length} خط زیرنویس خوانده شد`);
  if (cues.length === 0) throw new Error("زیرنویس خالی است");

  const zai = await ZAI.create();
  const CHUNK = 30;
  for (let i = 0; i < cues.length; i += CHUNK) {
    const part = cues.slice(i, i + CHUNK);
    const payload = Object.fromEntries(part.map((c, j) => [String(i + j), c.text]));
    process.stdout.write(`  🌐 ترجمهٔ خطوط ${i + 1} تا ${i + part.length} ... `);
    let translated = null;
    try {
      const raw = await ask(zai, SYS_TRANSLATE, JSON.stringify(payload));
      translated = extractJson(raw);
    } catch {
      console.log("→ انگلیسی ماند (تلاش‌ها ناموفق)");
    }
    for (let j = 0; j < part.length; j++) {
      const key = String(i + j);
      if (translated && typeof translated[key] === "string" && translated[key].trim()) {
        cues[i + j].text = translated[key].trim();
      }
    }
    console.log("✓");
  }

  fs.writeFileSync(outPath, writeSrt(cues), "utf8");
  console.log(`  💾 زیرنویس فارسی ذخیره شد: ${outPath}`);
  return cues;
}

// ─── حالت post: عنوان و خلاصه برای پست تلگرام ───

const SYS_POST = `تو مدیر محتوای کانال تلگرام فارسی «تک‌راه» هستی؛ کانالی دربارهٔ هوش مصنوعی و درآمد آنلاین.
از روی متن (ترنسکریپت) یک ویدیوی انگلیسی، یک پست تلگرام می‌سازی:
- title: یک عنوان جذاب فارسی حداکثر ۱۰ کلمه که کنجکاوی بسازد (بدون کلیک‌بیت دروغین).
- summary: ۳ جملهٔ کوتاه خودمونی دربارهٔ اینکه بیننده چه چیزی یاد می‌گیرد یا چه نکتهٔ جالبی دارد؛ بدون تعارف اضافه.
- hashtags: ۲ تا ۳ هشتگ فارسی مرتبط (هر کدام با # و بدون فاصله، زیرنویس با _).
خروجی فقط یک JSON معتبر با همین سه کلید باشد.`;

async function makePost(inPath, videoTitle, outPath) {
  const cues = parseSrt(fs.readFileSync(inPath, "utf8"));
  const seen = new Set();
  const transcriptParts = [];
  for (const c of cues) {
    const t = c.text.replace(/^\[[^\]]*\]$/, "").trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    transcriptParts.push(t);
  }
  const transcript = transcriptParts.join(" ").slice(0, 4000);

  const zai = await ZAI.create();
  const raw = await ask(
    zai,
    SYS_POST,
    `عنوان ویدیوی یوتیوب: «${videoTitle}»\n\nترنسکریپت (بخش اول):\n${transcript}`
  );
  const post = extractJson(raw);
  fs.writeFileSync(outPath, JSON.stringify(post, null, 2), "utf8");
  console.log(`  💾 متن پست ذخیره شد: ${outPath}`);
}

// ─── اجرا ───

const [, , mode, ...rest] = process.argv;
try {
  if (mode === "subs") {
    await translateSubs(rest[0], rest[1]);
  } else if (mode === "post") {
    await makePost(rest[0], rest[1], rest[2]);
  } else {
    console.error("حالت نامعتبر — از subs یا post استفاده کن");
    process.exit(1);
  }
} catch (err) {
  console.error(`❌ خطا: ${err.message}`);
  process.exit(1);
}
