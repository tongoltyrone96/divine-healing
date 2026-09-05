#!/usr/bin/env bash
# Builds the Android app from inside WSL.
#
# Windows cannot do this while Astrill VPN is installed — see the header of
# 02_install_toolchain.sh. Run 02 once first; this script only builds.
#
# Run:
#   wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/03_build_android.sh apk
#   wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/03_build_android.sh aab
#
# apk (default) is a debug build for putting on a device to test.
# aab is the release bundle for the Play Store, signed with the upload key.

set -euo pipefail

TARGET="${1:-apk}"

OPT="$HOME/opt"
export JAVA_HOME="$OPT/jdk17"
export ANDROID_HOME="$OPT/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
# Flutter first: WSL inherits the Windows PATH, and /mnt/c/src/flutter holds
# Windows binaries that cannot build anything here.
export PATH="$JAVA_HOME/bin:$OPT/flutter/bin:$ANDROID_HOME/platform-tools:$PATH"

PROJECT=/mnt/e/Tasks/Glide_app/divine_healing
ENV_FILE="$PROJECT/.env"

for required in "$OPT/flutter/bin/flutter" "$JAVA_HOME/bin/java" "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"; do
  if [ ! -x "$required" ]; then
    echo "Missing $required — run 02_install_toolchain.sh first." >&2
    exit 1
  fi
done

cd "$PROJECT"

# .dart_tool/package_config.json records absolute paths into the pub cache,
# so the copy the Windows side leaves behind points at
# C:\Users\...\Pub\Cache and every package "is not a type" here. The two
# operating systems cannot share one, and it is gitignored, so each side
# regenerates it. Cheap once the packages are cached.
echo "Resolving packages for this platform"
# `pub get` alone is not enough: it sees a config that matches the lockfile
# and leaves the Windows paths in place, and the build then fails a minute
# later reading /C:/Users/... from inside WSL. Deleting it first forces the
# rewrite. It is gitignored and costs nothing once packages are cached.
rm -f "$PROJECT/.dart_tool/package_config.json"
flutter pub get

# Same contract as run_local.ps1 on the Windows side: forward only the keys
# lib/config/env.dart declares. .env also holds a live Stripe secret, which is
# for the server-side scripts and must never reach a client build.
DEFINES=()
if [ -f "$ENV_FILE" ]; then
  while IFS= read -r line; do
    line="${line%$'\r'}"
    case "$line" in ''|'#'*) continue ;; esac
    key="${line%%=*}"
    value="${line#*=}"
    [ -z "$value" ] && continue
    case "$key" in
      SUPABASE_URL|SUPABASE_ANON_KEY|REVENUECAT_IOS_KEY|REVENUECAT_ANDROID_KEY)
        DEFINES+=("--dart-define=$key=$value")
        ;;
      *)
        echo "  withheld from the build (server-side only): $key"
        ;;
    esac
  done < "$ENV_FILE"
fi
echo "Forwarding ${#DEFINES[@]} client-safe env vars"

case "$TARGET" in
  apk)
    echo "Building debug APK..."
    flutter build apk --debug "${DEFINES[@]}"
    OUT="build/app/outputs/flutter-apk/app-debug.apk"
    ;;
  aab)
    if [ ! -f android/key.properties ]; then
      echo "android/key.properties is missing — the bundle would be debug-signed" >&2
      echo "and rejected by the Play Store." >&2
      exit 1
    fi
    echo "Building release App Bundle..."
    flutter build appbundle --release "${DEFINES[@]}"
    OUT="build/app/outputs/bundle/release/app-release.aab"
    ;;
  *)
    echo "Unknown target '$TARGET' — expected apk or aab." >&2
    exit 1
    ;;
esac

echo
if [ -f "$OUT" ]; then
  echo "Built $OUT  ($(du -h "$OUT" | cut -f1))"
  echo "Windows path: E:\\Tasks\\Glide_app\\divine_healing\\${OUT//\//\\}"
else
  echo "Build reported success but $OUT is missing." >&2
  exit 1
fi
