#!/usr/bin/env bash
# Shared download helpers for the WSL scripts.
#
# Every large download on this machine goes through Astrill, and the failure
# mode is always the same: the transfer runs for 100-150 MB and then throttles
# to zero rather than erroring, so a plain curl sits at 0 bytes/sec until its
# own timeout hours later. The Flutter archive took 221 MB -> 1.5 GB across
# dozens of reconnects with this; Gradle's own wrapper, which has no retry
# logic, managed 13 MB of a 230 MB distribution in 42 minutes.

# Resumes into a .part file and keeps reconnecting.
#
# Attempts that move bytes are not counted as failures — that distinction is
# the whole point. A slow link makes progress every attempt and will finish; a
# dead one moves nothing, and only then is there any reason to stop.
fetch() { # fetch <url> <dest>
  local url="$1" dest="$2" attempt before after stuck=0
  if [ -s "$dest" ]; then
    echo "  cached: $(basename "$dest")"
    return
  fi
  mkdir -p "$(dirname "$dest")"
  for attempt in $(seq 1 80); do
    before=$(stat -c %s "$dest.part" 2>/dev/null || echo 0)
    if curl -fL --no-progress-meter \
            -C - \
            --connect-timeout 30 \
            --speed-limit 1024 --speed-time 60 \
            -o "$dest.part" "$url"; then
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

# A download that stops early still leaves a file that looks fine, so archives
# are checked before anything is extracted from them.
verify_archive() { # verify_archive <file>
  case "$1" in
    *.tar.xz) xz -t "$1" 2>/dev/null ;;
    *.tar.gz) gzip -t "$1" 2>/dev/null ;;
    *.zip)    python3 -c "import sys,zipfile; sys.exit(0 if zipfile.is_zipfile(sys.argv[1]) else 1)" "$1" ;;
    *)        return 0 ;;
  esac
}
