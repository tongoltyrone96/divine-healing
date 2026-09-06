#!/usr/bin/env bash
# Captures the Play Store screenshots from a local Android device or emulator.
#
# The CI route was tried first and abandoned. A Linux runner with an emulator
# got as far as installing the APK and then hung — 'detected a hanging thread
# QEMU2 main loop' — after six runs spent on disk space, a missing CMake, a
# system image that would not boot and backslashes the action ate. Building
# here takes under two minutes and the device is already attached.
#
# Android builds still go through WSL: Astrill VPN registers a Winsock LSP
# that crashes Gradle's JVM on Windows. adb is unaffected and runs here.
#
#   automation/wsl/03_build_android.sh apk      # in WSL, first
#   automation/play_screenshots.sh              # then this
#
# The device is resized for the capture and reset afterwards. Play asks for
# phone screenshots and, separately, 7-inch and 10-inch tablet ones, all
# marked required. Two passes cover it:
#
#   phone   1080x1920  density 420
#   tablet  1440x2560  density 320   (9:16, inside both tablet ranges,
#                                     so one set fills both slots)
#
# The tablet pass is worth doing rather than reusing the phone shots: the
# layout genuinely differs — the home screen lays its category cards out
# in two columns.
# 720p is what the emulator ships with; Play accepts it, but it looks poor
# beside the 1320x2868 iPhone set. 1080x1920 is 1.78:1, inside Play's 2:1
# limit — the iPhone screenshots are 2.17:1 and would be rejected here.

set -euo pipefail

ADB="/c/Users/tj199/AppData/Local/Android/Sdk/platform-tools/adb.exe"
APK="E:\\Tasks\\Glide_app\\divine_healing\\build\\app\\outputs\\flutter-apk\\app-debug.apk"
OUT="$(cd "$(dirname "$0")/.." && pwd)/store/play"

DEVICE="${1:-$("$ADB" devices | awk 'NR>1 && $2=="device" {print $1; exit}')}"
if [ -z "$DEVICE" ]; then
  echo "No device. Connect one, or pass its id: $0 <serial> [phone|tablet]" >&2
  exit 1
fi

# The tablet pass used to be described here and done by hand, which meant the
# tablet set quietly went stale while the phone set was regenerated. Both are
# 9:16, so the taps are the phone ones scaled by a single factor.
FORM="${2:-phone}"
case "$FORM" in
  phone)  WIDTH=1080; HEIGHT=1920; DENSITY=420; SCALE=1 ;;
  tablet) WIDTH=1440; HEIGHT=2560; DENSITY=320; SCALE=1.3333; OUT="$OUT/tablet" ;;
  *) echo "Unknown form '$FORM'. Use phone or tablet." >&2; exit 1 ;;
esac
at() { awk -v v="$1" -v s="$SCALE" 'BEGIN{printf "%d", v*s}'; }

shot() {
  # exec-out streams the PNG to stdout. Pulling from /sdcard instead means
  # Git Bash rewrites the remote path into a Windows one and screencap
  # rejects it.
  "$ADB" -s "$DEVICE" exec-out screencap -p > "$OUT/$1.png"
  echo "  $1.png"
}

tap() { "$ADB" -s "$DEVICE" shell input tap "$1" "$2"; sleep "${3:-6}"; }

mkdir -p "$OUT"
echo "Device: $DEVICE   form: $FORM  ${WIDTH}x${HEIGHT}"

"$ADB" -s "$DEVICE" shell wm size "${WIDTH}x${HEIGHT}"
"$ADB" -s "$DEVICE" shell wm density "$DENSITY"
trap '"$ADB" -s "$DEVICE" shell wm size reset; "$ADB" -s "$DEVICE" shell wm density reset' EXIT

# The Play build is signed with the upload key and this one is not, so an
# install over the top is refused for signature mismatch.
"$ADB" -s "$DEVICE" uninstall com.divinehealing.app > /dev/null 2>&1 || true
"$ADB" -s "$DEVICE" install -r "$APK" | tail -1

"$ADB" -s "$DEVICE" shell am start -n com.divinehealing.app/.MainActivity > /dev/null
# The splash holds for a few seconds and then the catalogue loads over the
# network. Capturing early gets the logo on an empty screen.
sleep 25
shot 01-home

# Coordinates, not widget lookups: the bottom bar is three even columns at
# y=1855, and the first session card sits at y=925 on the Library.
tap "$(at 540)" "$(at 1855)" 8
shot 02-library

tap "$(at 900)" "$(at 1855)" 6
shot 04-profile

# The session screen is last. It sits outside the tab shell, so ending here
# means no back navigation is needed.
tap "$(at 540)" "$(at 1855)" 5
tap "$(at 540)" "$(at 925)" 7
shot 03-session

echo "Written to ${OUT#*/Glide_app/}"
