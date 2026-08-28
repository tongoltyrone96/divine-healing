#!/usr/bin/env bash
# Reports whether this WSL distro can build the Android app.
#
# Android builds cannot run on the Windows side: Astrill VPN registers
# ASProxy64.dll as a Winsock LSP, which is injected into every process that
# opens a socket. Gradle's daemon IPC goes over a localhost socket, so the JVM
# either crashes outright (sun.nio.ch.WEPoll.ctl) or fails with "An operation
# was attempted on something that is not a socket". WSL2 has its own Linux
# network stack and no Winsock, so the build works here.
#
# Run:  wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/01_check.sh

set -uo pipefail

echo "=== distro ==="
. /etc/os-release && echo "  $PRETTY_NAME"
echo "  user: $(whoami)   cores: $(nproc)   mem: $(free -h | awk 'NR==2{print $2}')"
echo "  free space on \$HOME: $(df -h "$HOME" | awk 'NR==2{print $4}')"

echo
echo "=== network (the reason we are here — must all be 2xx/3xx) ==="
probe() {
  local url="$1"
  local code
  code=$(curl -s -m 25 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null) || code="ERR"
  printf '  %-56s %s\n' "$url" "$code"
}
probe https://dl.google.com/android/repository/repository2-3.xml
probe https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json
probe https://services.gradle.org/distributions/
probe https://repo.maven.apache.org/maven2/

echo
echo "=== toolchain ==="
for c in java javac unzip zip curl git xz python3 sdkmanager flutter dart adb; do
  printf '  %-10s %s\n' "$c" "$(command -v "$c" 2>/dev/null || echo '- not installed')"
done

echo
echo "=== project visible from WSL? ==="
PROJECT=/mnt/e/Tasks/Glide_app/divine_healing
if [ -f "$PROJECT/pubspec.yaml" ]; then
  echo "  OK  $PROJECT"
else
  echo "  MISSING  $PROJECT"
fi
