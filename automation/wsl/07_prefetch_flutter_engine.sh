#!/usr/bin/env bash
# Mirrors the Flutter engine artifacts locally so Gradle stops downloading them.
#
# Flutter resolves io.flutter:<abi>_<mode> from the Maven repo at
# storage.googleapis.com/download.flutter.io. Gradle's resolver gives up on
# "Connection reset" and "Read timed out" after a couple of tries, which killed
# two builds that had already compiled Dart and merged assets.
#
# An earlier version of this dropped the files straight into Gradle's
# modules-2/files-2.1 cache and the build downloaded them anyway: that cache is
# keyed by a metadata index, and files with no descriptor behind them are not
# cache hits. So this builds a real Maven repository instead, and points the
# build at it through the flutterEngineRepo Gradle property.
#
# That property is written to ~/.gradle/gradle.properties rather than into the
# project, so a machine-specific path never reaches the repository, and
# android/build.gradle.kts simply ignores the whole thing where it is unset.
#
# Run:  wsl -d Ubuntu -- bash .../07_prefetch_flutter_engine.sh [debug|release|profile]

set -euo pipefail
. "$(dirname "$0")/_lib.sh"

MODE="${1:-debug}"
FLUTTER_DIR="$HOME/opt/flutter"
DL="$HOME/opt/.downloads/engine"
REPO="$HOME/opt/flutter-engine-repo"
GRADLE_PROPS="$HOME/.gradle/gradle.properties"
BASE="https://storage.googleapis.com/download.flutter.io/io/flutter"

ENGINE_FILE="$FLUTTER_DIR/bin/internal/engine.version"
[ -f "$ENGINE_FILE" ] || { echo "No $ENGINE_FILE — is Flutter installed?" >&2; exit 1; }
ENGINE=$(tr -d '[:space:]' < "$ENGINE_FILE")
VERSION="1.0.0-$ENGINE"

echo "engine  : $ENGINE"
echo "mode    : $MODE"
echo "repo    : $REPO"

# The embedding is shared; the ABI artifacts are what the app links against.
# All three, because which are needed depends on the device and on apk versus
# bundle, and finding the gap mid-build costs more than fetching them now.
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
  dest="$REPO/io/flutter/$artifact/$VERSION"
  mkdir -p "$dest"

  for ext in jar pom; do
    name="$artifact-$VERSION.$ext"

    if [ -s "$dest/$name" ]; then
      echo "  already mirrored: $name"
      continue
    fi

    fetch "$BASE/$artifact/$VERSION/$name" "$DL/$name"

    if [ "$ext" = jar ] && ! verify_archive "$DL/$name"; then
      echo "  $name is not a valid jar — removing" >&2
      rm -f "$DL/$name"
      exit 1
    fi

    cp "$DL/$name" "$dest/$name"
    # Gradle verifies these when a module declares them, and generating them
    # from the file we actually have is the only way they can agree.
    sha1sum "$dest/$name" | cut -d' ' -f1 > "$dest/$name.sha1"
    md5sum  "$dest/$name" | cut -d' ' -f1 > "$dest/$name.md5"
    echo "  mirrored $name"
  done
done

# --- point the build at the mirror ----------------------------------------
mkdir -p "$(dirname "$GRADLE_PROPS")"
touch "$GRADLE_PROPS"
if grep -q '^flutterEngineRepo=' "$GRADLE_PROPS"; then
  sed -i "s|^flutterEngineRepo=.*|flutterEngineRepo=file://$REPO|" "$GRADLE_PROPS"
  echo
  echo "Updated flutterEngineRepo in $GRADLE_PROPS"
else
  {
    echo ""
    echo "# Local mirror of the Flutter engine artifacts, written by"
    echo "# automation/wsl/07_prefetch_flutter_engine.sh. Read by"
    echo "# android/build.gradle.kts; harmless to delete once the network is"
    echo "# dependable, at the cost of downloading them again."
    echo "flutterEngineRepo=file://$REPO"
  } >> "$GRADLE_PROPS"
  echo
  echo "Added flutterEngineRepo to $GRADLE_PROPS"
fi

echo
echo "Done. Next:"
echo "  wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/03_build_android.sh apk"
