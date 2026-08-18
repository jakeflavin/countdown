#!/usr/bin/env bash
# Turn a generated clip into a seamlessly looping, web-weight scene asset.
#
#   ./scripts/make-scene.sh <input.mp4> <scene-id> <landscape|portrait>
#
# The models have no loop mode, and asking for a clip that ends on its opening frame
# only gets close — close enough to measure, not close enough to watch. So the loop is
# made here instead, and it is exact by construction:
#
#   out = crossfade(A[D-f .. D] -> A[0 .. f]) + A[f .. D-f]
#
# The output opens on the blend of A(D-f) and closes on A(D-f), so the last frame runs
# into the first with nothing to see. It costs f seconds of the clip's length.
set -euo pipefail

input=${1:?usage: make-scene.sh <input.mp4> <scene-id> <landscape|portrait>}
scene=${2:?missing scene id}
orientation=${3:?missing orientation}

out_dir="$(dirname "$0")/../public/scenes"
mkdir -p "$out_dir"
out="$out_dir/$scene-$orientation.mp4"
poster="$out_dir/$scene-$orientation.jpg"

# The overlap. Long enough that a slow scene dissolves invisibly, short enough that it
# does not eat the clip.
fade=1.5

duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$input")
tail_start=$(echo "$duration - $fade" | bc -l)
mid_end=$tail_start

# Only one scene is ever loaded — the chosen one — so the budget per visit is a single
# clip, and these settings keep that around a megabyte. Soft, slow imagery survives a
# high CRF that would show on anything with hard edges.
# The ceiling is what makes the budget hold: a soft scene like a dawn lake comes in far
# under it on quality alone, while a busy one — foliage, falling snow — would otherwise
# spend three megabytes on detail nobody reads behind a clock.
if [ "$orientation" = portrait ]; then
  scale="720:1280"
  crf=31
  maxrate=600k
  bufsize=1200k
else
  scale="1920:1080"
  crf=30
  maxrate=1200k
  bufsize=2400k
fi

ffmpeg -v error -y -i "$input" -filter_complex "
  [0:v]trim=start=${tail_start},setpts=PTS-STARTPTS[tail];
  [0:v]trim=start=0:end=${fade},setpts=PTS-STARTPTS[head];
  [0:v]trim=start=${fade}:end=${mid_end},setpts=PTS-STARTPTS[mid];
  [tail][head]xfade=transition=fade:duration=${fade}:offset=0[seam];
  [seam][mid]concat=n=2:v=1:a=0[joined];
  [joined]scale=${scale}:force_original_aspect_ratio=increase,crop=${scale},fps=24[v]
" -map "[v]" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf $crf -preset slow \
  -maxrate $maxrate -bufsize $bufsize \
  -movflags +faststart -g 48 "$out"

# The poster is the loop's own first frame, so the still the browser paints while the
# video loads is the frame the video starts on.
ffmpeg -v error -y -i "$out" -vframes 1 -q:v 4 "$poster"

echo "$(basename "$out")  $(du -h "$out" | cut -f1)   poster $(du -h "$poster" | cut -f1)"
