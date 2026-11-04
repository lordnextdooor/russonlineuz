// Риг персонажей: позы (углы рук), эмоции (брови, рот, веки), моргание, дыхание, ключи анимации.
// Концепция — marketing/reels/characters-concept.md. Координаты — локальные, (0, 0) — между стопами, ось y вниз.
import {Easing, interpolate, random, spring} from 'remotion';
import {noise2D} from '@remotion/noise';

/** clerk, boss и passerby — один «Собеседник»: кассир (фартук), начальник (пиджак и галстук), прохожий (кепка, шарф, сумка). */
export type Who = 'ustoz' | 'jasur' | 'clerk' | 'boss' | 'passerby';
/** puff — запыхался (прибежал). */
export type Emotion = 'neutral' | 'happy' | 'confused' | 'surprised' | 'proud' | 'oops' | 'puff';
/**
 * stand, wave, point, thumbsUp, shrug — базовые; reach, hold, idea, carry — для сюжетов серии;
 * nape — рука на затылке (неуверенно), welcome — жест «заходите», pointUp — показать «прямо» (рука вверх),
 * thanks — ладонь у груди (благодарит).
 */
export type Pose =
  | 'stand'
  | 'wave'
  | 'point'
  | 'thumbsUp'
  | 'shrug'
  | 'reach'
  | 'hold'
  | 'idea'
  | 'carry'
  | 'nape'
  | 'welcome'
  | 'pointUp'
  | 'thanks';
export type Look = 'front' | 'left' | 'right' | 'up' | 'down';
export type Hand = 'fist' | 'open' | 'point' | 'thumb';
export type Prop = 'none' | 'bag' | 'card' | 'groceries' | 'marker' | 'phone';

// ---------- Скелет ----------
export const HEAD = {x: 0, y: -680};
export const NECK = {x: 0, y: -572}; // шарнир головы
export const UPPER_ARM = 125;
export const FOREARM = 112;
export const ARM_W = 40;
export const SHOULDER_X: Record<Who, number> = {jasur: 88, ustoz: 80, clerk: 100, boss: 100, passerby: 100};
export const SHOULDER_Y = -522;

// ---------- Позы ----------
// Углы в градусах от «рука висит вниз». sh — плечо, el — локоть относительно плеча.
// Положительный угол — наружу от тела (для левой и правой руки зеркально). l / r — рука слева / справа на экране.
type Arm = {sh: number; el: number; hand: Hand};
type PoseDef = {l: Arm; r: Arm; lift?: number; tilt?: number};
const DOWN: Arm = {sh: 12, el: -6, hand: 'fist'};

export const POSES: Record<Pose, PoseDef> = {
  stand: {l: DOWN, r: DOWN},
  wave: {l: DOWN, r: {sh: 150, el: 22, hand: 'open'}},
  point: {l: DOWN, r: {sh: 78, el: 6, hand: 'point'}},
  // Кулак сбоку от плеча, а не на фоне тела: так «класс» читается и в мелком окошке
  thumbsUp: {l: DOWN, r: {sh: 44, el: 96, hand: 'thumb'}},
  shrug: {l: {sh: 42, el: 62, hand: 'open'}, r: {sh: 42, el: 62, hand: 'open'}, lift: 14, tilt: 5},
  reach: {l: DOWN, r: {sh: 58, el: 14, hand: 'open'}},
  hold: {l: DOWN, r: {sh: 34, el: 92, hand: 'fist'}},
  idea: {l: DOWN, r: {sh: 14, el: 160, hand: 'point'}},
  carry: {l: {sh: 12, el: -96, hand: 'fist'}, r: {sh: 12, el: -96, hand: 'fist'}},
  nape: {l: DOWN, r: {sh: 140, el: 81, hand: 'open'}, tilt: 4},
  welcome: {l: DOWN, r: {sh: 66, el: 22, hand: 'open'}},
  pointUp: {l: DOWN, r: {sh: 164, el: 4, hand: 'point'}},
  thanks: {l: DOWN, r: {sh: 6, el: -132, hand: 'open'}},
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Поза между двумя ключами: углы плавно, кисть меняется на середине. */
export const blendPose = (from: Pose, to: Pose, t: number): PoseDef => {
  const a = POSES[from];
  const b = POSES[to];
  const arm = (x: Arm, y: Arm): Arm => ({sh: lerp(x.sh, y.sh, t), el: lerp(x.el, y.el, t), hand: t < 0.5 ? x.hand : y.hand});
  return {l: arm(a.l, b.l), r: arm(a.r, b.r), lift: lerp(a.lift ?? 0, b.lift ?? 0, t), tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, t)};
};

// ---------- Эмоции ----------
// Брови: дуга от внешнего конца к внутреннему; смещения по y от базовой линии (минус — выше).
type Brow = {inner: number; outer: number; arch: number};
type EmotionDef = {
  browL: Brow;
  browR: Brow;
  mouth: MouthShape;
  eye: number; // масштаб глаз
  lid: number; // 0 — веки открыты, 1 — закрыты
  blush: number; // румянец 0..1
  tilt: number; // наклон головы, градусы
};

export const EMOTIONS: Record<Emotion, EmotionDef> = {
  neutral: {browL: {inner: 0, outer: 0, arch: -7}, browR: {inner: 0, outer: 0, arch: -7}, mouth: 'closed', eye: 1, lid: 0, blush: 0, tilt: 0},
  happy: {browL: {inner: -10, outer: -2, arch: -16}, browR: {inner: -10, outer: -2, arch: -16}, mouth: 'smile', eye: 1, lid: 0.12, blush: 0, tilt: -2},
  confused: {browL: {inner: 6, outer: 0, arch: -2}, browR: {inner: -18, outer: -12, arch: -26}, mouth: 'confused', eye: 1, lid: 0.05, blush: 0, tilt: 6},
  surprised: {browL: {inner: -24, outer: -18, arch: -34}, browR: {inner: -24, outer: -18, arch: -34}, mouth: 'O', eye: 1.28, lid: 0, blush: 0, tilt: 0},
  proud: {browL: {inner: -3, outer: -10, arch: -14}, browR: {inner: -3, outer: -10, arch: -14}, mouth: 'smile', eye: 1, lid: 0.42, blush: 0, tilt: -4},
  oops: {browL: {inner: -16, outer: 2, arch: -8}, browR: {inner: -16, outer: 2, arch: -8}, mouth: 'oops', eye: 0.95, lid: 0.12, blush: 1, tilt: 4},
  puff: {browL: {inner: -14, outer: 4, arch: -6}, browR: {inner: -14, outer: 4, arch: -6}, mouth: 'open', eye: 1, lid: 0.2, blush: 0.7, tilt: 3},
};

/** Рот эмоции с учётом персонажа: нейтральное лицо Ustoz — с лёгкой улыбкой. */
export const mouthOf = (who: Who, e: Emotion): MouthShape => (who === 'ustoz' && e === 'neutral' ? 'soft' : EMOTIONS[e].mouth);

export const browPath = (b: Brow, side: -1 | 1) => {
  const base = -724;
  const ox = 62 * side;
  const ix = 16 * side;
  return `M ${ox} ${base + b.outer} Q ${39 * side} ${base + b.arch} ${ix} ${base + b.inner}`;
};

// ---------- Рот ----------
// Все формы — один и тот же набор команд (M C C Z), чтобы морфинг был ровным.
export type MouthShape = 'closed' | 'soft' | 'smile' | 'smileOpen' | 'open' | 'mid' | 'O' | 'confused' | 'oops';
export const MOUTH: Record<MouthShape, string> = {
  closed: 'M -24 0 C -10 -4 10 -4 24 0 C 10 6 -10 6 -24 0 Z',
  soft: 'M -26 -4 C -12 6 12 6 26 -4 C 12 13 -12 13 -26 -4 Z',
  smile: 'M -30 -6 C -12 8 12 8 30 -6 C 14 22 -14 22 -30 -6 Z',
  smileOpen: 'M -30 -6 C -12 -2 12 -2 30 -6 C 22 36 -22 36 -30 -6 Z',
  open: 'M -20 -4 C -8 -9 8 -9 20 -4 C 14 26 -14 26 -20 -4 Z',
  mid: 'M -22 -2 C -8 -6 8 -6 22 -2 C 12 14 -12 14 -22 -2 Z',
  O: 'M -15 0 C -15 -22 15 -22 15 0 C 15 22 -15 22 -15 0 Z',
  confused: 'M -22 4 C -8 0 8 -7 24 -5 C 8 2 -8 9 -22 4 Z',
  oops: 'M -24 6 C -10 -6 10 -6 24 6 C 10 1 -10 1 -24 6 Z',
};
export const MOUTH_Y = -620;

const TALK_SEQ: Record<'plain' | 'smile', MouthShape[]> = {
  plain: ['open', 'mid', 'O', 'closed', 'open', 'mid'],
  smile: ['smileOpen', 'mid', 'open', 'smile', 'smileOpen', 'O'],
};

/** Рот «говорит»: каждые 4 кадра новая форма, между ними морфинг. Последовательность детерминирована. */
export const talkShapes = (frame: number, seed: string, smiling: boolean): [MouthShape, MouthShape, number] => {
  const seq = TALK_SEQ[smiling ? 'smile' : 'plain'];
  const k = Math.floor(frame / 4);
  const pick = (i: number) => seq[Math.floor(random(`${seed}-talk-${i}`) * seq.length)];
  return [pick(k), pick(k + 1), (frame % 4) / 4];
};

// ---------- Моргание и дыхание ----------
/** Моргание раз в 3–5 с: веки закрываются и открываются за 6 кадров. Интервалы — random(seed). */
export const blink = (frame: number, seed: string) => {
  let t = 20 + Math.floor(random(`${seed}-blink-0`) * 40);
  for (let i = 1; t <= frame + 6 && i < 200; i++) {
    const d = frame - t;
    if (d >= 0 && d < 6) return d < 3 ? (d + 1) / 3 : (6 - d) / 3;
    t += 90 + Math.floor(random(`${seed}-blink-${i}`) * 60);
  }
  return 0;
};

/** Дыхание: верх тела плавает на 1–2 px. */
export const breath = (frame: number, seed: string) => noise2D(`${seed}-breath`, frame / 40, 0) * 1.8;

export const LOOK: Record<Look, {x: number; y: number}> = {
  front: {x: 0, y: 0},
  left: {x: -9, y: 0},
  right: {x: 9, y: 0},
  up: {x: 3, y: -8},
  down: {x: 0, y: 6},
};

// ---------- Ключи анимации ----------
/**
 * Ключи [кадр, значение] → текущее значение, предыдущее и прогресс перехода 0..1 (пружина).
 * Удобно передавать в Character как pose/poseFrom/poseT или emotion/emotionFrom/emotionT.
 */
export const keyed = <T,>(frame: number, fps: number, keys: [number, T][]) => {
  let i = 0;
  while (i + 1 < keys.length && frame >= keys[i + 1][0]) i++;
  const [at, value] = keys[i];
  const from = i > 0 ? keys[i - 1][1] : value;
  const t = i > 0 ? spring({frame: frame - at, fps, config: {damping: 16, stiffness: 140, mass: 0.7}}) : 1;
  return {value, from, t: Math.min(1, t)};
};

/** Плавный переход числа по ключам (камера, позиция): Easing.inOut(cubic), dur кадров. */
export const tween = (frame: number, keys: [number, number][], dur = 14) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, to] = keys[i];
    const from = keys[i - 1][1];
    if (frame < at) break;
    v = interpolate(frame, [at, at + dur], [from, to], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });
  }
  return v;
};
