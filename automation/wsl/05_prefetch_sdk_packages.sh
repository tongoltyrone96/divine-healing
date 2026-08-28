#!/usr/bin/env bash
# Installs Android SDK packages by hand, because sdkmanager cannot download
# them on this machine.
#
# sdkmanager has no resume and no retry, so it dies on the VPN throttle the
# same way Gradle's wrapper did — the build got as far as configuring :app and
# then failed pulling android-ndk-r28c-linux.zip, which is close to a gigabyte.
# This resolves the archive URL from Google's manifest, downloads it with the
# retry logic in _lib.sh, and unpacks it where the SDK expects.
#
# The NDK is not optional here: package:jni arrives as a transitive dependency
# and compiles dartjni.c through CMake, so AGP needs a real toolchain.
#
# Packages are named name/version rather than sdkmanager's name;version: the
# semicolon survives neither PowerShell nor bash on the way through wsl.exe,
# and gets read as a command separator. The slash form also matches the
# directory the package installs into.
#
# Run:
#   wsl -d Ubuntu -- bash .../05_prefetch_sdk_packages.sh ndk/28.2.13676358
#   wsl -d Ubuntu -- bash .../05_prefetch_sdk_packages.sh cmake/3.22.1
#
# Safe to re-run: a package whose source.properties is already in place is
# skipped.

set -euo pipefail
. "$(dirname "$0")/_lib.sh"

SDK_DIR="$HOME/opt/android-sdk"
DL="$HOME/opt/.downloads"
MANIFEST="$DL/repository2-3.xml"

[ $# -ge 1 ] || { echo "usage: $0 <name>/<version> [...]" >&2; exit 1; }

mkdir -p "$DL"
# Always refresh: a cached manifest can predate the package being asked for.
rm -f "$MANIFEST"
echo "Fetching Google's package manifest"
fetch "https://dl.google.com/android/repository/repository2-3.xml" "$MANIFEST"

for PKG in "$@"; do
  NAME="${PKG%%/*}"
  VERSION="${PKG#*/}"
  SDK_PATH="$NAME;$VERSION"        # what the manifest calls it
  DEST="$SDK_DIR/$NAME/$VERSION"

  echo
  echo "=== $PKG ==="
  if [ -f "$DEST/source.properties" ]; then
    echo "  already installed at $DEST"
    continue
  fi

  URL_PATH=$(python3 - "$MANIFEST" "$SDK_PATH" <<'PY'
import sys, xml.etree.ElementTree as ET
manifest, want = sys.argv[1], sys.argv[2]
root = ET.parse(manifest).getroot()
for pkg in root.iter('remotePackage'):
    if pkg.get('path') != want:
        continue
    for archive in pkg.iter('archive'):
        host = archive.find('host-os')
        # Some packages are host-agnostic and carry no host-os element.
        if host is not None and host.text != 'linux':
            continue
        url = archive.find('complete/url')
        if url is not None:
            print(url.text)
            sys.exit(0)

# Naming these is far more useful than "not found" when a version has been
# retired or mistyped.
family = want.split(';')[0] + ';'
available = sorted(
    p.get('path') for p in root.iter('remotePackage')
    if (p.get('path') or '').startswith(family)
)
sys.exit(
    f'{want} is not in the manifest. Available: ' +
    (', '.join(available) if available else '(none)')
)
PY
)
  echo "  archive: $URL_PATH"

  ZIP="$DL/$(basename "$URL_PATH")"
  fetch "https://dl.google.com/android/repository/$URL_PATH" "$ZIP"

  if ! verify_archive "$ZIP"; then
    echo "  downloaded file is not a valid zip — removing" >&2
    rm -f "$ZIP"
    exit 1
  fi

  echo "  extracting"
  STAGE=$(mktemp -d)
  python3 - "$ZIP" "$STAGE" <<'PY'
import os, stat, sys, zipfile

src, dest = sys.argv[1], sys.argv[2]

with zipfile.ZipFile(src) as z:
    for info in z.infolist():
        mode = info.external_attr >> 16
        target = os.path.join(dest, info.filename)

        # zipfile has no idea about symlinks and writes them out as ordinary
        # files whose contents are the link target. The NDK ships clang as a
        # link to clang-19, so getting this wrong produces a "compiler" that is
        # a one-line text file, and the build fails with
        # "clang: 1: clang-19: not found" — which points nowhere near the cause.
        if stat.S_ISLNK(mode):
            os.makedirs(os.path.dirname(target), exist_ok=True)
            if os.path.lexists(target):
                os.remove(target)
            os.symlink(z.read(info).decode(), target)
            continue

        z.extract(info, dest)
        # The mode is dropped too, and an NDK whose compilers and linkers are
        # not executable installs perfectly and then cannot build anything.
        if mode:
            os.chmod(target, stat.S_IMODE(mode))
PY

  # These archives wrap everything in a single directory (android-ndk-r28c,
  # cmake-3.22.1-linux-x86_64); the SDK wants the contents, not the wrapper.
  mkdir -p "$(dirname "$DEST")"
  rm -rf "$DEST"
  entries=("$STAGE"/*)
  if [ "${#entries[@]}" -eq 1 ] && [ -d "${entries[0]}" ]; then
    mv "${entries[0]}" "$DEST"
  else
    mv "$STAGE" "$DEST"
    STAGE=""
  fi
  [ -n "$STAGE" ] && rm -rf "$STAGE"

  if [ ! -f "$DEST/source.properties" ]; then
    echo "  warning: $DEST has no source.properties — the SDK may not see it" >&2
  else
    echo "  installed: $(grep -m1 '^Pkg.Revision' "$DEST/source.properties")"
  fi
done

echo
echo "Done. Next:"
echo "  wsl -d Ubuntu -- bash /mnt/e/Tasks/Glide_app/automation/wsl/03_build_android.sh apk"
