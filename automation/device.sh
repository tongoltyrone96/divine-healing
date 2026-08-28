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

shot() {
  local name="${1:-shot}"
  mkdir -p "$SHOTS"
  "$ADB" shell screencap /sdcard/_dh.png
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
