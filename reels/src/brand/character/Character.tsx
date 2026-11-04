// Персонажи серии «Jasur va Ustoz»: плоский SVG без обводок, теней и градиентов, только палитра бренда.
// Ustoz — обобщённый образ учительницы (не портрет Назокат): пучок, синее платье, терракотовый шарф.
// Jasur — короткие волосы, рюкзак, кремовая рубашка, синие брюки. Clerk — кассир: синяя одежда, персиковый фартук.
// Boss — начальник: пиджак, галстук. Passerby — прохожий постарше: кепка, седые виски и усы, персиковый шарф, сумка через плечо.
import React from 'react';
import {interpolatePath} from '@remotion/paths';
import {useCurrentFrame} from 'remotion';
import {C} from '../tokens';
import {
  ARM_W,
  EMOTIONS,
  Emotion,
  FOREARM,
  HEAD,
  Hand,
  LOOK,
  Look,
  MOUTH,
  MOUTH_Y,
  NECK,
  POSES,
  Pose,
  Prop,
  SHOULDER_X,
  SHOULDER_Y,
  UPPER_ARM,
  Who,
  blendPose,
  blink,
  breath,
  browPath,
  lerp,
  mouthOf,
  talkShapes,
} from './rig';

const SKIN = C.peach;
const HAIR = C.navy;
const INK = C.navy; // глаза, рот, брови

export type CharacterProps = {
  who: Who;
  pose?: Pose;
  emotion?: Emotion;
  talking?: boolean;
  look?: Look;
  /** Положение точки между стопами в координатах кадра 1080×1920 и масштаб (1 — рост ≈ 820 px). */
  x?: number;
  y?: number;
  scale?: number;
  /** Зеркально: рука «r» оказывается слева. */
  flip?: boolean;
  /** Плавные переходы: предыдущая поза / эмоция и прогресс 0..1 (см. keyed в rig.ts). */
  poseFrom?: Pose;
  poseT?: number;
  emotionFrom?: Emotion;
  emotionT?: number;
  /** Предмет в руке «r» (bag, card, marker) или в обеих (groceries). */
  prop?: Prop;
  /** Стоп-кадр: без моргания и дыхания. */
  frozen?: boolean;
  /** Точная настройка правой руки поверх позы (например, указать вниз на терминал). */
  armR?: {sh?: number; el?: number};
  /** Дополнительный наклон головы (кивок), градусы. */
  headTilt?: number;
  /** Сдвиг по y (шаг при ходьбе). */
  bob?: number;
  seed?: string;
  /** Заряд телефона 0..1 (prop 'phone'): терракотовая полоска в батарейке на экране; 0 — пустая батарейка. */
  phoneLevel?: number;
};

// ---------- Кисти и предметы ----------
const HandShape: React.FC<{hand: Hand; phi: number}> = ({hand, phi}) => {
  // phi — суммарный угол руки (рад); «вверх» в мире в системе кисти — (−sin φ, −cos φ)
  const line = (x2: number, y2: number, w: number, x1 = 0, y1 = 0) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={SKIN} strokeWidth={w} strokeLinecap="round" />
  );
  if (hand === 'point')
    return (
      <g>
        <circle r={22} fill={SKIN} />
        {line(0, 46, 15, 0, 6)}
      </g>
    );
  if (hand === 'thumb') {
    // Кулак горизонтально, большой палец вверх — в мировых координатах
    // Крупный кулак (видны три сгиба пальцев) и толстый большой палец, явно торчащий вверх над кулаком
    const deg = (-phi * 180) / Math.PI;
    return (
      <g transform={`rotate(${deg})`}>
        {line(-16, -62, 22, -16, -14)}
        <rect x={-32} y={-24} width={64} height={54} rx={20} fill={SKIN} />
        {[-8, 6, 20].map((y) => (
          <line key={y} x1={10} y1={y} x2={30} y2={y} stroke={C.terraLight} strokeWidth={4} strokeLinecap="round" />
        ))}
      </g>
    );
  }
  if (hand === 'open')
    return (
      <g>
        {[-30, 0, 30].map((a) => {
          const r = (a * Math.PI) / 180;
          return <React.Fragment key={a}>{line(Math.sin(r) * 38, Math.cos(r) * 38, 13)}</React.Fragment>;
        })}
        {line(30, 10, 13)}
        <circle r={24} fill={SKIN} />
      </g>
    );
  return <circle r={23} fill={SKIN} />;
};

/** Предмет в кисти — всегда вертикально, независимо от угла руки. */
const HandProp: React.FC<{prop: Prop; phiDeg: number; level?: number}> = ({prop, phiDeg, level = 1}) => {
  if (prop === 'phone')
    // Телефон экраном к зрителю: на экране батарейка; заряд — терракотовая полоска
    return (
      <g transform={`rotate(${-phiDeg})`}>
        <rect x={-10} y={-112} width={78} height={132} rx={14} fill={C.navy} />
        <rect x={-2} y={-102} width={62} height={104} rx={8} fill={C.cream} />
        <rect x={7} y={-62} width={38} height={24} rx={5} fill="none" stroke={C.navy} strokeWidth={5} />
        <rect x={45} y={-55} width={6} height={10} rx={2} fill={C.navy} />
        {level > 0.02 && <rect x={12} y={-57} width={28 * Math.min(1, level)} height={14} rx={2} fill={C.terra} />}
      </g>
    );
  if (prop === 'bag')
    return (
      <g transform={`rotate(${-phiDeg})`}>
        <path d="M -26 34 Q 0 -26 26 34" fill="none" stroke={C.terraLight} strokeWidth={9} strokeLinecap="round" />
        <rect x={-52} y={28} width={104} height={118} rx={16} fill={C.terraLight} />
      </g>
    );
  if (prop === 'card')
    return (
      <g transform={`rotate(${-phiDeg})`}>
        <rect x={-8} y={-70} width={92} height={60} rx={9} fill={C.terra} />
        <rect x={-8} y={-56} width={92} height={10} fill={C.cream} />
      </g>
    );
  if (prop === 'marker')
    return (
      <g transform={`rotate(${-phiDeg})`}>
        <line x1={0} y1={-58} x2={0} y2={26} stroke={C.terra} strokeWidth={16} strokeLinecap="round" />
      </g>
    );
  return null;
};

/** Хлеб и молоко в руках на уровне живота. */
const Groceries: React.FC = () => (
  <g transform="translate(0 -392)">
    <rect x={-6} y={-110} width={58} height={110} rx={8} fill={C.navy} />
    <path d="M -6 -104 L 23 -132 L 52 -104 Z" fill={C.navy} />
    <rect x={-6} y={-74} width={58} height={26} fill={C.cream} />
    <g transform="rotate(-12)">
      <rect x={-92} y={-62} width={118} height={56} rx={28} fill={C.terraLight} />
      {[-62, -36, -10].map((x) => (
        <line key={x} x1={x} y1={-48} x2={x + 10} y2={-22} stroke={C.cream} strokeWidth={6} strokeLinecap="round" />
      ))}
    </g>
  </g>
);

// ---------- Рука: плечо → локоть → кисть ----------
const ArmRig: React.FC<{who: Who; side: -1 | 1; sh: number; el: number; hand: Hand; prop: Prop; level?: number}> = ({
  who,
  side,
  sh,
  el,
  hand,
  prop,
  level,
}) => {
  // Положительный угол позы — наружу от тела; в SVG для правой руки это поворот против часовой
  const a1 = -side * sh;
  const a2 = -side * el;
  const phiDeg = a1 + a2;
  const sleeve = who === 'jasur' ? SKIN : C.navy;
  const holds = side === 1 && prop !== 'none' && prop !== 'groceries';
  return (
    <g transform={`translate(${SHOULDER_X[who] * side} ${SHOULDER_Y}) rotate(${a1})`}>
      <line x1={0} y1={0} x2={0} y2={UPPER_ARM} stroke={sleeve} strokeWidth={ARM_W} strokeLinecap="round" />
      {who === 'jasur' && <line x1={0} y1={-2} x2={0} y2={46} stroke={C.cream} strokeWidth={ARM_W + 6} strokeLinecap="butt" />}
      <g transform={`translate(0 ${UPPER_ARM}) rotate(${a2})`}>
        <line x1={0} y1={0} x2={0} y2={FOREARM} stroke={sleeve} strokeWidth={ARM_W} strokeLinecap="round" />
        <g transform={`translate(0 ${FOREARM + 8})`}>
          {holds && <HandProp prop={prop} phiDeg={phiDeg} level={level} />}
          <HandShape hand={hand} phi={(phiDeg * Math.PI) / 180} />
        </g>
      </g>
    </g>
  );
};

// ---------- Тело ----------
const Legs: React.FC<{who: Who}> = ({who}) =>
  who === 'ustoz' ? (
    <g>
      <rect x={-50} y={-110} width={30} height={92} rx={15} fill={SKIN} />
      <rect x={20} y={-110} width={30} height={92} rx={15} fill={SKIN} />
      <ellipse cx={-40} cy={-16} rx={34} ry={16} fill={C.navy} />
      <ellipse cx={40} cy={-16} rx={34} ry={16} fill={C.navy} />
    </g>
  ) : (
    <g fill={C.navy}>
      <rect x={-80} y={-332} width={160} height={110} rx={24} />
      <rect x={-76} y={-262} width={66} height={246} rx={28} />
      <rect x={10} y={-262} width={66} height={246} rx={28} />
      <ellipse cx={-50} cy={-18} rx={48} ry={20} />
      <ellipse cx={50} cy={-18} rx={48} ry={20} />
    </g>
  );

const Back: React.FC<{who: Who}> = ({who}) =>
  who === 'jasur' ? <rect x={-122} y={-584} width={244} height={262} rx={48} fill={C.terra} /> : null;

const Torso: React.FC<{who: Who}> = ({who}) => {
  if (who === 'jasur')
    return (
      <g>
        <rect x={-20} y={-596} width={40} height={60} fill={SKIN} />
        <path d="M -95 -470 Q -95 -550 -42 -550 L 42 -550 Q 95 -550 95 -470 L 95 -300 Q 95 -288 83 -288 L -83 -288 Q -95 -288 -95 -300 Z" fill={C.cream} />
        <path d="M -24 -551 L 24 -551 L 0 -512 Z" fill={SKIN} />
        <rect x={-68} y={-552} width={24} height={150} rx={12} fill={C.terra} />
        <rect x={44} y={-552} width={24} height={150} rx={12} fill={C.terra} />
      </g>
    );
  if (who === 'clerk')
    return (
      <g>
        <rect x={-20} y={-596} width={40} height={60} fill={SKIN} />
        <path d="M -105 -480 Q -105 -552 -48 -552 L 48 -552 Q 105 -552 105 -480 L 105 -300 Q 105 -288 93 -288 L -93 -288 Q -105 -288 -105 -300 Z" fill={C.navy} />
        <path d="M -24 -553 L 24 -553 L 0 -516 Z" fill={SKIN} />
        <line x1={-50} y1={-498} x2={-34} y2={-552} stroke={C.peach} strokeWidth={11} strokeLinecap="round" />
        <line x1={50} y1={-498} x2={34} y2={-552} stroke={C.peach} strokeWidth={11} strokeLinecap="round" />
        <rect x={-60} y={-504} width={120} height={150} rx={16} fill={C.peach} />
        <rect x={-86} y={-380} width={172} height={240} rx={24} fill={C.peach} />
        <rect x={-34} y={-326} width={68} height={44} rx={12} fill={C.cream} />
      </g>
    );
  if (who === 'passerby')
    // Тот же силуэт «Собеседника»: синее пальто, персиковый шарф, сумка через плечо (ремень персиковый, сумка светлой терракотой)
    return (
      <g>
        <rect x={-20} y={-596} width={40} height={60} fill={SKIN} />
        <path d="M -105 -480 Q -105 -552 -48 -552 L 48 -552 Q 105 -552 105 -480 L 105 -300 Q 105 -288 93 -288 L -93 -288 Q -105 -288 -105 -300 Z" fill={C.navy} />
        <line x1={-62} y1={-548} x2={78} y2={-352} stroke={C.peach} strokeWidth={14} strokeLinecap="round" />
        <rect x={40} y={-372} width={84} height={74} rx={16} fill={C.terraLight} />
        <rect x={40} y={-372} width={84} height={20} rx={10} fill={C.terraDark} />
        <circle cx={-34} cy={-420} r={7} fill={C.cream} />
        <circle cx={-34} cy={-364} r={7} fill={C.cream} />
        <path d="M -70 -566 Q 0 -526 70 -566 L 66 -530 Q 0 -494 -66 -530 Z" fill={C.peach} />
        <rect x={10} y={-540} width={36} height={118} rx={18} fill={C.peach} transform="rotate(-8 28 -540)" />
      </g>
    );
  if (who === 'boss')
    // Тот же силуэт, что у кассира, но пиджак: кремовая рубашка вырезом, персиковый галстук, платок в кармане
    return (
      <g>
        <rect x={-20} y={-596} width={40} height={60} fill={SKIN} />
        <path d="M -105 -480 Q -105 -552 -48 -552 L 48 -552 Q 105 -552 105 -480 L 105 -300 Q 105 -288 93 -288 L -93 -288 Q -105 -288 -105 -300 Z" fill={C.navy} />
        <path d="M -44 -553 L 44 -553 L 0 -404 Z" fill={C.cream} />
        <path d="M -24 -553 L 24 -553 L 0 -522 Z" fill={SKIN} />
        <path d="M -15 -524 L 15 -524 L 10 -504 L -10 -504 Z" fill={C.peach} />
        <path d="M -10 -506 L 10 -506 L 17 -436 L 0 -414 L -17 -436 Z" fill={C.peach} />
        <rect x={50} y={-470} width={34} height={14} rx={5} fill={C.peach} />
        <circle cx={0} cy={-374} r={7} fill={C.cream} />
        <circle cx={0} cy={-334} r={7} fill={C.cream} />
      </g>
    );
  return (
    <g>
      <rect x={-18} y={-594} width={36} height={56} fill={SKIN} />
      <path d="M -84 -474 Q -84 -550 -36 -550 L 36 -550 Q 84 -550 84 -474 L 86 -330 L 116 -112 Q 118 -92 98 -92 L -98 -92 Q -118 -92 -116 -112 L -86 -330 Z" fill={C.navy} />
      <path d="M -76 -558 Q 0 -512 76 -558 L 72 -522 Q 0 -478 -72 -522 Z" fill={C.terra} />
      <rect x={-48} y={-530} width={38} height={136} rx={19} fill={C.terra} transform="rotate(8 -29 -530)" />
      <circle cx={-28} cy={-522} r={22} fill={C.terra} />
    </g>
  );
};

const HeadShape: React.FC<{who: Who}> = ({who}) => {
  if (who === 'clerk' || who === 'boss' || who === 'passerby')
    return (
      <g>
        <circle cx={-98} cy={-672} r={20} fill={SKIN} />
        <circle cx={98} cy={-672} r={20} fill={SKIN} />
        <rect x={-98} y={-788} width={196} height={218} rx={82} fill={SKIN} />
      </g>
    );
  if (who === 'ustoz')
    return (
      <g>
        <circle cx={0} cy={-808} r={46} fill={HAIR} />
        <circle cx={-99} cy={-672} r={18} fill={SKIN} />
        <circle cx={99} cy={-672} r={18} fill={SKIN} />
        <circle cx={-100} cy={-648} r={8} fill={C.terra} />
        <circle cx={100} cy={-648} r={8} fill={C.terra} />
        <ellipse cx={HEAD.x} cy={HEAD.y} rx={100} ry={110} fill={SKIN} />
      </g>
    );
  return (
    <g>
      <circle cx={-103} cy={-672} r={20} fill={SKIN} />
      <circle cx={103} cy={-672} r={20} fill={SKIN} />
      <ellipse cx={HEAD.x} cy={HEAD.y} rx={104} ry={112} fill={SKIN} />
    </g>
  );
};

const HAIR_PATH: Record<Who, string> = {
  jasur:
    'M -108 -688 C -114 -772 -62 -818 0 -818 C 64 -818 114 -774 108 -688 C 100 -716 84 -734 60 -738 C 44 -754 12 -758 -6 -744 C -34 -752 -70 -744 -88 -722 C -98 -712 -105 -700 -108 -688 Z',
  ustoz:
    'M -106 -650 C -116 -760 -60 -800 0 -798 C 60 -800 116 -760 106 -650 C 100 -700 80 -735 48 -742 C 28 -746 10 -740 0 -728 C -10 -740 -28 -746 -48 -742 C -80 -735 -100 -700 -106 -650 Z',
  clerk: 'M -100 -700 L -100 -748 Q -100 -810 -40 -810 L 40 -810 Q 100 -810 100 -748 L 100 -700 Q 94 -736 62 -742 L -62 -742 Q -94 -736 -100 -700 Z',
  // Прохожий постарше: седые виски из-под кепки (кепка — отдельно, Cap)
  passerby: 'M -100 -778 L -100 -700 Q -96 -730 -76 -746 L -76 -778 Z M 100 -778 L 100 -700 Q 96 -730 76 -746 L 76 -778 Z',
  boss: 'M -100 -700 L -100 -748 Q -100 -810 -40 -810 L 40 -810 Q 100 -810 100 -748 L 100 -700 Q 94 -736 62 -742 L -62 -742 Q -94 -736 -100 -700 Z',
};

/** Кепка прохожего: синяя тулья, персиковая лента, синий козырёк. Сидит выше бровей, чтобы «брови вверх» читались. */
const Cap: React.FC = () => (
  <g data-part="cap">
    <path d="M -114 -782 C -118 -840 -58 -862 4 -862 C 72 -862 126 -838 118 -782 Z" fill={C.navy} />
    <rect x={-108} y={-796} width={220} height={16} rx={8} fill={C.peach} />
    <path d="M -108 -782 Q 2 -744 112 -782 Q 2 -768 -108 -782 Z" fill={C.navy} />
  </g>
);

// ---------- Лицо ----------
const Eye: React.FC<{cx: number; cy: number; scale: number; lid: number; lash: boolean; side: -1 | 1}> = ({cx, cy, scale, lid, lash, side}) => {
  const rx = 12 * scale;
  const ry = 15 * scale;
  const top = cy - ry - 3;
  const h = (2 * ry + 6) * Math.min(1, lid);
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={INK} />
      <circle cx={cx + 4 * scale} cy={cy - 5 * scale} r={4 * scale} fill={C.cream} />
      {lid > 0.01 && <rect x={cx - rx - 4} y={top} width={2 * rx + 8} height={h} fill={SKIN} />}
      {lid > 0.6 && <line x1={cx - rx} y1={top + h} x2={cx + rx} y2={top + h} stroke={INK} strokeWidth={5} strokeLinecap="round" />}
      {lash && lid < 0.5 && (
        <line x1={cx + side * (rx - 2)} y1={cy - ry + 4} x2={cx + side * (rx + 9)} y2={cy - ry - 4} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      )}
    </g>
  );
};

/** Персонаж внутри любого SVG (координаты кадра). */
export const CharacterArt: React.FC<CharacterProps> = ({
  who,
  pose = 'stand',
  emotion = 'neutral',
  talking = false,
  look = 'front',
  x = 540,
  y = 1500,
  scale = 1,
  flip = false,
  poseFrom,
  poseT = 1,
  emotionFrom,
  emotionT = 1,
  prop = 'none',
  frozen = false,
  headTilt = 0,
  armR,
  bob = 0,
  seed,
  phoneLevel,
}) => {
  const frame = useCurrentFrame();
  const id = seed ?? who;

  // Поза
  const p = blendPose(poseFrom ?? pose, pose, poseT);
  const r0 = POSES[poseFrom ?? pose].r;
  const rSh = armR?.sh === undefined ? p.r.sh : lerp(r0.sh, armR.sh, poseT);
  let rEl = armR?.el === undefined ? p.r.el : lerp(r0.el, armR.el, poseT);
  if (pose === 'wave' && poseT > 0.5) rEl += 18 * Math.sin(frame * 0.42);
  // «Заходите»: ладонь мягко покачивается к себе
  if (pose === 'welcome' && poseT > 0.5) rEl += 14 * Math.sin(frame * 0.3);

  // Эмоция: брови и рот морфятся через interpolatePath
  const eA = EMOTIONS[emotionFrom ?? emotion];
  const eB = EMOTIONS[emotion];
  const t = emotionT;
  const brows = ([-1, 1] as const).map((side) => {
    const a = browPath(side === -1 ? eA.browL : eA.browR, side);
    const b = browPath(side === -1 ? eB.browL : eB.browR, side);
    return t >= 1 ? b : interpolatePath(t, a, b);
  });
  let mouth: string;
  if (talking && !frozen) {
    const [m1, m2, mt] = talkShapes(frame, id, emotion === 'happy' || emotion === 'proud');
    mouth = interpolatePath(mt, MOUTH[m1], MOUTH[m2]);
  } else {
    const mA = MOUTH[mouthOf(who, emotionFrom ?? emotion)];
    const mB = MOUTH[mouthOf(who, emotion)];
    mouth = t >= 1 ? mB : interpolatePath(t, mA, mB);
  }
  const eyeScale = lerp(eA.eye, eB.eye, t);
  const lid = Math.min(1, lerp(eA.lid, eB.lid, t) + (frozen ? 0 : blink(frame, id)));
  const blush = lerp(eA.blush, eB.blush, t);
  const tilt = lerp(eA.tilt, eB.tilt, t) + (p.tilt ?? 0) + headTilt;

  // Взгляд — в экранных координатах, поэтому при flip зеркалим
  const lk = LOOK[look];
  const lx = flip ? -lk.x : lk.x;
  const ly = lk.y;
  const br = frozen ? 0 : breath(frame, id);
  const lift = p.lift ?? 0;

  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -scale : scale} ${scale})`}>
      <g data-part="back" transform={`translate(0 ${br})`}>
        <Back who={who} />
      </g>
      <g data-part="legs">
        <Legs who={who} />
      </g>
      <g data-part="body" transform={`translate(0 ${br})`}>
        <Torso who={who} />
        {prop === 'groceries' && <Groceries />}
        <g data-part="head" transform={`rotate(${tilt} ${NECK.x} ${NECK.y})`}>
          <g transform={`translate(${lx * 0.4} 0)`}>
            <HeadShape who={who} />
            <path d={HAIR_PATH[who]} fill={who === 'passerby' ? C.cream : HAIR} />
            {who === 'passerby' && <Cap />}
          </g>
          <g data-part="face" transform={`translate(${lx} ${ly})`}>
            <g data-part="brows" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round">
              <path d={brows[0]} />
              <path d={brows[1]} />
            </g>
            <g data-part="eyes">
              <Eye cx={-38} cy={-676} scale={eyeScale} lid={lid} lash={who === 'ustoz'} side={-1} />
              <Eye cx={38} cy={-676} scale={eyeScale} lid={lid} lash={who === 'ustoz'} side={1} />
            </g>
            {blush > 0.01 && (
              <g data-part="blush" fill={C.terraLight} opacity={blush}>
                <ellipse cx={-64} cy={-630} rx={21} ry={12} />
                <ellipse cx={64} cy={-630} rx={21} ry={12} />
              </g>
            )}
            {who === 'passerby' && (
              <path
                data-part="moustache"
                d="M -40 -641 Q -20 -660 0 -648 Q 20 -660 40 -641 Q 20 -634 0 -640 Q -20 -634 -40 -641 Z"
                fill={C.cream}
              />
            )}
            <path data-part="mouth" d={mouth} transform={`translate(0 ${MOUTH_Y})`} fill={INK} />
          </g>
        </g>
        <g data-part="arms" transform={`translate(0 ${-lift})`}>
          <ArmRig who={who} side={-1} sh={p.l.sh} el={p.l.el} hand={p.l.hand} prop={prop} />
          <ArmRig who={who} side={1} sh={rSh} el={rEl} hand={p.r.hand} prop={prop} level={phoneLevel} />
        </g>
      </g>
    </g>
  );
};

/** Персонаж отдельным слоем на весь кадр 1080×1920 (x, y — точка между стопами). */
export const Character: React.FC<CharacterProps> = (props) => (
  <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}>
    <CharacterArt {...props} />
  </svg>
);
