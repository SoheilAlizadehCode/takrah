#!/usr/bin/env python3
"""
QA همگامی زیرنویس با ASR — تک‌راه
برای چند کیوی منتخب: صدای [شروع_جدید-1s ، +4s] استخراج، با ASR پیاده می‌شود
و چک می‌کنیم جملهٔ انگلیسیِ همان کیو واقعاً در همین پنجره گفته می‌شود یا جملهٔ قبلی/بعدی.
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from retiming import parse_srt  # noqa: E402

ROOT = Path("/home/z/my-project")
OUT = ROOT / "scripts/video-pipeline/out/E3xKmcHBOzY"
TMP = Path("/tmp/qa-sync")
TMP.mkdir(exist_ok=True)


def extract_wav(video: Path, start: float, dur: float, dst: Path):
    subprocess.run(
        ["ffmpeg", "-nostdin", "-y", "-ss", f"{start:.2f}", "-t", f"{dur:.2f}", "-i", str(video),
         "-vn", "-ac", "1", "-ar", "16000", str(dst)],
        check=True, capture_output=True, timeout=120,
    )


def asr(wav: Path) -> str:
    out = wav.with_suffix(".json")
    subprocess.run(["z-ai", "asr", "--file", str(wav), "--output", str(out)],
                   check=True, capture_output=True, timeout=180)
    data = json.loads(out.read_text(encoding="utf-8"))
    return (data.get("text") or data.get("result") or json.dumps(data, ensure_ascii=False)).strip()


def norm(s: str) -> str:
    return "".join(c.lower() for c in s if c.isalnum() or c.isspace()).split()


def ngram_in(ngram: list[str], words: list[str]) -> bool:
    if len(ngram) < 3:
        return False
    for i in range(len(words) - len(ngram) + 1):
        if words[i:i + len(ngram)] == ngram:
            return True
    return False


def main():
    en = parse_srt(OUT / "en.srt")
    fa = parse_srt(OUT / "fa.srt")
    video = OUT / "source.mp4"
    picks = [6, 14, 22, 34, 46, 54]
    print(f"{'کیو':<5}{'شروع جدید':<10}{'نتیجهٔ همگامی':<22}جملهٔ انگلیسی کیو")
    for k in picks:
        cue_en = norm(en[k]["text"])
        head = cue_en[:4]                      # ۴ کلمهٔ اول جمله
        T = fa[k]["start"] + 0.15              # لحظه‌ای که متن تازه ظاهر شده
        wav = TMP / f"s{k}.wav"
        extract_wav(video, max(0, T - 1.0), 5.0, wav)
        try:
            text = asr(wav)
        except Exception as e:
            print(f"#{k+1:<4}{T:<10.2f}{'ASR خطا':<22}{e}")
            continue
        w = norm(text)
        prev = ngram_in(norm(en[k - 1]["text"])[-5:], w) if k > 0 else False
        cur = ngram_in(head, w)
        nxt = ngram_in(norm(en[k + 1]["text"])[:4], w) if k + 1 < len(en) else False
        if cur:
            verdict = "✅ منطبق"
        elif prev and not cur:
            verdict = "⏰ هنوز جملهٔ قبلی (زیرنویس جلو)"
        elif nxt:
            verdict = "🐌 جملهٔ بعدی (زیرنویس عقب)"
        else:
            verdict = "❓ نامشخص"
        print(f"#{k+1:<4}{T:<10.2f}{verdict:<22}{en[k]['text'][:55]}")
        print(f"     ASR: {text[:110]}")


if __name__ == "__main__":
    main()
