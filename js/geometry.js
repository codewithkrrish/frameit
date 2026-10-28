// Pure geometry for FrameIt: output sizes, cover scale, and the
// zoom / rotation / pan state. No DOM. Pan is stored as a FRACTION of
// the frame width/height, so the same state is valid at preview size
// and at full export size — the shared draw path just multiplies by
// the canvas it is drawing into.

export const OUTPUT_SIZES = [
  { id: 'square', label: 'Square', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait', width: 1080, height: 1350 },
  { id: 'story', label: 'Story', width: 1080, height: 1920 },
];

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const MIN_ROTATION = -45;
export const MAX_ROTATION = 45;

export function outputSizeById(id) {
  const found = OUTPUT_SIZES.find((s) => s.id === id);
  return found || OUTPUT_SIZES[0];
}

// Display size for the preview canvas: same aspect, longest side = max.
export function previewSize(size, max = 520) {
  const scale = Math.min(max / size.width, max / size.height);
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function normalizeFrameState(state) {
  const s = state || {};
  const zoom = finiteOr(Number(s.zoom), 1);
  const rotation = finiteOr(Number(s.rotation), 0);
  return {
    zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom)),
    rotation: Math.min(MAX_ROTATION, Math.max(MIN_ROTATION, rotation)),
    panX: finiteOr(Number(s.panX), 0),
    panY: finiteOr(Number(s.panY), 0),
  };
}

// Scale that makes the photo cover the whole frame (no gaps).
export function coverScale(photoW, photoH, frameW, frameH) {
  if (!(photoW > 0) || !(photoH > 0) || !(frameW > 0) || !(frameH > 0)) return 1;
  return Math.max(frameW / photoW, frameH / photoH);
}

// Drawn photo size (before rotation) at a given zoom.
export function drawnSize(photoW, photoH, frameW, frameH, zoom) {
  const scale = coverScale(photoW, photoH, frameW, frameH) * zoom;
  return { width: photoW * scale, height: photoH * scale };
}

// Axis-aligned bounding box of the rotated drawn photo.
export function rotatedBounds(drawW, drawH, rotationDeg) {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return { width: drawW * cos + drawH * sin, height: drawW * sin + drawH * cos };
}

// Clamp pan fractions so the rotated photo still covers the frame.
// With rotation the corners can show background; the clamp keeps the
// bounding box covering the frame, which is the honest guarantee.
export function clampPan(state, photoW, photoH, frameW, frameH) {
  const s = normalizeFrameState(state);
  const drawn = drawnSize(photoW, photoH, frameW, frameH, s.zoom);
  const bounds = rotatedBounds(drawn.width, drawn.height, s.rotation);
  const maxPanX = Math.max(0, (bounds.width - frameW) / 2 / frameW);
  const maxPanY = Math.max(0, (bounds.height - frameH) / 2 / frameH);
  return {
    ...s,
    panX: Math.min(maxPanX, Math.max(-maxPanX, s.panX)),
    panY: Math.min(maxPanY, Math.max(-maxPanY, s.panY)),
  };
}
