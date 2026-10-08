#!/bin/bash
# AGHF Video Merge
#
# Puts each voiceover into its matching intro video, without re-rendering.
#
# Folder layout (next to this file):
#   Videos/   the intro videos (.mp4), subfolders are fine
#   Audio/    the voiceovers (.mp3, .m4a or .wav), subfolders are fine
#   Music/    optional: one soft background track, played under every
#             video, looped if it's short, faded in and out. It can be an
#             audio file (.mp3) or a video (.mp4, .mov): only its sound is used.
#   Final/    finished videos are saved here (created for you)
#
# A video and its voiceover match by file name:
#   Videos/p6-lesson-1.mp4  +  Audio/p6-lesson-1.mp3  ->  Final/p6-lesson-1.mp4
# Capital letters don't matter. Spaces are fine.
#
# Run it: open Terminal, type "bash " (with a space), drag this file into
# the window, press Enter. Run it again any time: finished videos are
# skipped unless their video, voiceover, music or the settings below changed.

# Background music volume, in percent of the music file's own loudness.
# 100 plays it exactly as saved. Lower it if the music competes with your
# voice, raise it if you can't hear it.
MUSIC_VOLUME=100

cd "$(dirname "$0")" || exit 1
HERE="$(pwd)"
SELF="$HERE/$(basename "$0")"
VIDEOS="$HERE/Videos"
AUDIO="$HERE/Audio"
FINAL="$HERE/Final"
MUSICDIR="$HERE/Music"
TOOLS="$HERE/.tools"

say() { printf '%s\n' "$*"; }
line() { say "------------------------------------------------------------"; }

line
say "AGHF Video Merge"
line

if [ ! -d "$VIDEOS" ] || [ ! -d "$AUDIO" ]; then
  mkdir -p "$VIDEOS" "$AUDIO"
  say "I made the Videos and Audio folders next to this file."
  say "Put your .mp4 videos in Videos and your voiceovers in Audio, then run me again."
  exit 0
fi
mkdir -p "$FINAL" "$MUSICDIR"

# ---- find ffmpeg (installs a private copy the first time) ----
FFMPEG="$(command -v ffmpeg || true)"
[ -z "$FFMPEG" ] && [ -x "$TOOLS/ffmpeg" ] && FFMPEG="$TOOLS/ffmpeg"
for p in /opt/homebrew/bin/ffmpeg /usr/local/bin/ffmpeg; do
  [ -z "$FFMPEG" ] && [ -x "$p" ] && FFMPEG="$p"
done
if [ -z "$FFMPEG" ]; then
  say "First run: downloading ffmpeg, the free tool that does the merging (about 80 MB)..."
  mkdir -p "$TOOLS"
  case "$(uname -m)" in
    arm64) ARCH=arm64 ;;
    *) ARCH=amd64 ;;
  esac
  for URL in "https://ffmpeg.martin-riedl.de/redirect/latest/macos/$ARCH/release/ffmpeg.zip" \
             "https://evermeet.cx/ffmpeg/getrelease/zip"; do
    if curl -fL --progress-bar -o "$TOOLS/ffmpeg.zip" "$URL" \
       && unzip -oq "$TOOLS/ffmpeg.zip" -d "$TOOLS" && chmod +x "$TOOLS/ffmpeg" \
       && "$TOOLS/ffmpeg" -version >/dev/null 2>&1; then
      FFMPEG="$TOOLS/ffmpeg"
      break
    fi
  done
  rm -f "$TOOLS/ffmpeg.zip"
  if [ -z "$FFMPEG" ] && command -v brew >/dev/null; then
    say "Trying Homebrew instead..."
    brew install ffmpeg && FFMPEG="$(command -v ffmpeg)"
  fi
  if [ -z "$FFMPEG" ]; then
    say "I couldn't install ffmpeg. Check your internet connection and run me again."
    exit 1
  fi
  xattr -d com.apple.quarantine "$FFMPEG" 2>/dev/null
  say "ffmpeg is ready."
fi

lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

# All voiceovers, as "lowercase-name<TAB>full path" lines.
AUDIO_LIST="$(mktemp)"
trap 'rm -f "$AUDIO_LIST"' EXIT
find "$AUDIO" -type f \( -iname '*.mp3' -o -iname '*.m4a' -o -iname '*.wav' -o -iname '*.aac' \) ! -name '._*' -print0 |
while IFS= read -r -d '' a; do
  b="$(basename "$a")"
  printf '%s\t%s\n' "$(lower "${b%.*}")" "$a"
done > "$AUDIO_LIST"

# Background music: the first audio or video file in Music/, if any.
# For a video, only its sound is used.
MUSIC="$(find "$MUSICDIR" -type f \( -iname '*.mp3' -o -iname '*.m4a' -o -iname '*.wav' -o -iname '*.aac' \
  -o -iname '*.mp4' -o -iname '*.mov' -o -iname '*.m4v' \) ! -name '._*' 2>/dev/null | sort | head -n 1)"
if [ -n "$MUSIC" ] && ! "$FFMPEG" -nostdin -i "$MUSIC" 2>&1 | grep -q 'Audio:'; then
  say "The file in Music ($(basename "$MUSIC")) has no sound, so I'll skip background music."
  MUSIC=""
fi
if [ -n "$MUSIC" ]; then
  say "Background music: $(basename "$MUSIC") at ${MUSIC_VOLUME}% volume"
else
  say "No background music (add an mp3 or a video to the Music folder if you want some)."
fi
MVOL="$(awk -v p="$MUSIC_VOLUME" 'BEGIN { printf "%.3f", p / 100 }')"

# Length of a file in seconds, read from ffmpeg's own report.
duration() {
  "$FFMPEG" -nostdin -i "$1" 2>&1 | awk -F'[:, ]+' '/Duration:/ { print $3*3600 + $4*60 + $5; exit }'
}

made=0; skipped=0; missing=0; failed=0
MISSING_NAMES=""; FAILED_NAMES=""

while IFS= read -r -d '' v; do
  rel="${v#$VIDEOS/}"
  name="$(basename "$v")"
  stem="${name%.*}"
  key="$(lower "$stem")"
  a="$(awk -F '\t' -v k="$key" '$1 == k { print $2; exit }' "$AUDIO_LIST")"
  if [ -z "$a" ]; then
    missing=$((missing+1)); MISSING_NAMES="$MISSING_NAMES
  $rel"
    continue
  fi
  out="$FINAL/${rel%.*}.mp4"
  # Redo it if the video, voiceover, music or these settings changed since.
  if [ -f "$out" ] && [ "$out" -nt "$v" ] && [ "$out" -nt "$a" ] && [ "$out" -nt "$SELF" ] \
     && { [ -z "$MUSIC" ] || [ "$out" -nt "$MUSIC" ]; }; then
    skipped=$((skipped+1))
    continue
  fi
  mkdir -p "$(dirname "$out")"
  say "Merging $rel"
  # Video is copied as is. Voiceover becomes AAC, padded with silence so the
  # finished file is exactly as long as the video. Music (if any) loops
  # quietly underneath, fading in over 1s and out over the last 2s.
  if [ -n "$MUSIC" ]; then
    len="$(duration "$v")"
    fo="$(awk -v d="$len" 'BEGIN { s = d - 2; if (s < 0) s = 0; printf "%.2f", s }')"
    set -- -i "$v" -i "$a" -stream_loop -1 -i "$MUSIC" \
      -filter_complex "[1:a]apad[vo];[2:a]volume=$MVOL,afade=t=in:d=1,afade=t=out:st=$fo:d=2[mu];[vo][mu]amix=inputs=2:duration=first:normalize=0[mix]" \
      -map 0:v:0 -map "[mix]" -t "$len"
  else
    set -- -i "$v" -i "$a" -map 0:v:0 -map 1:a:0 -af apad -shortest
  fi
  if "$FFMPEG" -nostdin -loglevel error -y "$@" \
       -c:v copy -c:a aac -b:a 192k -movflags +faststart "$out.part.mp4"; then
    mv -f "$out.part.mp4" "$out"
    made=$((made+1))
  else
    rm -f "$out.part.mp4"
    failed=$((failed+1)); FAILED_NAMES="$FAILED_NAMES
  $rel"
  fi
done < <(find "$VIDEOS" -type f -iname '*.mp4' ! -name '._*' -print0 | sort -z)

line
say "Done."
say "  Merged now:            $made"
say "  Already done, skipped: $skipped"
say "  Waiting on voiceover:  $missing"
[ "$failed" -gt 0 ] && say "  Failed:                $failed"
if [ "$missing" -gt 0 ]; then
  say ""
  say "No voiceover with the same name yet:$MISSING_NAMES"
fi
if [ "$failed" -gt 0 ]; then
  say ""
  say "These didn't merge (the files may still be downloading from Drive, try again):$FAILED_NAMES"
fi
say ""
say "Finished videos are in: $FINAL"
line
