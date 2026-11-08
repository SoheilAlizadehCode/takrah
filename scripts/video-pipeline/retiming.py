#!/usr/bin/env python3
"""
زمان‌بندی مجدد زیرنویس فارسی تک‌راه
====================================
مشکل: زیرنویس یوتیوب (اتوکپشن) ~۰/۳-۰/۸ ثانیه «جلوتر» از گفتار نمایش داده می‌شود
و بعضی کیوها سریع رد می‌شوند.

راه‌حل:
  ۱) سکوت‌های گفتار با ffmpeg silencedetect استخراج می‌شود
  ۲) برای هر کیو که شروعش نزدیک یک سکوت است، «جلو بودن» = پایان سکوت - شروع کیو
     (جمله معمولاً بعد از سکوت شروع می‌شود؛ اگر متن قبل از پایان سکوت آمده = جلو است)
  ۳) میانهٔ جلو بودن = offset → همهٔ کیوها به همان اندازه عقب کشیده می‌شوند
  ۴) مدت نمایش هر کیو حداقل --min-dur ثانیه می‌شود (تا متن سریع نرود)
     با سقف «شروع کیو بعدی - ۸۰ms» تا همپوشانی پیش نیاید

استفاده:
  python3 retiming.py fa.srt [--offset auto] [--min-dur 2.0] [--video source.mp4]
"""
import argparse
import re
import statistics
import subprocess
import sys
from pathlib import Path


def ts2sec(ts: str) -> float:
    h, m, rest = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + float(rest.replace(",", "."))


def sec2ts(sec: float) -> str:
    sec = max(0.0, sec)
    h = int(sec // 3600)
    m = int(sec % 3600 // 60)
    s = sec % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")


def parse_srt(path: Path):
    cues = []
    for block in re.split(r"\n{2,}", path.read_text(encoding="utf-8")):
        lines = [l for l in block.split("\n") if l.strip()]
        if len(lines) < 2:
            continue
        i = 1 if lines[0].strip().isdigit() else 0
        m = re.search(r"(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})", lines[i])
        if not m:
            continue
        cues.append({"start": ts2sec(m.group(1)), "end": ts2sec(m.group(2)),
                     "text": " ".join(lines[i + 1:]).strip()})
    return cues


def write_srt(cues, path: Path):
    path.write_text(
        "\n".join(f"{i + 1}\n{sec2ts(c['start'])} --> {sec2ts(c['end'])}\n{c['text']}\n"
                  for i, c in enumerate(cues)) + "\n",
        encoding="utf-8",
    )


def detect_silences(video: Path, noise="-30dB", min_d=0.25) -> list[tuple[float, float]]:
    proc = subprocess.run(
        ["ffmpeg", "-nostdin", "-i", str(video), "-af", f"silencedetect=noise={noise}:d={min_d}", "-f", "null", "/dev/null"],
        capture_output=True, text=True, timeout=300,
    )
    log = proc.stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
    return list(zip(starts, ends[: len(starts)]))


def estimate_offset(cues, silences) -> tuple[float, list[float]]:
    """میانهٔ (پایان سکوت - شروع کیو) برای کیوهایی که سکوت نزدیک شروعشان است."""
    leads = []
    for c in cues:
        s = c["start"]
        for a, b in silences:
            # سکوتی که تقریباً همزمان با شروع کیو تمام می‌شود → جمله بعد از سکوت شروع شده
            if -0.35 <= (b - s) <= 1.6 and abs(a - s) <= 2.5:
                leads.append(b - s)
                break
    if not leads:
        return 0.35, []
    return statistics.median(leads), sorted(leads)


def retime(cues, offset: float, min_dur: float):
    out = []
    for i, c in enumerate(cues):
        ns = c["start"] + offset
        ne = max(c["end"] + offset, ns + min_dur)
        if i + 1 < len(cues):
            cap = cues[i + 1]["start"] + offset - 0.08
            ne = min(ne, max(cap, ns + 0.7))  # نه زودتر از ۰/۷ ثانیه خاموش شود
        out.append({"start": ns, "end": ne, "text": c["text"]})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("srt")
    ap.add_argument("--offset", default="auto", help="'auto' برای اندازه‌گیری از سکوت‌ها یا عدد ثانیه (مثلاً 0.4)")
    ap.add_argument("--min-dur", type=float, default=2.0)
    ap.add_argument("--video", help="ویدیو برای silencedetect (در حالت auto لازم است)")
    ap.add_argument("--out", help="خروجی (پیش‌فرض: جایگزین همان فایل با پشتیبان .orig.srt)")
    args = ap.parse_args()

    src = Path(args.srt)
    cues = parse_srt(src)
    print(f"📄 {len(cues)} کیو از {src}")

    if args.offset == "auto":
        if not args.video:
            sys.exit("❌ حالت auto به --video نیاز دارد")
        silences = detect_silences(Path(args.video))
        print(f"🔇 {len(silences)} سکوت گفتار پیدا شد")
        offset, leads = estimate_offset(cues, silences)
        if leads:
            print(f"📏 جلو بودن‌های مشاهده‌شده: n={len(leads)} | میانه={offset:.2f} | "
                  f"محدوده={leads[0]:.2f}..{leads[-1]:.2f} | چارک‌ها={statistics.quantiles(leads, n=4)}")
        else:
            print("⚠ هیچ سکوت هم‌تراز پیدا نشد؛ offset پیش‌فرض ۰/۳۵")
    else:
        offset = float(args.offset)

    print(f"⏱ شیفت: +{offset:.2f}s | حداقل نمایش: {args.min_dur}s")
    out_cues = retime(cues, offset, args.min_dur)

    durs = [c["end"] - c["start"] for c in out_cues]
    print(f"📊 مدت نمایش: میانگین {statistics.mean(durs):.2f}s (قبلاً {statistics.mean(c['end'] - c['start'] for c in cues):.2f}s)")

    dst = Path(args.out) if args.out else src
    if dst == src:
        backup = src.with_suffix(".orig.srt")
        if not backup.exists():
            backup.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
            print(f"💾 پشتیبان: {backup}")
    write_srt(out_cues, dst)
    print(f"✅ ذخیره شد: {dst}")

    # نمونه برای بازبینی چشمی
    for i in (0, len(out_cues) // 3, len(out_cues) // 2, len(out_cues) - 3):
        c = out_cues[i]
        print(f"   #{i + 1}: {sec2ts(c['start'])} → {sec2ts(c['end'])} | {c['text'][:40]}")


if __name__ == "__main__":
    main()
