# Scene assets

Each theme is a calming scene that loops behind the time. A scene is four files in
`public/scenes`:

```
<id>-landscape.mp4   1920x1080, ~800 KB
<id>-landscape.jpg   poster, the clip's own first frame
<id>-portrait.mp4    720x1280, ~400 KB
<id>-portrait.jpg    poster
```

Only the chosen scene is ever loaded, so a visit costs one clip.

## Why the loop is made here, not by the model

No model in the Higgsfield catalogue has a loop mode. Passing the same still as both
`start_image` and `end_image` gets close, but only close: measured on the first pass,
the last frame scored SSIM 0.950 against the first, where two genuinely different
frames of the same clip scored 0.923. That gap is a visible jump every time the video
restarts.

`make-scene.sh` closes it by construction. Given a clip `A` of length `D` and an
overlap `f`:

```
out = crossfade(A[D-f .. D] -> A[0 .. f]) + A[f .. D-f]
```

The output opens on `A(D-f)` and closes on `A(D-f)`, so the last frame runs into the
first with nothing to see. It costs `f` seconds of length — a 12s clip becomes a 10.5s
loop.

## Producing a scene

1. Generate the anchor still, framed for the orientation — open, uncluttered in the
   centre, since the time sits there. Locked-off camera, no people, no text.
2. Generate the clip from that still as **both** `start_image` and `end_image`, silent,
   12s, 1080p landscape / 720p portrait. Motion should be slow and ambient; anything
   that enters or leaves the frame cannot loop.
3. Run each through the script:

```bash
./scripts/make-scene.sh ~/Downloads/tide-landscape.mp4 tide landscape
./scripts/make-scene.sh ~/Downloads/tide-portrait.mp4 tide portrait
```

4. Add the scene to `themes.ts` with colours sampled from it: `base` is its average
   colour, `scrim` is the wash that keeps the time legible over it, and `text` /
   `muted` / `surface` / `border` are the chrome on top.

## Checking a loop

Compare the seam against how much two adjacent frames differ in normal playback. If the
seam is close to that baseline, it is as smooth as the rest of the clip:

```bash
f=public/scenes/tide-landscape.mp4
n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $f)
ffmpeg -v error -y -i $f -vf "select=eq(n\,0),scale=480:-2,gblur=sigma=1" -vframes 1 first.png
ffmpeg -v error -y -i $f -vf "select=eq(n\,$((n-1))),scale=480:-2,gblur=sigma=1" -vframes 1 -vsync 0 last.png
ffmpeg -i last.png -i first.png -lavfi "[0:v][1:v]ssim" -f null -
```

The blur matters: SSIM on an unfiltered 1080p sky mostly measures codec noise, which
made an already-seamless loop score 0.94.
