// DOM wiring for FrameIt only. The frame catalogue lives in frames.js,
// all geometry in geometry.js, naming in export.js, and all drawing in
// render.js (drawFramed, the ONE shared draw function used by BOTH
// preview and export). This module never computes a frame, a size or a
// pixel itself — it only wires controls to those modules.

import { CATEGORIES, FRAMES, frameById, framesByCategory, categoryLabel } from './frames.js';
import { outputSizeById, previewSize, normalizeFrameState, clampPan } from './geometry.js';
import { exportFileName, sizeLabel } from './export.js';
import { drawFramed, drawSamplePhoto } from './render.js';

const $ = (id) => document.getElementById(id);

let photo = null; // { name, source (canvas|img), width, height } | null
let selectedFrame = frameById('diwali');
let filter = 'all';
let frameState = normalizeFrameState({ zoom: 1, rotation: 0, panX: 0, panY: 0 });
let dragging = false;
let dragX = 0;
let dragY = 0;

function currentSize() {
  return outputSizeById($('sizeSelect').value);
}

function effectiveState() {
  if (!photo) return normalizeFrameState(frameState);
  const size = currentSize();
  return clampPan(frameState, photo.width, photo.height, size.width, size.height);
}

function drawOptions() {
  const s = effectiveState();
  return {
    bg: $('bgSelect').value,
    zoom: s.zoom,
    rotation: s.rotation,
    panX: s.panX,
    panY: s.panY,
    opacity: Number($('opacityRange').value) / 100,
    variant: $('variantSelect').value,
    caption: $('captionInput').value,
  };
}

function syncLabels() {
  $('zoomValue').textContent = `${(Number($('zoomRange').value) / 100).toFixed(1)}x`;
  $('rotationValue').textContent = `${$('rotationRange').value}°`;
  $('opacityValue').textContent = `${$('opacityRange').value}%`;
}

function renderPreview() {
  const size = currentSize();
  const preview = previewSize(size);
  const canvas = $('previewCanvas');
  canvas.width = preview.width;
  canvas.height = preview.height;
  const ctx = canvas.getContext('2d');
  drawFramed(ctx, photo, selectedFrame, drawOptions(), preview.width, preview.height);
  $('dimensionText').textContent = sizeLabel(size);
  $('frameNameText').textContent = `${selectedFrame.name} — ${categoryLabel(selectedFrame.category)} frame`;
  $('exportBtn').disabled = !photo;
  $('emptyNote').hidden = !!photo;
  $('statusText').textContent = photo
    ? `Ready — ${selectedFrame.name} frame at ${size.width} x ${size.height} px`
    : 'Load a photo or the sample portrait to start.';
}

function renderFrameGrid() {
  const grid = $('frameGrid');
  grid.textContent = '';
  for (const frame of framesByCategory(filter)) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `frame-card${frame.id === selectedFrame.id ? ' selected' : ''}`;
    card.setAttribute('aria-pressed', frame.id === selectedFrame.id ? 'true' : 'false');
    card.dataset.frameId = frame.id;
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = `linear-gradient(135deg, ${frame.ring || '#23232E'}, ${frame.accent || '#E5484D'})`;
    const name = document.createElement('span');
    name.className = 'frame-name';
    name.textContent = frame.name;
    const cat = document.createElement('span');
    cat.className = 'frame-cat muted';
    cat.textContent = categoryLabel(frame.category);
    card.append(swatch, name, cat);
    card.addEventListener('click', () => {
      selectedFrame = frameById(frame.id);
      renderFrameGrid();
      renderPreview();
    });
    grid.appendChild(card);
  }
  $('frameCountText').textContent = `${framesByCategory(filter).length} of ${FRAMES.length} frames shown`;
}

function renderFilters() {
  const bar = $('filterBar');
  bar.textContent = '';
  const all = [{ id: 'all', label: 'All' }, ...CATEGORIES];
  for (const c of all) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn secondary${filter === c.id ? ' active' : ''}`;
    btn.dataset.filter = c.id;
    btn.textContent = c.label;
    btn.addEventListener('click', () => {
      filter = c.id;
      renderFilters();
      renderFrameGrid();
    });
    bar.appendChild(btn);
  }
}

function setPhoto(next, nameText) {
  photo = next;
  $('photoNameText').textContent = nameText;
  renderPreview();
}

function loadSample() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  drawSamplePhoto(canvas);
  setPhoto({ name: 'Sample portrait', source: canvas, width: 800, height: 1000 }, 'Sample portrait (800 x 1000 px)');
}

function loadFile(file) {
  if (!file) return;
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(url);
    setPhoto({ name: file.name, source: img, width: img.naturalWidth || img.width, height: img.naturalHeight || img.height }, `${file.name} (${img.naturalWidth || img.width} x ${img.naturalHeight || img.height} px)`);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    $('statusText').textContent = 'Could not read that image. Try another photo file.';
  };
  img.src = url;
}

function resetPosition() {
  frameState = normalizeFrameState({ zoom: 1, rotation: 0, panX: 0, panY: 0 });
  $('zoomRange').value = '100';
  $('rotationRange').value = '0';
  syncLabels();
  renderPreview();
}

function exportPng() {
  if (!photo) return;
  const size = currentSize();
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  drawFramed(ctx, photo, selectedFrame, drawOptions(), size.width, size.height);
  const filename = exportFileName(selectedFrame.id);
  const download = (href) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    $('statusText').textContent = `${filename} — download started`;
  };
  if (typeof canvas.toBlob === 'function') {
    canvas.toBlob((blob) => {
      if (blob) download(URL.createObjectURL(blob));
      else download(canvas.toDataURL('image/png'));
    }, 'image/png');
  } else {
    download(canvas.toDataURL('image/png'));
  }
}

function init() {
  $('fileInput').addEventListener('change', (e) => loadFile(e.target.files && e.target.files[0]));
  const zone = $('dropZone');
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag');
    loadFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
  });
  document.addEventListener('paste', (e) => {
    const items = (e.clipboardData && e.clipboardData.items) || [];
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) loadFile(file);
        break;
      }
    }
  });
  $('sampleBtn').addEventListener('click', loadSample);
  $('clearBtn').addEventListener('click', () => {
    photo = null;
    $('photoNameText').textContent = 'No photo loaded';
    renderPreview();
  });

  const canvas = $('previewCanvas');
  canvas.addEventListener('pointerdown', (e) => {
    if (!photo) return;
    dragging = true;
    dragX = e.clientX;
    dragY = e.clientY;
    canvas.setPointerCapture && e.pointerId !== undefined && canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || !photo) return;
    const dx = (e.clientX - dragX) / canvas.width;
    const dy = (e.clientY - dragY) / canvas.height;
    dragX = e.clientX;
    dragY = e.clientY;
    const size = currentSize();
    frameState = clampPan({ ...frameState, panX: frameState.panX + dx, panY: frameState.panY + dy }, photo.width, photo.height, size.width, size.height);
    renderPreview();
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (e) => {
    if (!photo) return;
    e.preventDefault();
    const next = normalizeFrameState({ ...frameState, zoom: frameState.zoom + (e.deltaY < 0 ? 0.1 : -0.1) });
    frameState = next;
    $('zoomRange').value = String(Math.round(next.zoom * 100));
    syncLabels();
    renderPreview();
  }, { passive: false });

  $('zoomRange').addEventListener('input', () => {
    frameState = normalizeFrameState({ ...frameState, zoom: Number($('zoomRange').value) / 100 });
    syncLabels();
    renderPreview();
  });
  $('rotationRange').addEventListener('input', () => {
    frameState = normalizeFrameState({ ...frameState, rotation: Number($('rotationRange').value) });
    syncLabels();
    renderPreview();
  });
  $('resetPosBtn').addEventListener('click', resetPosition);
  $('sizeSelect').addEventListener('change', renderPreview);
  $('bgSelect').addEventListener('change', renderPreview);
  $('variantSelect').addEventListener('change', renderPreview);
  $('opacityRange').addEventListener('input', () => { syncLabels(); renderPreview(); });
  $('captionInput').addEventListener('input', renderPreview);
  $('exportBtn').addEventListener('click', exportPng);

  renderFilters();
  renderFrameGrid();
  syncLabels();
  renderPreview();
}

init();
