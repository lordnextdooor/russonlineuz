// Токены из docs/brandbook.md и marketing/reels/motion-guide.md
export const C = {
  navy: '#1F2D4D',
  terra: '#C8553D',
  cream: '#FFF6EC',
  terraLight: '#E07A5F',
  terraDark: '#A8432F',
  peach: '#F2B5A3',
};

export type Theme = 'cream' | 'navy';

// Цвета сцены на кремовом и на синем фоне
export const THEME = {
  cream: {bg: C.cream, text: C.navy, accent: C.terra, sub: C.terraDark},
  navy: {bg: C.navy, text: C.cream, accent: C.terraLight, sub: C.peach},
} as const;

export const FONT = 'Montserrat, Arial, sans-serif';

// Роли текста (гайд, п. 2)
export const TYPE = {
  // Крупнее гайда: на телефоне в ленте 88 px читались мелко
  hook: {fontSize: 112, fontWeight: 900, letterSpacing: -2, lineHeight: 1.05},
  body: {fontSize: 72, fontWeight: 800, lineHeight: 1.2},
  phrase: {fontSize: 124, fontWeight: 900, lineHeight: 1.1},
  translation: {fontSize: 58, fontWeight: 600, lineHeight: 1.3},
  caption: {fontSize: 28, fontWeight: 600, letterSpacing: 3, lineHeight: 1},
} as const;

// Безопасные зоны Reels (гайд, п. 3): рабочая область x 72–920, y 220–1500
export const SAFE = {top: 220, bottom: 420, left: 72, right: 160};
export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Вход слов (гайд, п. 4.1)
export const WORD_SPRING = {damping: 14, stiffness: 120, mass: 0.8};
export const WORD_STAGGER = 3;
