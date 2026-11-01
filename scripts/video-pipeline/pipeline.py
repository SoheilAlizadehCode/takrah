#!/usr/bin/env python3
"""
پایپ‌لاین تولید پست ویدیویی تک‌راه 🎬
=====================================

از یک لینک یوتیوب، ویدیوی آمادهٔ پست تلگرام می‌سازد:
  ۱) دانلود ویدیو (720p) + زیرنویس انگلیسی با yt-dlp
  ۲) ترجمهٔ زیرنویس به فارسی با GLM (node translate.mjs subs)
  ۳) چسباندن زیرنویس فارسی روی ویدیو با ffmpeg (فونت وزیرمتن)
  ۴) تولید عنوان و خلاصهٔ فارسی برای کپشن پست (node translate.mjs post)
  ۵) ساخت فایل نهایی post.txt — کپی کن و بفرست کانال

استفاده:
  python3 pipeline.py <youtube-url> [--out DIR] [--limit-seconds N] [--no-burn]
                      [--cookies cookies.txt] [--download-only]

نکتهٔ یوتیوب: اگر خط «Sign in to confirm you're not a bot» دیدی، با افزونهٔ
«Get cookies.txt LOCALLY» از مرورگرت فایل کوکی takrah-top.txt بگیر و با
--cookies بده. دانلود با IP خانگی معمولاً بدون کوکی هم جواب می‌دهد.

خروجی در پوشهٔ out/<video-id>/:
  final.mp4      ویدیوی زیرنویس‌دار فارسی (آمادهٔ ارسال به تلگرام)
  post.txt       متن کامل پست (عنوان + خلاصه + اعتبار منبع + لینک‌ها)
  fa.srt / en.srt  زیرنویس‌ها (برای ویرایش دستی و استفادهٔ مجدد)
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]          # /home/z/my-project
HERE = Path(__file__).parent
FONTS = ROOT / "scripts" / "fonts"                  # Vazirmatn-Regular/Bold.ttf

FORCE_STYLE = (
    "FontName=Vazirmatn,FontSize=20,PrimaryColour=&H00FFFFFF,"
    "OutlineColour=&H00151515,BackColour=&H60000000,"
    "BorderStyle=1,Outline=2,Shadow=1,MarginV=30,Spacing=0.2,WrapStyle=0"
)


def run(cmd, **kw):
    print(f"  ▶ {' '.join(str(c) for c in cmd[:6])} ...")
    subprocess.run([str(c) for c in cmd], check=True, **kw)


# ─── پیش‌پردازش bidi فارسی ───
# libass با اینکه fribidi دارد، اینجا متن RTL را درست مرتب نمی‌کند؛
# پس متن را قبل از رندر به «ترتیب دیداری» تبدیل می‌کنیم
# (arabic-reshaper فرم‌های متصل + python-bidi ترتیب). وزیرمتن این فرم‌ها را دارد.

def _wrap(text: str, width: int = 50) -> list[str]:
    lines, cur = [], ""
    for w in text.split():
        if cur and len(cur) + len(w) + 1 > width:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines


def reshape_srt(src: Path, dst: Path) -> Path:
    try:
        import arabic_reshaper
        from bidi.algorithm import get_display
    except ImportError:
        run([sys.executable, "-m", "pip", "install", "-q", "arabic-reshaper", "python-bidi"])
        import arabic_reshaper
        from bidi.algorithm import get_display

    out = []
    for line in src.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if "-->" in line or stripped.isdigit() or not stripped:
            out.append(line)
            continue
        visual = "\n".join(
            get_display(arabic_reshaper.reshape(seg)) for seg in _wrap(stripped)
        )
        out.append(visual)
    dst.write_text("\n".join(out) + "\n", encoding="utf-8")
    return dst


def video_id(url: str) -> str:
    m = re.search(r"(?:v=|youtu\.be/|shorts/|embed/)([\w-]{6,})", url)
    return m.group(1) if m else re.sub(r"[^a-zA-Z0-9-]", "_", url)[-40:]


def download(url: str, outdir: Path, cookies: str | None = None) -> tuple[Path, dict]:
    """دانلود ویدیو + زیرنویس انگلیسی؛ خروجی (مسیر ویدیو، متادیتا، زیرنویس)"""
    cmd = [
        "yt-dlp",
        "-f", "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/b[height<=480]/b",
        "--merge-output-format", "mp4",
        "--write-auto-subs", "--write-subs",
        "--sub-langs", "en.*,en",
        "--sub-format", "srt/vtt/best",
        "--convert-subs", "srt",
        "--write-info-json",
        "--no-playlist",
        "-o", str(outdir / "source.%(ext)s"),
    ]
    if cookies:
        cmd += ["--cookies", cookies]
    cmd.append(url)
    run(cmd)

    vids = sorted(p for p in outdir.glob("source.*") if p.suffix.lower() in {".mp4", ".webm", ".mkv", ".mov"})
    if not vids:
        raise RuntimeError("ویدیو دانلود نشد — لینک یا دسترسی یوتیوب را بررسی کن")
    video = vids[0]

    info_file = outdir / "source.info.json"
    meta = {}
    if info_file.exists():
        raw = json.loads(info_file.read_text(encoding="utf-8"))
        meta = {
            "title": raw.get("title") or video.stem,
            "channel": raw.get("channel") or raw.get("uploader") or "",
            "url": raw.get("webpage_url") or url,
            "duration": raw.get("duration") or 0,
        }

    subs = sorted(outdir.glob("source.*.srt")) + sorted(outdir.glob("source.srt"))
    if not subs:
        raise RuntimeError(
            "زیرنویس انگلیسی پیدا نشد. ویدیوهایی که زیرنویس خودکار ندارند فعلاً پشتیبانی نمی‌شوند — "
            "ویدیوی دیگری انتخاب کن (اکثر ویدیوهای یوتیوب زیرنویس خودکار دارند)."
        )
    return video, meta, subs[0]


def limit_duration(video: Path, seconds: int, outdir: Path) -> Path:
    cut = outdir / "source-cut.mp4"
    run(["ffmpeg", "-y", "-i", video, "-t", seconds, "-c", "copy", cut])
    return cut


def burn_subs(video: Path, srt: Path, outdir: Path) -> Path:
    final = outdir / "final.mp4"
    vf = f"subtitles={srt}:fontsdir={FONTS}:force_style='{FORCE_STYLE}'"
    try:
        run(["ffmpeg", "-y", "-i", video, "-vf", vf,
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
             "-c:a", "copy", final])
    except subprocess.CalledProcessError:
        print("  ⚠ کپی صدا ممکن نشد؛ با انکود AAC دوباره تلاش می‌کنم")
        run(["ffmpeg", "-y", "-i", video, "-vf", vf,
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
             "-c:a", "aac", "-b:a", "128k", final])
    return final


def make_post_text(meta: dict, post: dict) -> str:
    tags = post.get("hashtags", [])
    if isinstance(tags, str):
        # مدل گاهی هشتگ‌ها را به‌صورت یک رشتهٔ پیوسته برمی‌گرداند
        tags = [t for t in tags.replace("#", " #").split() if t.startswith("#")]
    tags = [t if t.startswith("#") else f"#{t}" for t in tags]
    hashtags = " ".join(dict.fromkeys(
        ["#هوش_مصنوعی", "#درآمد_اینترنتی", *tags]
    ))
    credit_channel = f" — {meta['channel']}" if meta.get("channel") else ""
    return (
        f"{post.get('title', meta.get('title', ''))}\n\n"
        f"{post.get('summary', '')}\n\n"
        f"🎬 منبع ویدیو: {meta.get('title', '')}{credit_channel}\n"
        f"🔗 لینک کامل: {meta.get('url', '')}\n"
        f"✍️ ترجمه و زیرنویس فارسی: تک‌راه\n\n"
        f"━━━━━━━━━━━━━━━━\n"
        f"🤖 هوش مصنوعی + درآمد، هر روز در تک‌راه\n"
        f"📢 تلگرام: @takrahTop  |  🌐 وبلاگ: takrah.top\n\n"
        f"{hashtags}\n"
    )


def main():
    ap = argparse.ArgumentParser(description="پایپ‌لاین پست ویدیویی تک‌راه")
    ap.add_argument("url", help="لینک یوتیوب")
    ap.add_argument("--out", help="پوشهٔ خروجی (پیش‌فرض: scripts/video-pipeline/out/<id>)")
    ap.add_argument("--limit-seconds", type=int, help="فقط N ثانیهٔ اول ویدیو (برای تست سریع)")
    ap.add_argument("--no-burn", action="store_true", help="زیرنویس را روی ویدیو نچسبان (فقط srt و پست)")
    ap.add_argument("--cookies", help="فایل cookies.txt مرورگر برای دور زدن محدودیت یوتیوب")
    ap.add_argument("--download-only", action="store_true", help="فقط دانلود — ادامهٔ کار بعداً/بعداً")
    ap.add_argument("--from-srt", action="store_true",
                    help="بدون دانلود مجدد — ادامه از source.mp4 و en.srt موجود در پوشهٔ خروجی")
    args = ap.parse_args()

    vid = video_id(args.url)
    outdir = Path(args.out) if args.out else HERE / "out" / vid
    outdir.mkdir(parents=True, exist_ok=True)

    print(f"\n🎬 پایپ‌لاین تک‌راه — ویدیو: {vid}")
    print(f"   پوشهٔ خروجی: {outdir}\n")

    if args.from_srt:
        video = outdir / "source.mp4"
        en_srt = outdir / "en.srt"
        if not video.exists() or not en_srt.exists():
            print("\n❌ حالت --from-srt به source.mp4 و en.srt در پوشهٔ خروجی نیاز دارد")
            sys.exit(1)
        meta = {}
        info_file = outdir / "source.info.json"
        if info_file.exists():
            raw = json.loads(info_file.read_text(encoding="utf-8"))
            meta = {
                "title": raw.get("title") or video.stem,
                "channel": raw.get("channel") or raw.get("uploader") or "",
                "url": raw.get("webpage_url") or args.url,
                "duration": raw.get("duration") or 0,
            }
        print(f"۱) ادامه از فایل‌های موجود — «{meta.get('title', '?')}»")
    else:
        print("۱) دانلود ویدیو و زیرنویس انگلیسی")
        video, meta, en_srt = download(args.url, outdir, args.cookies)
        en_srt = en_srt.rename(outdir / "en.srt")
        print(f"   ✔ {video.name} — «{meta.get('title', '?')}»")
        if args.download_only:
            print(f"   ✅ حالت download-only — فایل‌ها در: {outdir}")
            print("   (برای ادامهٔ ترجمه و ساخت ویدیو، همین پوشه را برای من بفرست)")
            return
    print()

    if args.limit_seconds:
        print(f"۰.۵) برش به {args.limit_seconds} ثانیهٔ اول")
        video = limit_duration(video, args.limit_seconds, outdir)

    print("۲) ترجمهٔ زیرنویس به فارسی")
    fa_srt = outdir / "fa.srt"
    run(["node", HERE / "translate.mjs", "subs", en_srt, fa_srt], cwd=ROOT)
    print()

    print("۳) تولید عنوان و خلاصهٔ پست")
    post_json = outdir / "post.json"
    run(["node", HERE / "translate.mjs", "post", fa_srt, meta.get("title", ""), post_json], cwd=ROOT)
    post = json.loads(post_json.read_text(encoding="utf-8")) if post_json.exists() else {}
    print()

    final = video
    if not args.no_burn:
        print("۴) آماده‌سازی bidi و چسباندن زیرنویس فارسی روی ویدیو")
        fa_visual = reshape_srt(fa_srt, outdir / "fa-visual.srt")
        final = burn_subs(video, fa_visual, outdir)

    (outdir / "post.txt").write_text(make_post_text(meta, post), encoding="utf-8")
    meta["video_id"] = vid
    (outdir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    size_mb = final.stat().st_size / 1_000_000
    print(f"\n✅ تمام شد! ({size_mb:.1f} مگابایت)")
    print(f"   🎥 ویدیو:      {final}")
    print(f"   📝 متن پست:    {outdir / 'post.txt'}  ← کپی کن و بفرست کانال")
    if final != video:
        print("   💡 قبل از ارسال، ۲۰ ثانیه اول ویدیو را ببین تا از کیفیت زیرنویس مطمئن شوی")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        print(f"\n❌ یکی از مراحل شکست خورد (کد {e.returncode})")
        sys.exit(1)
    except (RuntimeError, FileNotFoundError) as e:
        print(f"\n❌ {e}")
        sys.exit(1)
