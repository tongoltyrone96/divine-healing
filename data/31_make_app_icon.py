# Builds the app icon from the client's logo.
#
# The icon shipping today is the original green leaf, drawn before she sent
# her logo and before the palette moved from greens to plums. The store would
# have shown one thing and the home screen another, and neither matched the
# app.
#
# The logo's type is dropped on purpose. "by Strawberry Hope" is unreadable
# at 48dp, and Google's icon guidance is against text for that reason — the
# circular tree mark carries the brand on its own.
#
#   python data/31_make_app_icon.py
#
# Writes:
#   store/play/app_icon_512.png                  Play listing
#   divine_healing/assets/logo/app_icon.png      1024, the app's source icon
#   divine_healing/assets/logo/app_icon_adaptive_fg.png
#                                                Android adaptive foreground
#
# Run flutter_launcher_icons afterwards to regenerate the platform sets.

import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "divine_healing", "assets", "logo", "client_logo.png")
LOGO_DIR = os.path.join(ROOT, "divine_healing", "assets", "logo")
PLAY_DIR = os.path.join(ROOT, "store", "play")

# From lib/theme.dart: Blush Mist, the app's own background. A white icon
# would float on a light home screen; this is the colour the app opens to.
BACKGROUND = (0xFC, 0xF5, 0xF8)

# Measured, not guessed: the type block starts around 0.68 of the height,
# where the ink suddenly spans nearly the full width.
MARK_BOTTOM = 0.67


def mark_on_background(size, padding):
    """The circular tree, centred on the brand background.

    `padding` is the share of the canvas left as margin. Android masks the
    icon to a circle or squircle and crops what falls outside, so the mark
    has to sit well inside the frame.
    """
    logo = Image.open(LOGO).convert("RGBA")
    w, h = logo.size
    box = logo.crop((0, 0, w, int(h * MARK_BOTTOM))).getbbox()
    mark = logo.crop(box)

    inner = round(size * (1 - 2 * padding))
    scale = inner / max(mark.size)
    mark = mark.resize(
        (max(1, round(mark.width * scale)), max(1, round(mark.height * scale))),
        Image.LANCZOS,
    )

    canvas = Image.new("RGBA", (size, size), BACKGROUND + (255,))
    canvas.paste(
        mark,
        ((size - mark.width) // 2, (size - mark.height) // 2),
        mark,
    )
    return canvas


def main():
    os.makedirs(PLAY_DIR, exist_ok=True)

    # The launcher icon. 0.10 leaves a normal-looking margin once iOS rounds
    # the corners.
    icon = mark_on_background(1024, 0.10)
    icon.convert("RGB").save(os.path.join(LOGO_DIR, "app_icon.png"), "PNG")
    icon.resize((512, 512), Image.LANCZOS).convert("RGB").save(
        os.path.join(PLAY_DIR, "app_icon_512.png"), "PNG"
    )

    # Android's adaptive foreground is masked to roughly the middle two
    # thirds, so it needs far more air than the plain icon.
    mark_on_background(1024, 0.26).save(
        os.path.join(LOGO_DIR, "app_icon_adaptive_fg.png"), "PNG"
    )

    for path in (
        os.path.join(LOGO_DIR, "app_icon.png"),
        os.path.join(LOGO_DIR, "app_icon_adaptive_fg.png"),
        os.path.join(PLAY_DIR, "app_icon_512.png"),
    ):
        with Image.open(path) as im:
            print(f"  {os.path.relpath(path, ROOT)}  {im.size}  {im.mode}")


if __name__ == "__main__":
    main()
