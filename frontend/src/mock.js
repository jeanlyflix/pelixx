// JANLYFLIX local mock storage
// Admin: Loverjeans / 2103

export const SECURITY_QUESTIONS = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el nombre de tu mejor amigo de la infancia?',
  '¿Cuál es tu película favorita?',
  '¿Cuál es el nombre de tu profesor favorito?',
  '¿Cuál es tu comida favorita?',
  '¿Cuál es el segundo nombre de tu madre?',
  '¿Cuál fue el modelo de tu primer coche?'
];

// Anime-style profile avatars (Dicebear Lorelei — cozy illustrated)
const dice = (seed, bg) => `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}&radius=14`;
export const AVATAR_OPTIONS = [
  dice('Sakura',   'fde68a'),
  dice('Hinata',   'fda4af'),
  dice('Mikasa',   '93c5fd'),
  dice('Nezuko',   'f9a8d4'),
  dice('Tanjiro',  '5eead4'),
  dice('Levi',     'c4b5fd'),
  dice('Eren',     'fcd34d'),
  dice('Killua',   'e9d5ff'),
  dice('Gon',      '86efac'),
  dice('Naruto',   'fdba74'),
  dice('Luffy',    'fca5a5'),
  dice('Goku',     'fcd34d')
];

// Special Kids avatar (unique design, not from Dicebear)
export const KIDS_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="k" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd166"/>
      <stop offset="50%" stop-color="#ef476f"/>
      <stop offset="100%" stop-color="#06d6a0"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fff8e1" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#fff8e1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="18" fill="url(#k)"/>
  <rect width="200" height="200" rx="18" fill="url(#glow)"/>
  <g transform="translate(100,108)">
    <circle r="42" fill="#fff5d6"/>
    <circle cx="-14" cy="-6" r="5" fill="#2b1d12"/>
    <circle cx="14" cy="-6" r="5" fill="#2b1d12"/>
    <circle cx="-12" cy="-8" r="1.6" fill="#fff"/>
    <circle cx="16" cy="-8" r="1.6" fill="#fff"/>
    <path d="M -10 12 Q 0 22 10 12" fill="none" stroke="#2b1d12" stroke-width="3" stroke-linecap="round"/>
    <circle cx="-22" cy="6" r="4" fill="#ef476f" opacity="0.55"/>
    <circle cx="22" cy="6" r="4" fill="#ef476f" opacity="0.55"/>
  </g>
  <text x="100" y="46" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#fff" letter-spacing="3">KIDS</text>
</svg>`)}`;

export const DEFAULT_ADMIN = {
  username: 'Loverjeans',
  password: '2103',
  role: 'admin',
  question1: { q: SECURITY_QUESTIONS[0], a: 'admin' },
  question2: { q: SECURITY_QUESTIONS[1], a: 'admin' },
  profiles: [
    { id: 'p_admin_1', name: 'Loverjeans', avatar: AVATAR_OPTIONS[5], isKid: false }
  ],
  myList: [],
  notifications: [
    { id: 'n1', title: 'Bienvenido a JANLYFLIX', body: 'Tu cuenta admin está activa.', time: new Date().toISOString(), read: false }
  ],
  createdAt: new Date().toISOString()
};

export function seedAdmin() {
  const users = JSON.parse(localStorage.getItem('strm_users') || '[]');
  // Migrate old admin if exists
  const oldIdx = users.findIndex(u => u.username === 'admin');
  if (oldIdx >= 0) users.splice(oldIdx, 1);
  if (!users.find(u => u.username === 'Loverjeans')) {
    users.push(DEFAULT_ADMIN);
    localStorage.setItem('strm_users', JSON.stringify(users));
  }
}

export const GENRES = [
  { id: 28,    name: 'Acción',         emoji: 'zap' },
  { id: 12,    name: 'Aventura',        emoji: 'compass' },
  { id: 16,    name: 'Animación',      emoji: 'sparkles' },
  { id: 35,    name: 'Comedia',         emoji: 'smile' },
  { id: 80,    name: 'Crimen',          emoji: 'shield' },
  { id: 99,    name: 'Documental',      emoji: 'film' },
  { id: 18,    name: 'Drama',           emoji: 'theater' },
  { id: 10751, name: 'Familia',         emoji: 'heart' },
  { id: 14,    name: 'Fantasía',       emoji: 'wand' },
  { id: 36,    name: 'Historia',        emoji: 'book' },
  { id: 27,    name: 'Terror',          emoji: 'ghost' },
  { id: 10402, name: 'Música',         emoji: 'music' },
  { id: 9648,  name: 'Misterio',        emoji: 'search' },
  { id: 10749, name: 'Romance',         emoji: 'flower' },
  { id: 878,   name: 'Ciencia ficción',emoji: 'rocket' },
  { id: 53,    name: 'Suspenso',        emoji: 'eye' },
  { id: 10752, name: 'Guerra',          emoji: 'flag' },
  { id: 37,    name: 'Western',         emoji: 'sun' }
];

// Genres safe for kids
export const KIDS_GENRE_IDS = [10751, 16]; // Family + Animation

export function isAdminUser(u) {
  return !!u && u.role === 'admin';
}

// Play a magical chime when entering Kids profile (Web Audio API, no asset needed)
export function playKidsChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // C major arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.10;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  } catch (_) {}
}
