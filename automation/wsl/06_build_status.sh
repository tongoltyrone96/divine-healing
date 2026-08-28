#!/usr/bin/env bash
# Is the Android build working, or hung?
#
# Gradle keeps printing a progress bar and the JVM stays alive either way, so
# the console cannot tell you. Two things can: whether the daemon is accruing
# real CPU time, and whether anything under build/ has been written recently.
#
# "Real" matters. A JVM blocked on a socket still burns a tick or two on GC and
# heartbeats, so any-CPU-at-all reads as working and hides exactly the state
# worth catching. Compiling on twelve cores is hundreds of ticks per second;
# the threshold below sits far above idle noise and far below real work.
#
# Run:  wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/06_build_status.sh

set -uo pipefail

BUILD_DIR=/mnt/e/Tasks/Glide_app/divine_healing/build
JSTACK="$HOME/opt/jdk17/bin/jstack"
SAMPLE_SECONDS=6
# 100 ticks = one core-second. Waiting on the network never reaches this.
BUSY_TICKS=100

PIDS=$(pgrep -f 'GradleDaemon|gradlew|kotlin-compiler' || true)
if [ -z "$PIDS" ]; then
  echo "No build running."
  APK="$BUILD_DIR/app/outputs/flutter-apk/app-debug.apk"
  AAB="$BUILD_DIR/app/outputs/bundle/release/app-release.aab"
  for out in "$APK" "$AAB"; do
    [ -f "$out" ] && echo "  present: $out ($(du -h "$out" | cut -f1), $(date -r "$out" '+%H:%M:%S'))"
  done
  exit 0
fi

# CPU time is in clock ticks since the process started, so two samples a few
# seconds apart say whether it is running or blocked.
cpu_ticks() { awk '{print $14 + $15}' "/proc/$1/stat" 2>/dev/null || echo 0; }

declare -A BEFORE
for pid in $PIDS; do BEFORE[$pid]=$(cpu_ticks "$pid"); done
sleep "$SAMPLE_SECONDS"

echo "=== CPU over ${SAMPLE_SECONDS}s (busy at ${BUSY_TICKS}+ ticks) ==="
TOTAL=0
for pid in $PIDS; do
  delta=$(( $(cpu_ticks "$pid") - ${BEFORE[$pid]} ))
  TOTAL=$(( TOTAL + delta ))
  if [ "$delta" -ge "$BUSY_TICKS" ]; then
    state=working
  elif [ "$delta" -gt 0 ]; then
    state="barely — probably waiting"
  else
    state=idle
  fi
  printf '  pid %-7s %4s ticks  %s\n' "$pid" "$delta" "$state"
done
BUSY=0
[ "$TOTAL" -ge "$BUSY_TICKS" ] && BUSY=1

echo
echo "=== files written under build/ in the last 2 minutes ==="
RECENT=$(find "$BUILD_DIR" -newermt '-2 minutes' -type f 2>/dev/null | wc -l)
echo "  $RECENT"

echo
if [ "$BUSY" -eq 1 ] || [ "$RECENT" -gt 0 ]; then
  echo "BUILDING — leave it alone."
  exit 0
fi

echo "HUNG — no CPU and no writes. Where it is parked:"
for pid in $PIDS; do
  "$JSTACK" "$pid" 2>/dev/null \
    | grep -E 'socketRead|SocketInputStream|downloadNative|LegacyDownloader|installRemotePackages|Http' \
    | head -5 | sed 's/^/  /'
done
exit 1
