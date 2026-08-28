#!/usr/bin/env bash
# Drive the app on a connected Android device and grab screenshots.
#
# Android builds happen in WSL (see automation/wsl/), but adb runs on the
# Windows side, where the device actually is — Astrill's Winsock LSP breaks
# Gradle's JVM sockets, not adb's native ones.
#
# Usage:
#   bash automation/device.sh shot <name>        screenshot -> reference/screenshots/device/<name>.png
#   bash automation/device.sh tap <x> <y> [name] tap, then screenshot
#   bash automation/device.sh key <KEYCODE> [name]
#   bash automation/device.sh swipe <x1> <y1> <x2> <y2> [name]
#   bash automation/device.sh audio                is anything playing?
#   bash automation/device.sh log <pattern>        recent matching logcat lines
#
# Coordinates are in device pixels (1080x2640 on the test phone), not the
# scaled-down coordinates of whatever you are viewing a screenshot in.

set -uo pipefail
export MSYS_NO_PATHCONV=1   # stop Git Bash rewriting /sdcard/... into C:\...

ADB="/c/Users/tj199/AppData/Local/Android/Sdk/platform-tools/adb.exe"
PKG=com.divinehealing.app
SHOTS="$(dirname "$0")/../reference/screenshots/device"
SETTLE=2.5   # let an animation finish before capturing

# This phone reports two displays, and screencap warns that its default "is
# not guaranteed to be consistent across captures". It is not: several
# captures came back as an 8 KB black frame from the second display while the
# app was plainly running on the first, which reads exactly like a crash. Pick
# the display with actual content rather than trusting the default.
display_id() {
  local best="" best_size=0 id size
  for id in $("$ADB" shell dumpsys SurfaceFlinger --display-id 2>/dev/null                 | grep -oE 'Display [0-9]+' | grep -oE '[0-9]+'); do
    "$ADB" shell screencap -d "$id" /sdcard/_probe.png >/dev/null 2>&1
    size=$("$ADB" shell stat -c %s /sdcard/_probe.png 2>/dev/null | tr -d '')
    [ -n "$size" ] && [ "$size" -gt "$best_size" ] && { best="$id"; best_size="$size"; }
  done
  "$ADB" shell rm -f /sdcard/_probe.png >/dev/null 2>&1
  echo "$best"
}

DISPLAY_ID="${DH_DISPLAY_ID:-}"

shot() {
  local name="${1:-shot}"
  mkdir -p "$SHOTS"
  [ -z "$DISPLAY_ID" ] && DISPLAY_ID=$(display_id)
  "$ADB" shell screencap -d "$DISPLAY_ID" /sdcard/_dh.png
  "$ADB" pull -a /sdcard/_dh.png "$SHOTS/$name.png" >/dev/null 2>&1
  "$ADB" shell rm -f /sdcard/_dh.png
  echo "  -> reference/screenshots/device/$name.png"
}

case "${1:-}" in
  shot)
    shot "${2:-shot}"
    ;;
  tap)
    "$ADB" shell input tap "$2" "$3"
    sleep "$SETTLE"
    [ -n "${4:-}" ] && shot "$4"
    ;;
  key)
    "$ADB" shell input keyevent "$2"
    sleep "$SETTLE"
    [ -n "${3:-}" ] && shot "$3"
    ;;
  swipe)
    "$ADB" shell input swipe "$2" "$3" "$4" "$5" 300
    sleep "$SETTLE"
    [ -n "${6:-}" ] && shot "$6"
    ;;
  audio)
    # The authoritative answer to "is it still playing" once the app is in the
    # background and there is nothing on screen to look at.
    echo "=== active players ==="
    "$ADB" shell dumpsys media.audio_flinger 2>/dev/null \
      | grep -iE 'active|state' | head -8
    echo "=== media sessions ==="
    "$ADB" shell dumpsys media_session 2>/dev/null \
      | grep -iE "$PKG|state=PlaybackState|package=" | head -12
    echo "=== foreground services ==="
    "$ADB" shell dumpsys activity services "$PKG" 2>/dev/null \
      | grep -iE 'ServiceRecord|isForeground|foreground=' | head -8
    ;;
  log)
    "$ADB" logcat -d -t 400 | grep -iE "${2:-flutter}" | tail -25
    ;;
  *)
    sed -n '2,20p' "$0"
    exit 1
    ;;
esac
