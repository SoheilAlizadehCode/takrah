# رندر لوگوی تک‌راه برای App Logo کنسول گوگل (OAuth Branding)
# خروجی: download/takrah-oauth-logo.png (512×512، گوشه گرد برند) + نسخه پشتیبان تمام‌مربع
import cairosvg
from PIL import Image
import io, os

BASE = "/home/z/my-project"
SRC = open(f"{BASE}/public/logo.svg", encoding="utf-8").read()

def render(svg_text: str, size: int) -> Image.Image:
    png = cairosvg.svg2png(bytestring=svg_text.encode("utf-8"), output_width=size, output_height=size)
    img = Image.open(io.BytesIO(png)).convert("RGBA")
    # downsampling نرم برای لبه‌های تمیز
    big = Image.new("RGBA", (size * 2, size * 2), (0, 0, 0, 0))
    im = img.resize((size * 2, size * 2), Image.LANCZOS) if img.size != (size * 2, size * 2) else img
    big.alpha_composite(im)
    return big.resize((size, size), Image.LANCZOS)

os.makedirs(f"{BASE}/download", exist_ok=True)

# ۱) نسخه اصلی: همان لوگوی برند (مربع گرد + شفاف در گوشه‌ها)
main = render(SRC, 512)
main.save(f"{BASE}/download/takrah-oauth-logo.png", optimize=True)

# ۲) نسخه پشتیبان: تمام‌مربع بدون گوشه گرد (اگر گوگل داخل دایره نمایش داد لبه‌ها کامل بمانند)
square = render(SRC.replace('rx="16"', 'rx="0"'), 512)
square.save(f"{BASE}/download/takrah-oauth-logo-square.png", optimize=True)

# ۳) نسخه ۱۲۰ دقیق (اگر آپلودر سخت‌گیر بود)
render(SRC, 120).save(f"{BASE}/download/takrah-oauth-logo-120.png", optimize=True)

for f in ["takrah-oauth-logo.png", "takrah-oauth-logo-square.png", "takrah-oauth-logo-120.png"]:
    p = f"{BASE}/download/{f}"
    im = Image.open(p)
    print(f"{f}: {im.size}, {os.path.getsize(p)} bytes")
