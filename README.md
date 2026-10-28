# FrameIt

I built FrameIt because every festival, birthday, or job hunt used to mean
hunting for a frame app, signing up, and watching my photo get uploaded
somewhere I could not see. This one runs entirely in the browser: pick a
frame, drop your photo in, drag it into place, and download a finished
profile picture.

## What it does

- 16 frames across four categories: Festival (Diwali, Holi, Eid,
  Christmas), Birthday (balloons, confetti, cake, sparkle), Quote
  (Dream Big, Keep Going, Stay Focused, Grateful Heart), and
  Professional (LinkedIn Pro, Corporate Red, Minimal Gold, Interview
  Ready). Filter by category, click to select.
- Photo intake by file picker, drag-drop, or paste from the clipboard,
  plus a canvas-drawn sample photo so you can try everything without
  uploading a real picture.
- Position the photo inside the frame: drag to pan, zoom from 0.5x to
  3x (slider or scroll over the preview), rotate from -45 to +45
  degrees, and reset. Panning is clamped so the frame stays fully
  covered by the photo.
- Frame controls: opacity from 20% to 100%, three style variants
  (full frame, ring only, text only), and an optional caption that
  replaces the frame's banner text.
- Output sizes: Square 1080 x 1080 (default), Portrait 1080 x 1350,
  and Story 1080 x 1920, plus a background colour behind the photo.
- Export is a PNG named `frameit-<frame>.png`, drawn by the exact same
  code that draws the preview, so what you see is what you download.

## Honest limitations

- The frames are drawn with canvas shapes and text, not artwork from a
  designer — they look clean and bold, but they will not match a
  hand-illustrated frame pack, and long captions shrink to fit the
  banner rather than wrapping to a second line.
- With rotation, the photo's corners can expose the background colour
  even though the frame's bounding box stays covered; that is the
  trade-off of rotating a rectangle inside another rectangle, and the
  background colour picker is there for exactly that case.
- Very large photos (say, over 20 megapixels) can feel slow on a weak
  phone, because everything runs locally. Smaller source files work
  better.
- Banner text uses the system font stack, so it renders slightly
  differently across devices — the layout is the same, the letterforms
  may not be pixel-identical.

## How it is put together

Vanilla JavaScript ES modules, no build step, no dependencies, no
tracking. `js/frames.js` holds the frame catalogue, `js/geometry.js`
the cover-scale and pan-clamp math, `js/export.js` the file naming,
`js/render.js` the single draw function shared by preview and export,
and `js/main.js` only wires the DOM. Open `index.html` in any modern
browser and it just works.

## Privacy

Your photos are processed locally in your browser and never uploaded.
There is no server, no storage, and nothing to sign up for.

## License

MIT. See `LICENSE`.
