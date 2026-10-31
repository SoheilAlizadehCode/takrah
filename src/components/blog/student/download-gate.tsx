"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { gaEvent } from "@/lib/ga";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  Check,
  CircleAlert,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Megaphone,
  Send,
  Share2,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site";

/* ─── ثابت‌ها و تایپ‌ها ─────────────────────────────────────────── */

const AD_SECONDS = 15;
const BOT_USERNAME = "TakrahTop_support_bot";
const CHANNEL_URL = siteConfig.telegramChannel;

interface GateProps {
  googleClientId: string;
  initialStep: 1 | 2 | 3 | 4;
  initialUser: { name: string; email: string; picture: string; guest: boolean };
}

interface FileItem {
  id: string;
  title: string;
  description: string;
  sizeLabel: string;
  badge?: string;
  group: string;
  url: string;
}

const STEP_LABELS = ["ورود به حساب", "تأیید عضویت", "تبلیغ کوتاه", "دانلود فایل‌ها"];

const PROMOS = [
  {
    icon: Bot,
    title: "ربات تک‌راه",
    text: "هر مقاله‌ای خواستی، تو تلگرام اسمش رو بنویس تا پیدا کنه؛ پرفروش‌ترین آموزش‌ها هم اونجاست!",
    cta: "شروع ربات",
    href: `https://t.me/${BOT_USERNAME}`,
  },
  {
    icon: Send,
    title: "کانال تک‌راه",
    text: "جدیدترین مقاله‌ها، فایل‌ها و ترفندهای درآمد و تکنولوژی، اول از همه تو کانال منتشر می‌شن.",
    cta: "عضویت در کانال",
    href: CHANNEL_URL,
  },
  {
    icon: Megaphone,
    title: "محل تبلیغ شما",
    text: "این‌جا هر روز توسط هزاران دانش‌آموز و علاقه‌مند تکنولوژی دیده می‌شود؛ برای سفارش تبلیغ ایمیل بزن.",
    cta: siteConfig.email,
    href: `mailto:${siteConfig.email}?subject=تبلیغ در بخش دانلود تک‌راه`,
  },
];

/* ─── نشانگر مراحل ──────────────────────────────────────────────── */

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-start" aria-label="مراحل دانلود">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 rounded ${i === 0 ? "opacity-0" : done || active ? "bg-primary/60" : "bg-border"}`} />
              <span
                aria-current={active ? "step" : undefined}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : n}
              </span>
              <span className={`h-0.5 flex-1 rounded ${i === STEP_LABELS.length - 1 ? "opacity-0" : done ? "bg-primary/60" : "bg-border"}`} />
            </div>
            <span className={`text-center text-[10px] leading-4 sm:text-xs ${active ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ─── حلقه شمارش معکوس تبلیغ ───────────────────────────────────── */

function CountdownRing({ remaining }: { remaining: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const progress = remaining / AD_SECONDS;
  return (
    <div className="relative flex h-16 w-16 items-center justify-center" role="timer" aria-label={`${remaining} ثانیه تا دانلود`}>
      <svg className="absolute -rotate-90" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" className="text-primary/15" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
      </svg>
      <span className="text-lg font-extrabold tabular-nums">{remaining}</span>
    </div>
  );
}

/* ─── گیت دانلود ────────────────────────────────────────────────── */

export function DownloadGate({ googleClientId, initialStep, initialUser }: GateProps) {
  const [step, setStep] = useState<number>(initialStep);
  const [user, setUser] = useState(initialUser);
  const [nonce, setNonce] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(AD_SECONDS);
  const [files, setFiles] = useState<FileItem[] | null>(null);
  const [promoIdx, setPromoIdx] = useState(0);
  const [gisFailed, setGisFailed] = useState(false);
  const t0Ref = useRef(Date.now());
  const gisDoneRef = useRef(false);
  const unlockBusyRef = useRef(false);
  const btnRef = useRef<HTMLDivElement | null>(null);

  // nonce برای دیپ‌لینک ربات — در localStorage ماندگار است (نه فقط عمر تب):
  // کدهای قبلی ربات بعد از بستن تب/ری‌استارت مرورگر هم معتبر می‌مانند و باگ
  // «کد درست نیست» بعد از برگشت به صفحه رخ نمی‌دهد. تب‌های مختلف هم
  // nonce مشترک دارند (sessionStorage قدیمی مهاجرت می‌شود).
  useEffect(() => {
    const ok = (v: string | null): v is string => !!v && /^[a-f0-9]{8,32}$/.test(v);
    let n = localStorage.getItem("tk_dlv_nonce");
    if (!ok(n)) n = sessionStorage.getItem("tk_dlv_nonce"); // مهاجرت از نسخهٔ قبل
    if (!ok(n)) {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      n = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    localStorage.setItem("tk_dlv_nonce", n);
    sessionStorage.removeItem("tk_dlv_nonce");
    setNonce(n);
  }, []);

  const goStep = useCallback((s: number) => {
    setStep(s);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* مرحله ۱ — ورود با گوگل */
  const loginGoogle = useCallback(
    async (credential: string) => {
      setBusy(true);
      setError("");
      try {
        const res = await fetch("/api/student/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });
        const j = (await res.json().catch(() => ({}))) as { ok?: boolean; name?: string; email?: string; picture?: string };
        if (res.ok && j.ok) {
          // ⚠️ پیشوند google_ در GA4 رزرو است — اسم رویداد نباید با google_ شروع شود
          gaEvent("signup_google_success");
          setUser({ name: j.name || "", email: j.email || "", picture: j.picture || "", guest: false });
          goStep(2);
        } else {
          setError("ورود با گوگل انجام نشد؛ دوباره امتحان کن.");
        }
      } catch {
        setError("ارتباط با سرور برقرار نشد؛ اینترنتت را چک کن.");
      } finally {
        setBusy(false);
      }
    },
    [goStep],
  );

  const loginGuest = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/student/guest", { method: "POST" });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && j.ok) {
        gaEvent("guest_signup_success");
        setUser({ name: "", email: "", picture: "", guest: true });
        goStep(2);
      } else {
        setError("فعلاً نمی‌شود بدون ورود ادامه داد؛ با گوگل وارد شو.");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد؛ دوباره تلاش کن.");
    } finally {
      setBusy(false);
    }
  }, [goStep]);

  // آماده‌سازی دکمه Google Identity (فقط وقتی Client ID تنظیم شده)
  // نکته: user.guest در شرط نیست — کوکی مهمان قدیمی هم باید دکمه گوگل را ببیند وگرنه مرحله ۱ خالی می‌ماند.
  useEffect(() => {
    if (!googleClientId || user.name || step !== 1) return;
    const iv = setInterval(() => {
      const g = (window as unknown as {
        google?: { accounts?: { id?: { initialize: (o: Record<string, unknown>) => void; renderButton: (el: HTMLElement, o: Record<string, unknown>) => void } } };
      }).google?.accounts?.id;
      if (!g || gisDoneRef.current || !btnRef.current) return;
      gisDoneRef.current = true;
      clearInterval(iv);
      g.initialize({
        client_id: googleClientId,
        callback: (r: { credential?: string }) => {
          if (r.credential) void loginGoogle(r.credential);
        },
      });
      g.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
        locale: "fa",
        width: 280,
      });
    }, 250);
    const stop = setTimeout(() => clearInterval(iv), 20000);
    // اگر اسکریپت گوگل تا ۸ ثانیه نیامد (IP ایران معمولاً باز نمی‌کند) راه تلگرام را برجسته کن
    const failT = setTimeout(() => {
      if (!gisDoneRef.current) setGisFailed(true);
    }, 8000);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
      clearTimeout(failT);
    };
  }, [step, googleClientId, user.name, loginGoogle]);

  /* مرحله ۱ (جایگزین) — ورود با تلگرام: مستقیم به تأیید عضویت؛ هویت از کد امضاشده ربات می‌آید
     (کد = nonce.tgId.امضا → verify رکورد tgId را در سشن می‌نویسد؛ بدون نیاز به گوگل). */
  const loginTelegram = useCallback(() => {
    gaEvent("gate_telegram_start");
    setError("");
    goStep(2);
  }, [goStep]);

  /* مرحله ۲ — تأیید کد عضویت */
  const verifyCode = useCallback(async () => {
    if (!code.trim()) {
      setError("کد را از پیام ربات این‌جا وارد کن.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/student/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce, code: code.trim() }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; reason?: string };
      if (res.ok && j.ok) {
        gaEvent("gate_verify_success");
        goStep(3);
      } else {
        setError(j.message || "تأیید نشد؛ دوباره تلاش کن.");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد؛ دوباره تلاش کن.");
    } finally {
      setBusy(false);
    }
  }, [code, nonce, goStep]);

  /* مرحله ۳ — تبلیغ + باز کردن فایل‌ها */
  const unlock = useCallback(async () => {
    if (unlockBusyRef.current) return;
    unlockBusyRef.current = true;
    setBusy(true);
    try {
      const res = await fetch("/api/student/unlock", {
        method: "POST",
        headers: { "x-gate-t0": String(t0Ref.current) },
      });
      const j = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        files?: FileItem[];
        reason?: string;
        remaining?: number;
        backToStep?: number;
      };
      if (res.ok && j.ok && j.files) {
        gaEvent("gate_unlock_success");
        setFiles(j.files);
        goStep(4);
      } else if (j.reason === "not_member") {
        setError("عضویتت در کانال پیدا نشد! اول عضو شو، بعد دوباره از ربات کد بگیر.");
        goStep(2);
      } else if (j.reason === "wait") {
        setTimeout(() => {
          unlockBusyRef.current = false;
          void unlock();
        }, (j.remaining ?? 3) * 1000);
        return;
      } else {
        setError("باز کردن لینک‌ها انجام نشد؛ صفحه را رفرش کن و مراحل را تکرار کن.");
      }
    } catch {
      setError("ارتباط با سرور برقرار نشد؛ دوباره تلاش کن.");
    } finally {
      unlockBusyRef.current = false;
      setBusy(false);
    }
  }, [goStep]);

  useEffect(() => {
    if (step !== 3) return;
    setCountdown(AD_SECONDS);
    setPromoIdx(0);
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(tick);
          void unlock();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    const promo = setInterval(() => setPromoIdx((p) => (p + 1) % PROMOS.length), 5000);
    return () => {
      clearInterval(tick);
      clearInterval(promo);
    };
  }, [step, unlock]);

  const deepLink = `https://t.me/${BOT_USERNAME}?start=dlv_${nonce}`;
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(`${siteConfig.url}/student/download`)}&text=${encodeURIComponent("📥 فایل‌های آموزشی کتاب‌های درسی شبکه و نرم‌افزار — رایگان در تک‌راه:\nورود کن، عضویتت تأیید بشه و دانلود کن!")}`;

  const cardCls = "rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

      {/* سربرگ */}
      <header className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Download className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">دانلود فایل‌های آموزشی</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-muted-foreground sm:text-[0.95rem]">
          PDF کتاب‌های درسی، جزوه‌ها و ابزارهای کمکی بخش دانش‌آموزی — رایگان برای اعضای کانال
          تک‌راه. سه قدم کوتاه تا دانلود: وارد شو، عضویتت تأیید بشه، یک تبلیغ کوتاه ببینی.
        </p>
      </header>

      <Stepper current={step} />

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-red-600/30 bg-red-600/10 p-4 text-sm text-red-800 dark:text-red-300">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="leading-7">{error}</span>
        </div>
      )}

      {/* مرحله ۱ — ورود */}
      {step === 1 && (
        <section className={cardCls} aria-labelledby="step1-h">
          <h2 id="step1-h" className="flex items-center gap-2 text-lg font-extrabold">
            <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
            ۱. وارد حساب کاربری‌ات شو
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            با حساب گوگل وارد شو تا بعداً هم راحت فایل‌های جدید را بگیری و هم پیشرفتت حفظ شود.
            اطلاعات تو فقط برای نمایش نام استفاده می‌شود.
          </p>
          <div className="mt-5 flex flex-col items-center gap-4">
            {googleClientId ? (
              <>
                <div ref={btnRef} className="flex min-h-[44px] items-center justify-center" aria-label="ورود با گوگل" />
                {gisFailed && (
                  <p className="w-full rounded-lg bg-amber-500/10 px-3 py-2 text-center text-xs leading-6 text-amber-700 dark:text-amber-400">
                    دکمه گوگل روی خیلی از IPهای ایران باز نمی‌شود؛ راه دوم برای تو آماده است 👇
                  </p>
                )}
                <div className="flex w-full max-w-xs items-center gap-3 text-[11px] font-medium text-muted-foreground">
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  یا
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                </div>
                <Button variant="outline" onClick={loginTelegram} className="min-h-11 w-full max-w-xs gap-2">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  ورود سریع با تلگرام (بدون گوگل)
                </Button>
              </>
            ) : (
              <div className="w-full rounded-xl border border-dashed border-border/80 bg-muted/40 p-4 text-center">
                <p className="text-sm leading-7 text-muted-foreground">
                  ورود با گوگل به‌زودی فعال می‌شود.
                </p>
                <Button onClick={() => void loginGuest()} disabled={busy} className="mt-3 min-h-11 gap-2">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
                  ادامه به‌صورت مهمان (موقت)
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* مرحله ۲ — تأیید عضویت کانال */}
      {step === 2 && (
        <section className={cardCls} aria-labelledby="step2-h">
          <h2 id="step2-h" className="flex items-center gap-2 text-lg font-extrabold">
            <BadgeCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            ۲. عضویت در کانال تک‌راه را تأیید کن
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            فایل‌ها رایگان‌اند؛ در عوض باید عضو کانال باشی تا جدیدترین جزوه‌ها و فایل‌های
            جدید را زودتر از همه بگیری. ربات تک‌راه عضویتت را چک می‌کند و یک کد به تو می‌دهد.
          </p>

          <ol className="mt-4 space-y-2 rounded-xl bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-foreground">۱.</span>
              <span>روی دکمه زیر بزن و تو ربات، دکمه <b className="text-foreground">START</b> را بزن.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-foreground">۲.</span>
              <span>اگر عضو باشی، فوراً <b className="text-foreground">کد تأیید</b> می‌گیری؛ اگر نباشی، اول عضو شو و دوباره START بزن.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-foreground">۳.</span>
              <span>کد را این‌جا وارد کن و «تأیید و ادامه» را بزن.</span>
            </li>
          </ol>

          <div className="mt-5 flex flex-col items-center gap-4">
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto sm:px-6"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              بررسی عضویت در تلگرام
            </a>

            <div className="flex w-full max-w-sm flex-col gap-2">
              <label htmlFor="gate-code" className="text-xs font-medium text-muted-foreground">
                کد تأیید ربات:
              </label>
              <Input
                id="gate-code"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onPaste={(e) => {
                  // اگر کل پیام ربات را کپی کرده‌اند، فقط خودِ کد را بردار
                  const m = e.clipboardData.getData("text").match(/[a-f0-9]{8,32}\.[0-9]{1,12}\.[a-f0-9]{16}/);
                  if (m) {
                    e.preventDefault();
                    setCode(m[0]);
                  }
                }}
                placeholder="xxxx.yyyyyyy.xxxxxxxxxxxxxxxx"
                className="text-center font-mono text-sm"
                autoComplete="off"
              />
              <p className="text-[11px] leading-5 text-muted-foreground">
                کل پیام ربات را کپی کنی هم کافیه؛ کد را خودم از داخلش پیدا می‌کنم.
              </p>
              <Button onClick={() => void verifyCode()} disabled={busy} className="min-h-11 gap-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <BadgeCheck className="h-4 w-4" aria-hidden="true" />}
                تأیید و ادامه
              </Button>
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                هنوز عضو کانال نشده‌ای؟ عضویت در @takrahTop
              </a>
            </div>
          </div>
        </section>
      )}

      {/* مرحله ۳ — تبلیغ */}
      {step === 3 && (
        <section className={cardCls} aria-labelledby="step3-h">
          <h2 id="step3-h" className="flex items-center gap-2 text-lg font-extrabold">
            <Timer className="h-5 w-5 text-primary" aria-hidden="true" />
            ۳. یک تبلیغ کوتاه ببین
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تبلیغ‌ها هزینه سرور و رایگان ماندن فایل‌ها را پوشش می‌دهند؛ {AD_SECONDS} ثانیه
            صبر کن تا لینک‌های دانلود باز شوند.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-border/70">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2">
              <span className="text-[10px] font-bold text-muted-foreground/80">تبلیغ</span>
              <CountdownRing remaining={countdown} />
              <span className="text-[10px] font-bold text-muted-foreground/80">حمایت‌شده</span>
            </div>
            {siteConfig.adsenseClientId ? (
              <div className="flex min-h-[180px] items-center justify-center p-4">
                <ins
                  className="adsbygoogle block w-full"
                  style={{ display: "block" }}
                  data-ad-client={siteConfig.adsenseClientId}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              </div>
            ) : (
              <div className="min-h-[180px] p-5">
                {PROMOS.map((p, i) => (
                  <div key={p.title} className={i === promoIdx ? "block" : "hidden"} aria-hidden={i !== promoIdx}>
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <p.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold">{p.title}</h3>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">{p.text}</p>
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                        >
                          {p.cta}
                          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
                  {PROMOS.map((p, i) => (
                    <span key={p.title} className={`h-1.5 w-6 rounded-full transition-colors ${i === promoIdx ? "bg-primary" : "bg-border"}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                در حال باز کردن لینک‌های دانلود…
              </>
            ) : countdown > 0 ? (
              "بعد از پایان شمارش، دانلود خودکار باز می‌شود"
            ) : (
              "لینک‌ها آماده‌اند!"
            )}
          </p>
        </section>
      )}

      {/* مرحله ۴ — دانلود */}
      {step === 4 && files && (
        <section aria-labelledby="step4-h">
          <div className={`${cardCls} border-primary/40 bg-primary/5`}>
            <h2 id="step4-h" className="flex items-center gap-2 text-lg font-extrabold">
              <Download className="h-5 w-5 text-primary" aria-hidden="true" />
              ۴. فایل‌هات آماده‌ست! 🎉
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              برای دوست‌های کلاسیت هم بفرست تا همه با هم امتحان‌ها را راحت پاس کنید —
              هر کسی با همین صفحه راحت دانلود می‌کند.
            </p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              معرفی بخش دانلود به دوستان
            </a>
          </div>

          <ul className="mt-6 space-y-4">
            {files.map((f) => (
              <li key={f.id} className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                  <FileText className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold leading-6 sm:text-base">{f.title}</h3>
                    {f.badge && (
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${f.group === "book" ? "bg-primary/10 text-primary" : "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"}`}>
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground sm:text-[0.8rem]">{f.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a
                      href={f.url}
                      download
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      دانلود ({f.sizeLabel})
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* پایین صفحه */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm">
        <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-muted-foreground">مقاله‌های پودمان‌به‌پودمان این کتاب‌ها را هم ببین:</span>
        <Link href="/student" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
          کتابخانه دانش‌آموزی
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
