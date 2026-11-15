"use client";
// ─── دموی زندهٔ تعاملی داخل کارت پلن‌ها ───
// سه سناریو:
//  kind="site"      → شبیه‌سازی سایت اختصاصی مطب (بیمار لینک را باز می‌کند → اطلاعات → تماس/واتساپ)
//  kind="booking"   → شبیه‌سازی نوبت‌دهی بیمار (پزشک → روز → ساعت → ثبت → اعلان تلگرام)
//  kind="assistant" → همان نوبت‌دهی + تب «دستیار پزشک»: پیام صوتی بیمار → تحلیل آوا →
//                     خلاصهٔ تایپ‌شونده + نشان فوریت + پخش وویس واقعی (نمونهٔ صدای دیلارا)
// همه‌چیز سمت کلاینت و بدون تماس شبکه است — هدف: دکتر خودش محصول را با دست بفهمد.
import { useEffect, useMemo, useRef, useState } from "react";

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

const DAY = "شنبه ۱۴ آذر";
const TIME = "۱۰:۳۰";
const PATIENT = "محمدرضا احدی";
const PHONE = "۰۹۱۱ ۱۲۳ ۴۵۶۷";

const SUMMARY_LINES = [
  "بیمار: خانم کریمی — ۳۴ ساله",
  "شکایت: درد دندان پایین چپ از ۳ روز پیش",
  "حساسیت به سردی و شیرینی · بدون سابقهٔ بیماری",
  "دارو: مسکن بدون نسخه مصرف کرده",
];

function Waveform({ playing }: { playing: boolean }) {
  const bars = useMemo(() => Array.from({ length: 18 }, (_, i) => 30 + ((i * 37) % 70)), []);
  return (
    <span className="flex h-6 items-center gap-[2.5px]" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-emerald-500/80 ${playing ? "animate-pulse" : ""}`}
          style={{ height: `${playing ? h : 18}%`, transitionDelay: `${i * 40}ms` }}
        />
      ))}
    </span>
  );
}

const fa2 = (n: number) =>
  n.toLocaleString("fa-IR", { minimumIntegerDigits: 2, useGrouping: false });

export type DemoKind = "site" | "booking" | "assistant";

export function PlanDemo({ kind }: { kind: DemoKind }) {
  const [tab, setTab] = useState<"book" | "ai">("book");
  const [stage, setStage] = useState<Stage>(0);
  const [playing, setPlaying] = useState(false);
  const [typed, setTyped] = useState(0);
  const [voiceSecs, setVoiceSecs] = useState(22);
  const bodyRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAi = kind === "assistant";

  // پخش/توقف وویس واقعی — نمونهٔ ضبط‌شده با صدای عصبی دیلارا (همان صدای آوا در محصول)
  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }

  // ریست هنگام تعویض تب
  useEffect(() => {
    setStage(0);
    setTyped(0);
    audioRef.current?.pause();
    setPlaying(false);
  }, [tab]);

  // تایپ‌شدن خلاصهٔ آوا
  useEffect(() => {
    if (tab !== "ai" || stage < 2) return;
    const full = SUMMARY_LINES.join("\n");
    if (typed >= full.length) return;
    const t = setTimeout(() => setTyped((v) => v + 3), 24);
    return () => clearTimeout(t);
  }, [tab, stage, typed]);

  // اسکرول به پایین در هر تغییر مرحله
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 9_999, behavior: "smooth" });
  }, [stage, tab]);

  const fullText = SUMMARY_LINES.join("\n");
  const typingDone = typed >= fullText.length;

  return (
    <div className="mt-5 border-t border-border/60 pt-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
          🎬 دموی زنده — خودت امتحان کن
        </p>
        {isAi ? (
          <div className="flex rounded-full border border-border/70 bg-muted/40 p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setTab("book")}
              className={`rounded-full px-2.5 py-1 transition-colors ${tab === "book" ? "bg-emerald-600 text-white" : "text-muted-foreground"}`}
            >
              نوبت‌دهی
            </button>
            <button
              type="button"
              onClick={() => setTab("ai")}
              className={`rounded-full px-2.5 py-1 transition-colors ${tab === "ai" ? "bg-emerald-600 text-white" : "text-muted-foreground"}`}
            >
              دستیار پزشک
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            تعاملی
          </span>
        )}
      </div>

      {/* قاب گوشی */}
      <div className="mx-auto mt-3 w-full max-w-[300px] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2">
          <span className="text-[11px] font-extrabold">مطب دکتر سارا محمدی</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            takrah.top
          </span>
        </div>

        <audio
          ref={audioRef}
          src="/demo/ava-sample.mp3"
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = Math.round(e.currentTarget.duration);
            if (Number.isFinite(d) && d > 0) setVoiceSecs(d);
          }}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
        <div ref={bodyRef} className="relative h-[300px] overflow-y-auto scroll-smooth px-3 py-3">
          {kind === "site" ? (
            <SiteFlow stage={stage} setStage={setStage} />
          ) : tab === "book" ? (
            <BookingFlow stage={stage} setStage={setStage} />
          ) : (
            <AssistantFlow stage={stage} setStage={setStage} playing={playing} onTogglePlay={togglePlay} typed={typed} typingDone={typingDone} voiceSecs={voiceSecs} />
          )}

          {/* اعلان تلگرام */}
          {((tab === "book" && stage === 5) || (tab === "ai" && typingDone)) && (
            <div className="absolute inset-x-3 bottom-3 animate-in slide-in-from-bottom-4 fade-in duration-500 rounded-xl border border-emerald-600/30 bg-emerald-600/10 p-2.5 shadow-md backdrop-blur">
              <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
                🔔 تلگرام دکتر {tab === "book" ? "— نوبت جدید" : "— خلاصهٔ بیمار + وویس"}
              </p>
              <p className="mt-1 text-[10px] leading-4 text-foreground/80">
                {tab === "book"
                  ? `${PATIENT} · ${DAY} ساعت ${TIME} — پاسخ «تایید» یا «تغییر ساعت»`
                  : `وویس خلاصهٔ خانم کریمی (${fa2(voiceSecs)} ثانیه) آمادهٔ پخش است`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-[10.5px] leading-4 text-muted-foreground">
          {kind === "site"
            ? "بیمار لینک مطب را باز می‌کند و با یک لمس تماس یا واتساپ می‌گیرد."
            : tab === "ai"
              ? "بیمار پیام صوتی می‌دهد؛ آوا خلاصه می‌سازد و به تلگرام دکتر می‌فرستد."
              : "بیمار بدون تماس تلفنی، از اینستاگرام یا واتساپ نوبت می‌گیرد."}
        </p>
        <button
          type="button"
          onClick={() => {
            setStage(0);
            setTyped(0);
            audioRef.current?.pause();
            setPlaying(false);
          }}
          className="shrink-0 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          شروع دوباره ↺
        </button>
      </div>
    </div>
  );
}

function BookingFlow({ stage, setStage }: { stage: Stage; setStage: (s: Stage) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  if (stage === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="text-3xl">🦷</span>
        <p className="mt-2 text-sm font-extrabold">سلام! خوش آمدید 👋</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">صفحهٔ اختصاصی مطب — بدون تماس، نوبت بگیرید</p>
        <button
          type="button"
          onClick={() => setStage(1)}
          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          📅 دریافت نوبت
        </button>
      </div>
    );
  }
  if (stage === 1) {
    return (
      <StepWrap title="۱ · انتخاب پزشک">
        <button
          type="button"
          onClick={() => setStage(2)}
          className="w-full rounded-xl border border-emerald-600/40 bg-emerald-600/10 p-3 text-start transition-transform active:scale-[0.98]"
        >
          <b className="text-xs">دکتر سارا محمدی</b>
          <span className="block text-[10px] text-muted-foreground">دندانپزشکی · شنبه تا پنجشنبه</span>
        </button>
        <div className="mt-2 rounded-xl border border-dashed border-border/70 p-2 text-center text-[10px] text-muted-foreground opacity-60">
          سایر پزشکان (در پلن کلینیک)
        </div>
      </StepWrap>
    );
  }
  if (stage === 2) {
    return (
      <StepWrap title="۲ · انتخاب روز">
        <div className="grid grid-cols-3 gap-2">
          {["شنبه ۱۴", "یکشنبه ۱۵", "دوشنبه ۱۶"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDay(d);
                setStage(3);
              }}
              className={`rounded-xl border px-1 py-2.5 text-[10.5px] font-bold transition-transform active:scale-[0.97] ${
                day === d ? "border-emerald-600 bg-emerald-600/10" : "border-border/70 bg-muted/30"
              }`}
            >
              {d}
              <span className="block text-[9px] font-normal text-muted-foreground">آذر</span>
            </button>
          ))}
        </div>
      </StepWrap>
    );
  }
  if (stage === 3) {
    return (
      <StepWrap title={`۳ · ساعت — ${DAY}`}>
        <div className="grid grid-cols-4 gap-2">
          {["۱۰:۰۰", "۱۰:۳۰", "۱۱:۰۰", "۱۱:۳۰"].map((t, i) => (
            <button
              key={t}
              type="button"
              disabled={i === 2}
              onClick={() => {
                setTime(t);
                setStage(4);
              }}
              className={`rounded-lg border py-2 text-[10.5px] font-bold ${
                i === 2
                  ? "cursor-not-allowed border-border/50 bg-muted/20 text-muted-foreground line-through opacity-50"
                  : time === t
                    ? "border-emerald-600 bg-emerald-600/10"
                    : "border-border/70 bg-muted/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">یک ساعت «پر» است — سیستم جلوی رزرو تکراری را می‌گیرد.</p>
      </StepWrap>
    );
  }
  if (stage === 4) {
    return (
      <StepWrap title={`۴ · مشخصات — ${day} ساعت ${time}`}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام و نام خانوادگی"
          className="w-full rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-[11px] outline-none focus:border-emerald-600"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="شمارهٔ تماس"
          dir="ltr"
          className="mt-2 w-full rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-end text-[11px] outline-none focus:border-emerald-600"
        />
        <button
          type="button"
          onClick={() => setStage(5)}
          className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          ✅ ثبت نوبت
        </button>
      </StepWrap>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/15 text-2xl">✅</span>
      <p className="mt-2 text-sm font-extrabold">نوبت شما ثبت شد!</p>
      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        {name.trim() || PATIENT} · {DAY} · ساعت {time ?? TIME}
      </p>
      <p className="mt-2 rounded-lg bg-muted/40 px-3 py-1.5 text-[10px] text-muted-foreground">
        پیام تأیید به واتساپ/تلگرام بیمار می‌رود
      </p>
    </div>
  );
}

function AssistantFlow({
  stage,
  setStage,
  playing,
  onTogglePlay,
  typed,
  typingDone,
  voiceSecs,
}: {
  stage: Stage;
  setStage: (s: Stage) => void;
  playing: boolean;
  onTogglePlay: () => void;
  typed: number;
  typingDone: boolean;
  voiceSecs: number;
}) {
  if (stage === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="text-3xl">🎙️</span>
        <p className="mt-2 text-sm font-extrabold">بیمار پیام صوتی فرستاد</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">قبل از ویزیت، شکلایم را صوتی می‌گوید</p>
        <button
          type="button"
          onClick={() => setStage(1)}
          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          🤖 تحلیل توسط «آوا»
        </button>
      </div>
    );
  }
  if (stage === 1) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <p className="mt-3 text-xs font-extrabold">آوا در حال تحلیل پیام صوتی…</p>
        <p className="mt-1 text-[10px] text-muted-foreground">هوش مصنوعی · چند ثانیه</p>
        <button
          type="button"
          onClick={() => setStage(2)}
          className="mt-4 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          (در دمو دستی برو مرحلهٔ بعد)
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <p className="mb-1 flex items-center justify-between text-[10px] font-extrabold">
          <span>🤖 خلاصهٔ هوشمند بیمار</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold transition-opacity ${typingDone ? "opacity-100" : "opacity-0"} bg-amber-500/15 text-amber-700 dark:text-amber-400`}
          >
            فوریت: متوسط 🟡
          </span>
        </p>
        <p className="whitespace-pre-line text-[10.5px] leading-5 text-foreground/85">
          {SUMMARY_LINES.join("\n").slice(0, typed)}
          {!typingDone && <span className="animate-pulse">▌</span>}
        </p>
      </div>
      <button
        type="button"
        onClick={onTogglePlay}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition-colors ${
          playing ? "border-emerald-600/50 bg-emerald-600/10" : "border-border/70 bg-muted/30"
        }`}
      >
        <span className="flex items-center gap-2 text-[11px] font-extrabold">
          {playing ? "⏸ در حال پخش…" : "▶ پخش خلاصهٔ صوتی"}
        </span>
        <span className="flex items-center gap-2">
          <Waveform playing={playing} />
          <span className="text-[9px] text-muted-foreground">
            ۰:{fa2(voiceSecs)}
          </span>
        </span>
      </button>
      <p className="text-center text-[10px] text-muted-foreground">
        {typingDone ? "متن + وویس همین لحظه به تلگرام دکتر رفت ⬆️" : "خلاصه در حال نوشته‌شدن است…"}
      </p>
    </div>
  );
}

// ─── دموی پلن «سایت مطب» — بیمار لینک را باز می‌کند و با یک لمس تماس می‌گیرد ───
function SiteFlow({ stage, setStage }: { stage: Stage; setStage: (s: Stage) => void }) {
  if (stage === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="text-3xl">🔗</span>
        <p className="mt-2 text-sm font-extrabold">بیمار لینک را باز کرد</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">از اینستاگرام، واتساپ یا کد QR روی میز پذیرش</p>
        <button
          type="button"
          onClick={() => setStage(1)}
          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          👁 مشاهدهٔ سایت مطب
        </button>
      </div>
    );
  }
  if (stage === 1) {
    return (
      <div>
        <p className="mb-2 text-[11px] font-extrabold text-foreground/80">وب‌سایت اختصاصی مطب شما</p>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
          <p className="text-xs font-extrabold">🩺 دکتر سارا محمدی</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">دندانپزشکی زیبایی و ایمپلنت</p>
          <div className="mt-2 space-y-1 text-[10px] leading-4 text-foreground/80">
            <p>📍 رشت، گلسار، مجتمع پزشکان سلامت</p>
            <p>🕘 شنبه تا پنجشنبه — ۹ تا ۲۰</p>
            <p>🎓 متخصص با ۱۲ سال سابقه</p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStage(2)}
            className="rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition-transform active:scale-[0.98]"
          >
            ☎️ تماس با پذیرش
          </button>
          <button
            type="button"
            onClick={() => setStage(2)}
            className="rounded-xl border border-emerald-600/40 bg-emerald-600/10 px-3 py-2.5 text-[11px] font-extrabold text-emerald-800 transition-transform active:scale-[0.98] dark:text-emerald-300"
          >
            💬 واتساپ
          </button>
        </div>
        <div className="mt-2 rounded-xl border border-dashed border-border/70 p-2 text-center text-[10px] text-muted-foreground opacity-70">
          🗓 نوبت‌دهی آنلاین (در پلن‌های بالاتر)
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/15 text-2xl">📞</span>
      <p className="mt-2 text-sm font-extrabold">بیمار تماس گرفت!</p>
      <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
        بدون سایت، این بیمار شاید اصلاً شما را پیدا نمی‌کرد.
      </p>
      <p className="mt-2 rounded-lg bg-muted/40 px-3 py-1.5 text-[10px] leading-4 text-muted-foreground">
        در پلن «سایت + نوبت‌دهی» همین بیمار بدون تماس، خودش نوبت می‌گیرد ⬆️
      </p>
    </div>
  );
}

function StepWrap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold text-foreground/80">{title}</p>
      {children}
    </div>
  );
}
