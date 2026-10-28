// Export naming for FrameIt. Pure, no DOM.

export function exportFileName(frameId) {
  const slug = String(frameId || 'frame').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'frame';
  return `frameit-${slug}.png`;
}

export function sizeLabel(size) {
  return `${size.width} x ${size.height} px (${size.label})`;
}
