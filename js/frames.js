// Frame catalogue for FrameIt. Pure data + lookups, no DOM.
// A frame is drawn by render.js from these fields only:
//   ring       - outer ring colour (null = no ring)
//   ringWidth  - ring thickness as a fraction of the smaller canvas side
//   inner      - thin inner stroke colour (null = none)
//   doubleRing - draw a second, thinner ring inside the outer one
//   corners    - 'none' | 'brackets' | 'dots'
//   accent     - corner / badge accent colour
//   banner     - { text, position: 'top' | 'bottom' } | null
//   badge      - short pill text drawn top-right inside the ring | null
// Banner text is replaced by the user's caption when one is typed.

export const CATEGORIES = [
  { id: 'festival', label: 'Festival' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'quote', label: 'Quote' },
  { id: 'professional', label: 'Professional' },
];

export const FRAMES = [
  // Festival
  { id: 'diwali', name: 'Diwali Glow', category: 'festival', ring: '#E8A33D', ringWidth: 0.022, inner: '#FFF3D6', doubleRing: true, corners: 'dots', accent: '#E8A33D', banner: { text: 'Happy Diwali', position: 'bottom' }, badge: 'Shubh' },
  { id: 'holi', name: 'Holi Splash', category: 'festival', ring: '#E5484D', ringWidth: 0.02, inner: '#F5F5F7', doubleRing: false, corners: 'dots', accent: '#E5484D', banner: { text: 'Happy Holi', position: 'top' }, badge: null },
  { id: 'eid', name: 'Eid Mubarak', category: 'festival', ring: '#2E9E6B', ringWidth: 0.022, inner: '#E8C96A', doubleRing: true, corners: 'brackets', accent: '#E8C96A', banner: { text: 'Eid Mubarak', position: 'bottom' }, badge: 'Eid' },
  { id: 'christmas', name: 'Merry Christmas', category: 'festival', ring: '#C0392B', ringWidth: 0.02, inner: '#2E9E6B', doubleRing: false, corners: 'dots', accent: '#2E9E6B', banner: { text: 'Merry Christmas', position: 'top' }, badge: null },
  // Birthday
  { id: 'birthday-balloons', name: 'Birthday Balloons', category: 'birthday', ring: '#E5484D', ringWidth: 0.02, inner: '#F5F5F7', doubleRing: false, corners: 'dots', accent: '#E5484D', banner: { text: 'Happy Birthday', position: 'bottom' }, badge: null },
  { id: 'birthday-confetti', name: 'Birthday Confetti', category: 'birthday', ring: '#7C5CFF', ringWidth: 0.022, inner: '#FFD166', doubleRing: false, corners: 'dots', accent: '#FFD166', banner: { text: 'Happy Birthday', position: 'top' }, badge: 'Party' },
  { id: 'birthday-cake', name: 'Birthday Cake', category: 'birthday', ring: '#F27BA7', ringWidth: 0.02, inner: '#F5F5F7', doubleRing: true, corners: 'brackets', accent: '#F27BA7', banner: { text: 'Make a Wish', position: 'bottom' }, badge: null },
  { id: 'birthday-sparkle', name: 'Birthday Sparkle', category: 'birthday', ring: '#E8A33D', ringWidth: 0.018, inner: '#F5F5F7', doubleRing: true, corners: 'dots', accent: '#E8A33D', banner: { text: 'Celebrate You', position: 'top' }, badge: 'Cheers' },
  // Quote / motivational
  { id: 'dream-big', name: 'Dream Big', category: 'quote', ring: '#0B0B0F', ringWidth: 0.02, inner: '#E8A33D', doubleRing: false, corners: 'brackets', accent: '#E8A33D', banner: { text: 'Dream Big', position: 'bottom' }, badge: null },
  { id: 'keep-going', name: 'Keep Going', category: 'quote', ring: '#E5484D', ringWidth: 0.018, inner: '#F5F5F7', doubleRing: false, corners: 'brackets', accent: '#E5484D', banner: { text: 'Keep Going', position: 'top' }, badge: null },
  { id: 'stay-focused', name: 'Stay Focused', category: 'quote', ring: '#2E5FA3', ringWidth: 0.02, inner: '#F5F5F7', doubleRing: true, corners: 'none', accent: '#2E5FA3', banner: { text: 'Stay Focused', position: 'bottom' }, badge: 'Focus' },
  { id: 'grateful-heart', name: 'Grateful Heart', category: 'quote', ring: '#C96A8B', ringWidth: 0.02, inner: '#F5F5F7', doubleRing: false, corners: 'dots', accent: '#C96A8B', banner: { text: 'Grateful Heart', position: 'top' }, badge: null },
  // Professional
  { id: 'linkedin-pro', name: 'LinkedIn Pro', category: 'professional', ring: '#1B1B22', ringWidth: 0.012, inner: null, doubleRing: false, corners: 'none', accent: '#1B1B22', banner: null, badge: 'Profile' },
  { id: 'corporate-red', name: 'Corporate Red', category: 'professional', ring: '#E5484D', ringWidth: 0.016, inner: '#0B0B0F', doubleRing: true, corners: 'none', accent: '#E5484D', banner: { text: 'Professional Profile', position: 'bottom' }, badge: null },
  { id: 'minimal-gold', name: 'Minimal Gold', category: 'professional', ring: '#C9A227', ringWidth: 0.01, inner: null, doubleRing: false, corners: 'none', accent: '#C9A227', banner: null, badge: 'Profile' },
  { id: 'interview-ready', name: 'Interview Ready', category: 'professional', ring: '#2E5FA3', ringWidth: 0.016, inner: '#F5F5F7', doubleRing: false, corners: 'brackets', accent: '#2E5FA3', banner: { text: 'Ready to Lead', position: 'bottom' }, badge: null },
];

export function frameById(id) {
  const found = FRAMES.find((f) => f.id === id);
  return found || FRAMES[0];
}

export function framesByCategory(category) {
  if (!category || category === 'all') return [...FRAMES];
  return FRAMES.filter((f) => f.category === category);
}

export function frameCounts() {
  const counts = { all: FRAMES.length };
  for (const c of CATEGORIES) counts[c.id] = FRAMES.filter((f) => f.category === c.id).length;
  return counts;
}

export function categoryLabel(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : id;
}
