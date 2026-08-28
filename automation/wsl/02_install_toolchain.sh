#!/usr/bin/env bash
# Installs a complete Android build toolchain inside WSL, without sudo.
#
# Why WSL: Astrill VPN registers ASProxy64.dll as a Winsock LSP, so it is
# injected into every Windows process that opens a socket. Gradle's daemon IPC
# runs over a localhost socket, so on Windows the JVM either dies outright
# (EXCEPTION_ILLEGAL_INSTRUCTION in sun.nio.ch.WEPoll.ctl) or fails with "An
# operation was attempted on something that is not a socket". WSL2 has its own
# Linux network stack and no Winsock, so builds work here untouched.
#
# Why no sudo: this account needs a password for it, and these tools do not
# need to be system-wide. Everything lands in ~/opt, which also means nothing
# outside this script has to be undone if the VPN situation changes.
#
# Run:  wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/02_install_toolchain.sh
# Safe to re-run: each step is skipped if its target already exists.

set -euo pipefail

OPT="$HOME/opt"
JDK_DIR="$OPT/jdk17"
FLUTTER_DIR="$OPT/flutter"
SDK_DIR="$OPT/android-sdk"
DL="$OPT/.downloads"

# Matches the Windows install so both sides build the same thing.
FLUTTER_VERSION="3.47.1"
# From FlutterExtension.kt in that release.
COMPILE_SDK="36"
BUILD_TOOLS="36.0.0"

mkdir -p "$OPT" "$DL"

say() { printf '\n=== %s ===\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

# Large transfers over this machine's VPN run for a while and then throttle to
# zero rather than failing outright — the Flutter archive is 1.5 GB and each
# attempt moves ~100 MB before the connection goes quiet. So: resume into a
# .part file, treat a minute under 1 KB/s as a dead connection instead of
# waiting out curl's own two-hour timeout, and keep reconnecting.
#
# Attempts are only "wasted" when they move no bytes at all. Counting those
# separately is what distinguishes a slow link, which will finish, from a URL
# that is never going to return anything.
fetch() { # fetch <url> <dest>
  local url="$1" dest="$2" attempt before after stuck=0
  if [ -s "$dest" ]; then
    echo "  cached: $(basename "$dest")"
    return
  fi
  for attempt in $(seq 1 80); do
    before=$(stat -c %s "$dest.part" 2>/dev/null || echo 0)
    if curl -fL --no-progress-meter             -C -             --connect-timeout 30             --speed-limit 1024 --speed-time 60             -o "$dest.part" "$url"; then
      mv "$dest.part" "$dest"
      echo "  got $(du -h "$dest" | cut -f1) in $attempt attempt(s)"
      return
    fi
    after=$(stat -c %s "$dest.part" 2>/dev/null || echo 0)
    if [ "$after" -gt "$before" ]; then
      stuck=0
      echo "  $(numfmt --to=iec "$after") so far — reconnecting"
    else
      stuck=$((stuck + 1))
      echo "  no progress ($stuck/6) at $(numfmt --to=iec "$after") — reconnecting"
      if [ "$stuck" -ge 6 ]; then
        echo "  six attempts moved nothing; the link is not coming back" >&2
        return 1
      fi
    fi
    sleep 10
  done
  echo "  gave up after 80 attempts on $url" >&2
  return 1
}

# Downloads that stop early still leave a valid-looking file, so archives are
# checked before anything is extracted from them.
verify_archive() { # verify_archive <file>
  case "$1" in
    *.tar.xz) xz -t "$1" 2>/dev/null ;;
    *.tar.gz) gzip -t "$1" 2>/dev/null ;;
    *.zip)    python3 -c "import sys,zipfile; sys.exit(0 if zipfile.is_zipfile(sys.argv[1]) else 1)" "$1" ;;
    *)        return 0 ;;
  esac
}

# unzip is not installed and installing it needs sudo. Python is present, and
# its zipfile module is enough — it just does not preserve the executable bit,
# so callers chmod what they need afterwards.
unzip_to() { # unzip_to <zip> <dir>
  python3 - "$1" "$2" <<'PY'
import sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
    z.extractall(sys.argv[2])
PY
}

# ---------------------------------------------------------------- JDK 17 ----
say "JDK 17"
if [ -x "$JDK_DIR/bin/javac" ]; then
  echo "  already installed: $("$JDK_DIR/bin/java" -version 2>&1 | head -1)"
else
  fetch "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse" \
        "$DL/jdk17.tar.gz"
  verify_archive "$DL/jdk17.tar.gz" || { echo "  jdk17.tar.gz is truncated" >&2; rm -f "$DL/jdk17.tar.gz"; exit 1; }
  rm -rf "$JDK_DIR" && mkdir -p "$JDK_DIR"
  tar -xzf "$DL/jdk17.tar.gz" -C "$JDK_DIR" --strip-components=1
  echo "  installed: $("$JDK_DIR/bin/java" -version 2>&1 | head -1)"
fi
export JAVA_HOME="$JDK_DIR"
export PATH="$JAVA_HOME/bin:$PATH"

# -------------------------------------------------------- Android SDK ------
say "Android command-line tools"
CMDLINE="$SDK_DIR/cmdline-tools/latest"
if [ -x "$CMDLINE/bin/sdkmanager" ]; then
  echo "  already installed"
else
  # The zip's filename carries a build number that changes, so read the
  # current one out of Google's repository manifest rather than pinning a URL
  # that quietly 404s later.
  echo "  resolving current cmdline-tools from Google's manifest"
  fetch "https://dl.google.com/android/repository/repository2-3.xml" "$DL/repository2-3.xml"
  CMDLINE_ZIP=$(python3 - "$DL/repository2-3.xml" <<'PY'
import sys, xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
best = None
for pkg in root.iter('remotePackage'):
    if pkg.get('path') != 'cmdline-tools;latest':
        continue
    for archive in pkg.iter('archive'):
        host = archive.find('host-os')
        if host is None or host.text != 'linux':
            continue
        url = archive.find('complete/url')
        if url is not None:
            best = url.text
if not best:
    sys.exit('cmdline-tools;latest not found for linux in the manifest')
print(best)
PY
)
  echo "  -> $CMDLINE_ZIP"
  fetch "https://dl.google.com/android/repository/$CMDLINE_ZIP" "$DL/cmdline-tools.zip"
  rm -rf "$SDK_DIR/cmdline-tools"
  mkdir -p "$SDK_DIR/cmdline-tools/_tmp"
  unzip_to "$DL/cmdline-tools.zip" "$SDK_DIR/cmdline-tools/_tmp"
  mv "$SDK_DIR/cmdline-tools/_tmp/cmdline-tools" "$CMDLINE"
  rmdir "$SDK_DIR/cmdline-tools/_tmp"
  chmod +x "$CMDLINE"/bin/*
  echo "  installed"
fi

export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
export PATH="$CMDLINE/bin:$SDK_DIR/platform-tools:$PATH"

say "Android SDK packages"
# yes | ... because the licence prompts read from stdin and this runs headless.
yes | sdkmanager --sdk_root="$SDK_DIR" --licenses >/dev/null 2>&1 || true
sdkmanager --sdk_root="$SDK_DIR" \
  "platform-tools" \
  "platforms;android-$COMPILE_SDK" \
  "build-tools;$BUILD_TOOLS"
echo "  installed platform-tools, platforms;android-$COMPILE_SDK, build-tools;$BUILD_TOOLS"

# ------------------------------------------------------------- Flutter -----
say "Flutter $FLUTTER_VERSION (linux)"
if [ -x "$FLUTTER_DIR/bin/flutter" ]; then
  echo "  already installed"
else
  fetch "https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz" \
        "$DL/flutter.tar.xz"
  verify_archive "$DL/flutter.tar.xz" || { echo "  flutter.tar.xz is truncated" >&2; rm -f "$DL/flutter.tar.xz"; exit 1; }
  rm -rf "$FLUTTER_DIR"
  tar -xJf "$DL/flutter.tar.xz" -C "$OPT"
  echo "  installed"
fi
export PATH="$FLUTTER_DIR/bin:$PATH"

# The repo lives on /mnt/e and is also used from Windows, so git sees it as
# owned by another user and refuses to read it.
git config --global --add safe.directory /mnt/e/Tasks/Glide_app 2>/dev/null || true
git config --global --add safe.directory "$FLUTTER_DIR" 2>/dev/null || true

say "Wiring flutter to this SDK"
flutter config --android-sdk "$SDK_DIR" --no-analytics >/dev/null
yes | flutter doctor --android-licenses >/dev/null 2>&1 || true

# ---------------------------------------------------------------- PATH -----
say "Shell profile"
PROFILE="$HOME/.bashrc"
MARKER="# --- Divine Healing Android toolchain ---"
if grep -qF "$MARKER" "$PROFILE" 2>/dev/null; then
  echo "  already on PATH in $PROFILE"
else
  cat >> "$PROFILE" <<EOF

$MARKER
# Installed by automation/wsl/02_install_toolchain.sh. Flutter must come before
# /mnt/c/src/flutter: WSL inherits the Windows PATH, and those are Windows
# binaries that cannot build anything here.
export JAVA_HOME="$JDK_DIR"
export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
export PATH="\$JAVA_HOME/bin:$FLUTTER_DIR/bin:$CMDLINE/bin:$SDK_DIR/platform-tools:\$PATH"
EOF
  echo "  added to $PROFILE"
fi

say "flutter doctor"
flutter doctor -v 2>&1 | sed -n '1,40p'

say "Done"
echo "  JDK      $JDK_DIR"
echo "  Flutter  $FLUTTER_DIR"
echo "  Android  $SDK_DIR"
echo
echo "  Next: bash /mnt/e/Tasks/Glide_app/automation/wsl/03_build_android.sh"
