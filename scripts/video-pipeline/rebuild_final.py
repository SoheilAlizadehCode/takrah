#!/usr/bin/env python3
"""بازساخت final.mp4 از fa.srt اصلاح‌شده — reshape (bidi) + burn (ffmpeg).
   preset/crf از argv: [preset] [crf] — پیش‌فرض ultrafast/23 (سندباکس ۲ هسته‌ای)."""
import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent.parent))          # /home/z/my-project/scripts
sys.path.insert(0, str(HERE))
import pipeline                                      # noqa: E402

preset = sys.argv[1] if len(sys.argv) > 1 else "ultrafast"
crf = sys.argv[2] if len(sys.argv) > 2 else "23"
pipeline.FORCE_STYLE = pipeline.FORCE_STYLE          # همان استایل

OUT = HERE / "out" / "E3xKmcHBOzY"

print("۱) آماده‌سازی bidi (fa.srt → fa-visual.srt)")
fa_visual = pipeline.reshape_srt(OUT / "fa.srt", OUT / "fa-visual.srt")
print()
print(f"۲) چسباندن زیرنویس روی ویدیو (preset={preset}, crf={crf})")
vf = f"subtitles={fa_visual}:fontsdir={pipeline.FONTS}:force_style='{pipeline.FORCE_STYLE}'"
final = OUT / "final.mp4"
pipeline.run(["ffmpeg", "-nostdin", "-y", "-i", OUT / "source.mp4", "-vf", vf,
              "-c:v", "libx264", "-preset", preset, "-crf", crf,
              "-c:a", "copy", final])
print(f"\n✅ {final} ({final.stat().st_size / 1_000_000:.1f} MB)")
