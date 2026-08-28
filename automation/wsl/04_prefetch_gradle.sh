#!/usr/bin/env bash
# Downloads the Gradle distribution the wrapper wants, and puts it exactly
# where the wrapper looks for it.
#
# The wrapper fetches this itself, but it has no resume and no retry, and this
# machine's VPN throttles long transfers to zero rather than failing. It got
# 13 MB of a 230 MB distribution in 42 minutes and would not have finished.
# _lib.sh's fetch reconnects and resumes, so the same download completes.
#
# Run once before the first build (or after a Gradle version bump):
#   wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/04_prefetch_gradle.sh

set -euo pipefail
. "$(dirname "$0")/_lib.sh"

PROPS=/mnt/e/Tasks/Glide_app/divine_healing/android/gradle/wrapper/gradle-wrapper.properties
DISTS="$HOME/.gradle/wrapper/dists"

[ -f "$PROPS" ] || { echo "No wrapper properties at $PROPS" >&2; exit 1; }

# distributionUrl is a properties file, so ':' and '=' arrive escaped.
URL=$(sed -n 's/^distributionUrl=//p' "$PROPS" | tr -d '\r' | sed 's/\\:/:/g; s/\\=/=/g')
[ -n "$URL" ] || { echo "No distributionUrl in $PROPS" >&2; exit 1; }

ZIP_NAME="${URL##*/}"                 # gradle-9.3.1-all.zip
DIST_NAME="${ZIP_NAME%.zip}"          # gradle-9.3.1-all

# Gradle names the directory after an MD5 of the distribution URL, rendered in
# base 36 (see PathAssembler.getHash). Computing it means this works on a clean
# machine, not only where the wrapper has already made the directory.
HASH=$(python3 - "$URL" <<'PY'
import hashlib, sys
digest = hashlib.md5(sys.argv[1].encode()).digest()
n = int.from_bytes(digest, 'big')
digits = '0123456789abcdefghijklmnopqrstuvwxyz'
out = ''
while n:
    n, r = divmod(n, 36)
    out = digits[r] + out
print(out or '0')
PY
)

TARGET_DIR="$DISTS/$DIST_NAME/$HASH"
TARGET="$TARGET_DIR/$ZIP_NAME"

echo "distribution : $URL"
echo "target       : $TARGET"

if [ -d "$TARGET_DIR/$DIST_NAME" ] || [ -f "$TARGET_DIR/${ZIP_NAME}.ok" ]; then
  echo "Already unpacked — nothing to do."
  exit 0
fi

mkdir -p "$TARGET_DIR"
# The wrapper leaves these behind when it is interrupted, and a stale lock
# makes the next run wait on a download that is no longer happening.
rm -f "$TARGET_DIR/${ZIP_NAME}.lck" "$TARGET_DIR/${ZIP_NAME}.part"

echo
fetch "$URL" "$TARGET"

if ! verify_archive "$TARGET"; then
  echo "Downloaded file is not a valid zip — removing it." >&2
  rm -f "$TARGET"
  exit 1
fi

echo
echo "In place. The wrapper will unpack it on the next build:"
echo "  wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/03_build_android.sh apk"
