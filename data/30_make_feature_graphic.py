# Builds the 1024x500 feature graphic Google Play requires.
#
# Play will not accept a store listing without one, and unlike the App Store
# there is no equivalent to fall back on — it is the banner shown above the
# screenshots. Generating it here means it tracks the brand colours in
# theme.dart rather than living in someone's design file.
#
#   python data/30_make_feature_graphic.py
#
# Writes divine_healing/assets/store/feature_graphic.png.

import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, "divine_healing")
OUT_DIR = os.path.join(APP, "assets", "store")
OUT = os.path.join(OUT_DIR, "feature_graphic.png")

W, H = 1024, 500

# From lib/theme.dart. The palette moved from greens to plums when the client
# supplied her logo; the names in theme.dart still say green.
BLUSH_MIST = (0xFC, 0xF5, 0xF8)
SOFT_LAVENDER = (0xE9, 0xD5, 0xEA)
DEEP_PLUM = (0x5B, 0x3A, 0x5E)
ROSE_PURPLE = (0x8B, 0x5A, 0x8C)

PLAYFAIR = os.path.join(APP, "assets", "fonts", "PlayfairDisplay-Variable.ttf")
NUNITO = os.path.join(APP, "assets", "fonts", "Nunito-Variable.ttf")
LOGO = os.path.join(APP, "assets", "logo", "client_logo.png")


def gradient(width, height, top, bottom):
    """A vertical wash. Play crops the graphic on some layouts, so the ends
    stay close in tone and nothing important sits near an edge."""
    base = Image.new("RGB", (1, height))
    px = base.load()
    for y in range(height):
        t = y / (height - 1)
        px[0, y] = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
    return base.resize((width, height), Image.BICUBIC)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    canvas = gradient(W, H, BLUSH_MIST, SOFT_LAVENDER)
    draw = ImageDraw.Draw(canvas)

    logo = Image.open(LOGO).convert("RGBA")
    size = 340
    logo = logo.resize((size, size), Image.LANCZOS)
    logo_x, logo_y = 96, (H - size) // 2
    canvas.paste(logo, (logo_x, logo_y), logo)

    text_x = logo_x + size + 72
    title = ImageFont.truetype(PLAYFAIR, 76)
    body = ImageFont.truetype(NUNITO, 30)

    # Two lines, matching the app's own hero, so the store and the first
    # screen say the same thing.
    draw.text((text_x, 168), "Heal. Grow.", font=title, fill=DEEP_PLUM)
    draw.text((text_x, 246), "Awaken.", font=title, fill=DEEP_PLUM)
    draw.text(
        (text_x, 344),
        "Guided meditation, shadow work,\nchakra healing and Reiki",
        font=body,
        fill=ROSE_PURPLE,
        spacing=10,
    )

    canvas.save(OUT, "PNG")
    print(f"  wrote {os.path.relpath(OUT, ROOT)}  ({W}x{H})")


if __name__ == "__main__":
    main()
