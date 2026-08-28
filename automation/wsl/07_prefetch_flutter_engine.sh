#!/usr/bin/env bash
# Puts the Flutter engine artifacts into Gradle's dependency cache.
#
# Flutter's Gradle plugin resolves io.flutter:<abi>_<mode> from the Maven repo
# at storage.googleapis.com/download.flutter.io. Gradle's own resolver gives up
# on "Connection reset" after a couple of tries, which is what killed a build
# that had already finished compiling Dart and merging assets.
#
# Gradle keys each artifact by the SHA-1 of the file itself, so the layout can
# only be built after the download — which is fine, since that is the part that
# needs the retry logic anyway.
#
# Run:  wsl -d Ubuntu -- bash .../07_prefetch_flutter_engine.sh [debug|release|profile]

set -euo pipefail
. "$(dirname "$0")/_lib.sh"

MODE="${1:-debug}"
FLUTTER_DIR="$HOME/opt/flutter"
DL="$HOME/opt/.downloads/engine"
CACHE="$HOME/.gradle/caches/modules-2/files-2.1/io.flutter"
BASE="https://storage.googleapis.com/download.flutter.io/io/flutter"

ENGINE_FILE="$FLUTTER_DIR/bin/internal/engine.version"
[ -f "$ENGINE_FILE" ] || { echo "No $ENGINE_FILE — is Flutter installed?" >&2; exit 1; }
ENGINE=$(tr -d '[:space:]' < "$ENGINE_FILE")
VERSION="1.0.0-$ENGINE"

echo "engine  : $ENGINE"
echo "mode    : $MODE"

# The embedding is shared; the ABI artifacts are what the app actually links.
# All three ABIs are fetched because which ones a build wants depends on the
# device and on whether it is a bundle, and getting them now is cheaper than
# discovering the gap mid-build.
ARTIFACTS=(
  "flutter_embedding_$MODE"
  "armeabi_v7a_$MODE"
  "arm64_v8a_$MODE"
  "x86_64_$MODE"
)

mkdir -p "$DL"

for artifact in "${ARTIFACTS[@]}"; do
  echo
  echo "=== $artifact ==="
  for ext in jar pom; do
    name="$artifact-$VERSION.$ext"
    url="$BASE/$artifact/$VERSION/$name"
    local_file="$DL/$name"

    fetch "$url" "$local_file"

    if [ "$ext" = jar ] && ! verify_archive "$local_file"; then
      echo "  $name is not a valid jar — removing" >&2
      rm -f "$local_file"
      exit 1
    fi

    sha=$(sha1sum "$local_file" | cut -d' ' -f1)
    dest="$CACHE/$artifact/$VERSION/$sha"
    mkdir -p "$dest"
    # Not cp -n: coreutils warns that its behaviour is unstable, and the intent
    # here is simply "leave a cached artifact alone".
    [ -f "$dest/$name" ] || cp "$local_file" "$dest/$name"
    echo "  cached $ext -> ${dest#"$HOME/"}/"
  done
done

echo
echo "Done. Next:"
echo "  wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/03_build_android.sh apk"
