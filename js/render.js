// The ONE shared draw path for FrameIt: preview and export both call
// drawFramed with the same photo, frame and state — only the canvas
// size differs. Order is always: background, photo, frame overlay.
// Pan fractions are multiplied by the canvas size, so the same state
// frames identically at preview size and at full export size.

import { drawnSize } from './geometry.js';

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, n));
}

// Relative luminance test so banner text stays readable on any ring colour.
export function isLightColour(hex) {
  if (typeof hex !== 'string') return false;
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) return false;
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

function fitFont(ctx, text, startSize, maxWidth) {
  let size = startSize;
  ctx.font = `700 ${size}px Inter, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `700 ${size}px Inter, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  }
  return size;
}

function drawBanner(ctx, frame, text, W, H, position) {
  const bandH = Math.round(H * 0.09);
  const y = position === 'top' ? 0 : H - bandH;
  ctx.fillStyle = frame.ring || '#0B0B0F';
  ctx.fillRect(0, y, W, bandH);
  const fg = isLightColour(frame.ring) ? '#0B0B0F' : '#FFFFFF';
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  fitFont(ctx, text, Math.round(bandH * 0.52), W * 0.86);
  ctx.fillText(text, W / 2, y + bandH / 2);
  return bandH;
}

function drawBadge(ctx, frame, W, H, belowTopBanner) {
  const text = frame.badge;
  if (!text) return;
  ctx.font = `700 ${Math.round(H * 0.028)}px Inter, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  const padX = Math.round(W * 0.02);
  const pillW = Math.round(ctx.measureText(text).width + padX * 2);
  const pillH = Math.round(H * 0.05);
  const inset = Math.round(Math.min(W, H) * 0.04);
  const x = W - pillW - inset;
  const y = belowTopBanner ? H - pillH - inset : inset;
  ctx.fillStyle = frame.accent || '#E5484D';
  ctx.beginPath();
  ctx.arc(x + pillH / 2, y + pillH / 2, pillH / 2, 0, Math.PI * 2);
  ctx.arc(x + pillW - pillH / 2, y + pillH / 2, pillH / 2, 0, Math.PI * 2);
  ctx.fillRect(x + pillH / 2, y, pillW - pillH, pillH);
  ctx.fill();
  ctx.fillStyle = isLightColour(frame.accent) ? '#0B0B0F' : '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pillW / 2, y + pillH / 2);
}

function drawCorners(ctx, frame, W, H) {
  const m = Math.min(W, H);
  const inset = m * 0.045;
  if (frame.corners === 'brackets') {
    const len = m * 0.09;
    ctx.strokeStyle = frame.accent;
    ctx.lineWidth = Math.max(2, m * 0.012);
    ctx.beginPath();
    const corners = [
      [inset, inset, 1, 1], [W - inset, inset, -1, 1],
      [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1],
    ];
    for (const [x, y, sx, sy] of corners) {
      ctx.moveTo(x + len * sx, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + len * sy);
    }
    ctx.stroke();
  } else if (frame.corners === 'dots') {
    ctx.fillStyle = frame.accent;
    const r = Math.max(2, m * 0.012);
    const points = [
      [inset, inset], [W - inset, inset], [inset, H - inset], [W - inset, H - inset],
      [W / 2, inset], [W / 2, H - inset], [inset, H / 2], [W - inset, H / 2],
    ];
    for (const [x, y] of points) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawFramed(ctx, photo, frame, opts, W, H) {
  const o = opts || {};
  const variant = o.variant || 'full';
  const opacity = clamp01(o.opacity === undefined ? 1 : o.opacity);

  // 1. Background behind the photo.
  ctx.fillStyle = o.bg || '#0B0B0F';
  ctx.fillRect(0, 0, W, H);

  // 2. Photo, behind the frame overlay.
  if (photo && photo.source && photo.width > 0 && photo.height > 0) {
    const drawn = drawnSize(photo.width, photo.height, W, H, o.zoom === undefined ? 1 : o.zoom);
    ctx.save();
    ctx.translate(W / 2 + (o.panX || 0) * W, H / 2 + (o.panY || 0) * H);
    ctx.rotate(((o.rotation || 0) * Math.PI) / 180);
    ctx.drawImage(photo.source, -drawn.width / 2, -drawn.height / 2, drawn.width, drawn.height);
    ctx.restore();
  }

  // 3. Frame overlay on top.
  if (!frame) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  const m = Math.min(W, H);
  const bannerText = (o.caption && o.caption.trim()) ? o.caption.trim() : (frame.banner ? frame.banner.text : null);
  const bannerPosition = frame.banner ? frame.banner.position : 'bottom';
  const bannerOnTop = !!bannerText && bannerPosition === 'top';

  if (variant !== 'text' && frame.ring) {
    const lw = Math.max(2, frame.ringWidth * m);
    ctx.strokeStyle = frame.ring;
    ctx.lineWidth = lw;
    ctx.strokeRect(lw / 2, lw / 2, W - lw, H - lw);
    if (frame.doubleRing) {
      const lw2 = Math.max(1, m * 0.006);
      const inset = lw + m * 0.015;
      ctx.lineWidth = lw2;
      ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
    }
    if (frame.inner) {
      ctx.strokeStyle = frame.inner;
      ctx.lineWidth = Math.max(1, m * 0.003);
      const inset = lw + m * 0.028;
      ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
    }
  }
  if (variant !== 'text') drawCorners(ctx, frame, W, H);
  if (variant !== 'ring') {
    if (bannerText) drawBanner(ctx, frame, bannerText, W, H, bannerPosition);
    if (frame.badge) drawBadge(ctx, frame, W, H, bannerOnTop);
  }
  ctx.restore();
}

// Canvas-drawn sample portrait (800 x 1000 in main.js) so the tool
// works with zero uploads. Returns the canvas it was given.
export function drawSamplePhoto(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#8FB8E8');
  grad.addColorStop(1, '#D9E8F7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // Sun accent.
  ctx.fillStyle = '#F2C94C';
  ctx.beginPath();
  ctx.arc(W * 0.84, H * 0.14, W * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Shoulders and shirt.
  ctx.fillStyle = '#E5484D';
  ctx.beginPath();
  ctx.ellipse(W / 2, H * 1.02, W * 0.42, H * 0.3, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Neck.
  ctx.fillStyle = '#E8B48C';
  ctx.fillRect(W * 0.44, H * 0.52, W * 0.12, H * 0.12);
  // Head.
  ctx.fillStyle = '#F2C49B';
  ctx.beginPath();
  ctx.ellipse(W / 2, H * 0.38, W * 0.17, H * 0.17, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair.
  ctx.fillStyle = '#2B2118';
  ctx.beginPath();
  ctx.ellipse(W / 2, H * 0.27, W * 0.175, H * 0.09, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  // Eyes and smile.
  ctx.fillStyle = '#1B1B22';
  ctx.beginPath();
  ctx.arc(W * 0.43, H * 0.38, W * 0.012, 0, Math.PI * 2);
  ctx.arc(W * 0.57, H * 0.38, W * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1B1B22';
  ctx.lineWidth = Math.max(2, W * 0.006);
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.45, W * 0.06, 0.25, Math.PI - 0.25);
  ctx.stroke();
  return canvas;
}
