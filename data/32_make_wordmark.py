# Retypesets the one line of the client's logo that says DIVINE HEALING.
#
# The client renamed the app to Divine Awakening and asked for the logo to
# match, with everything else left alone. So this touches one horizontal band
# and nothing more: the tree, "by Strawberry Hope", the leaf ornaments and the
# divider below are copied through untouched, pixel for pixel.
#
#   python data/32_make_wordmark.py            # writes a preview, changes nothing
#   python data/32_make_wordmark.py --apply
#
# The original is kept at client_logo_original.png on the first apply, so the
# old wordmark can be put back without going to her designer.
#
# The app icon does not need regenerating: 31_make_app_icon.py crops the type
# off at 0.67 of the height and keeps only the circular mark.

import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "divine_healing", "assets", "logo", "client_logo.png")
BACKUP = os.path.join(
    ROOT, "divine_healing", "assets", "logo", "client_logo_original.png"
)
FONT = os.path.join(
    ROOT, "divine_healing", "assets", "fonts", "PlayfairDisplay-Variable.ttf"
)
PREVIEW = os.path.join(ROOT, "store", "wordmark_preview.png")

TEXT = "DIVINE AWAKENING"

# Measured from the original, not guessed. `--apply` re-measures and asserts
# these still hold, so a different source image fails loudly rather than
# painting over the tree.
BAND_TOP, BAND_BOTTOM = 864, 951      # ink extent of DIVINE HEALING
CLEAR_TOP, CLEAR_BOTTOM = 830, 975    # erased, with room for antialiasing
OLD_WIDTH = 1035                      # 111..1145, centred on the canvas

APPLY = "--apply" in sys.argv


def _is_ink(pixel):
    """Dark and actually drawn.

    The logo is artwork on transparency, so RGB alone is meaningless where
    nothing was painted: a fully transparent pixel can hold any colour.
    """
    if len(pixel) == 4:
        r, g, b, a = pixel
        if a < 100:
            return False
    else:
        r, g, b = pixel
    return r < 170 and g < 170


def ink_extent(im, top, bottom):
    """Bounding box of the dark pixels in a horizontal band."""
    px = im.load()
    w, _ = im.size
    xs, ys = [], []
    for y in range(top, bottom + 1):
        for x in range(w):
            if _is_ink(px[x, y]):
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def ink_colour(im, top, bottom):
    """Average of the darkest pixels, so antialiased edges do not lighten it."""
    px = im.load()
    w, _ = im.size
    core = [
        px[x, y][:3]
        for y in range(top, bottom + 1)
        for x in range(w)
        if _is_ink(px[x, y]) and sum(px[x, y][:3]) < 220
    ]
    n = len(core)
    return tuple(sum(c[i] for c in core) // n for i in range(3))


def render(draw, font, text, tracking, colour, centre_x, baseline):
    """Draw letter by letter so the tracking of the original can be matched."""
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = centre_x - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, baseline), ch, font=font, fill=colour, anchor="ls")
        x += w + tracking
    return total


def measure(font, text, tracking, colour, size):
    """Ink box of the text as it would be drawn, on a scratch canvas."""
    scratch = Image.new("RGB", size, (255, 255, 255))
    d = ImageDraw.Draw(scratch)
    render(d, font, text, tracking, colour, size[0] / 2, size[1] * 0.75)
    box = ink_extent(scratch, 0, size[1] - 1)
    return box


def main():
    src = Image.open(BACKUP if os.path.exists(BACKUP) else LOGO)
    # RGBA throughout. Flattening to RGB fills the transparent surround with
    # the file's own near-white, and the logo then sits on the app's blush
    # background as a visible pale rectangle — which is exactly what the
    # first version of this script shipped.
    im = src.convert("RGBA")
    w, h = im.size

    box = ink_extent(im, BAND_TOP, BAND_BOTTOM)
    if box is None:
        raise SystemExit("No wordmark found in the expected band.")
    x0, y0, x1, y1 = box
    width = x1 - x0 + 1
    print(f"  found wordmark   x {x0}..{x1}  y {y0}..{y1}  width {width}")
    if abs(width - OLD_WIDTH) > 40:
        raise SystemExit(
            f"Expected a wordmark about {OLD_WIDTH}px wide, found {width}. "
            "The source image is not the one this was measured against."
        )

    colour = ink_colour(im, BAND_TOP, BAND_BOTTOM)
    corner = im.getpixel((2, 2))
    print(f"  ink colour       {colour}")
    print(f"  corner alpha     {corner[3]}")

    cap_height = y1 - y0 + 1
    centre_x = (x0 + x1) / 2
    baseline = y1  # caps sit on the baseline; there are no descenders here

    # AWAKENING is two letters longer than HEALING, so holding the cap height
    # would push the line past the edge of the canvas. Hold the width instead
    # and let the letters come down a little — the line stays the same shape
    # on the page, which is what reads as "the same logo".
    target_width = width
    # Derived rather than guessed: Playfair at the original's 88px cap height
    # sets DIVINE HEALING 945px wide, and the original line is 1035, so the
    # designer's letterspacing works out at 0.058 of the size. A first guess
    # of 0.13 looked generous and cost the new line seven pixels of height.
    tracking_ratio = 0.058
    size = cap_height * 1.4
    for _ in range(40):
        font = ImageFont.truetype(FONT, int(round(size)))
        got = measure(font, TEXT, size * tracking_ratio, colour, (w * 2, 400))
        if got is None:
            break
        got_width = got[2] - got[0] + 1
        if abs(got_width - target_width) <= 2:
            break
        size *= target_width / got_width
    font = ImageFont.truetype(FONT, int(round(size)))
    tracking = size * tracking_ratio
    got = measure(font, TEXT, tracking, colour, (w * 2, 400))
    new_cap = got[3] - got[1] + 1
    print(f"  font size        {int(round(size))}  tracking {tracking:.1f}")
    print(f"  cap height       {cap_height} -> {new_cap}")

    out = im.copy()
    d = ImageDraw.Draw(out)
    d.rectangle([0, CLEAR_TOP, w, CLEAR_BOTTOM], fill=(0, 0, 0, 0))
    render(d, font, TEXT, tracking, colour + (255,), centre_x, baseline)

    # Everything outside the erased band has to be untouched. Checking it is
    # cheap and catches a mis-measured band before it reaches the client.
    a, b = im.tobytes(), out.tobytes()
    row = w * 4
    changed = [
        y for y in range(h)
        if a[y * row:(y + 1) * row] != b[y * row:(y + 1) * row]
    ]
    print(f"  rows changed     {min(changed)}..{max(changed)}")
    if min(changed) < CLEAR_TOP or max(changed) > CLEAR_BOTTOM:
        raise SystemExit("Pixels changed outside the wordmark band — refusing.")

    if not APPLY:
        os.makedirs(os.path.dirname(PREVIEW), exist_ok=True)
        out.save(PREVIEW)
        print("")
        print(f"Preview written to {os.path.relpath(PREVIEW, ROOT)}")
        print("Re-run with --apply to replace the logo.")
        return

    if not os.path.exists(BACKUP):
        src.save(BACKUP)
        print(f"  original kept    {os.path.relpath(BACKUP, ROOT)}")
    out.save(LOGO)
    print(f"  written          {os.path.relpath(LOGO, ROOT)}")


if __name__ == "__main__":
    main()
