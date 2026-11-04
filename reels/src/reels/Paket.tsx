// «Jasur va Ustoz» · 1-qism · «Пакет нужен?» — marketing/reels/scripts-characters-01.md, серия 1 (≈25 с)
// Одна сцена «магазин» (бит 1–8, камера переходит между героями) + общий финал Outro (бит 9).
// Правки 05.11: хук держится 2,5 с (по сценарию 1,5 — мало, чтобы прочитать); в крупных планах второй герой уходит за край кадра;
// пол с плиткой и подпись на плашке.
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Reel, SceneDef, Words} from '../brand/components';
import {C, FONT, SAFE} from '../brand/tokens';
import {
  Beat,
  Bread,
  Camera,
  Character,
  EpisodeCover,
  FLOOR,
  Floor,
  OutroWave,
  Teaser,
  inRange,
  nod,
  Milk,
  Question,
  ShopBg,
  ShopCounter,
  ShopTerminal,
  SpeechBubble,
  UstozHint,
  UstozWindow,
  keyed,
  tween,
} from '../brand/character';
import type {Emotion, Look, Pose} from '../brand/character';

// ---------- Тайминг битов (кадры, 30 fps) — по таблице сценария ----------
const B = {hook: 0, ask: 75, freeze: 165, hint: 225, answer: 345, pay: 420, card: 510, bye: 585, end: 675};
const SCENE = B.end + 10; // +10 — шторка к финалу
const WALK = B.bye + 52; // Jasur уходит с покупками

// ---------- Камера: общий план, кассир крупнее, Jasur крупнее ----------
type Shot = {s: number; fx: number; fy: number; ax: number; ay: number};
const WIDE: Shot = {s: 1, fx: 0, fy: 0, ax: 0, ay: 0};
const CLERK: Shot = {s: 1.15, fx: 800, fy: 605, ax: 540, ay: 700};
const JASUR: Shot = {s: 1.2, fx: 300, fy: 605, ax: 500, ay: 720};
// Ниже — для подсказки Ustoz: сверху место под окошко и плашку
const JASUR_LOW: Shot = {s: 1.2, fx: 300, fy: 605, ax: 500, ay: 950};
const SHOTS: [number, Shot][] = [
  [0, WIDE],
  [B.ask - 2, CLERK],
  [B.freeze - 2, JASUR],
  [B.hint - 4, JASUR_LOW],
  [B.answer - 2, JASUR],
  [B.pay - 2, CLERK],
  [B.card - 2, JASUR],
  [B.bye - 2, WIDE],
];
const cam = (frame: number) => {
  const s = tween(frame, SHOTS.map(([f, v]) => [f, v.s]));
  const tx = tween(frame, SHOTS.map(([f, v]) => [f, v.ax - v.fx * v.s]));
  const ty = tween(frame, SHOTS.map(([f, v]) => [f, v.ay - v.fy * v.s]));
  return {s, tx, ty};
};

// В крупном плане второй герой отходит за край кадра (иначе у края торчит полголовы); сдвиг идёт вместе с камерой
const JASUR_AWAY: [number, number][] = [[0, 0], [B.ask - 2, -230], [B.freeze - 2, 0], [B.pay - 2, -230], [B.card - 2, 0]];
const CLERK_AWAY: [number, number][] = [[0, 0], [B.freeze - 2, 360], [B.pay - 2, 0], [B.card - 2, 360], [B.bye - 2, 0]];
const lookAt = (f: number, keys: [number, Look][]) => keyed(f, 30, keys).value;

// ---------- Ключи персонажей ----------
const JASUR_POSE: [number, Pose][] = [
  [0, 'reach'],
  [36, 'stand'],
  [B.card + 4, 'hold'],
  [B.bye - 2, 'carry'],
];
const JASUR_EMO: [number, Emotion][] = [
  [0, 'happy'],
  [B.ask, 'neutral'],
  [B.freeze, 'surprised'],
  [B.hint + 6, 'confused'],
  [B.answer + 2, 'happy'],
  [B.card, 'proud'],
  [B.bye, 'happy'],
  [B.bye + 48, 'proud'],
];
const JASUR_LOOK: [number, Look][] = [
  [0, 'right'],
  [B.freeze, 'front'],
  [B.hint + 6, 'up'],
  [B.answer, 'right'],
  [B.bye + 50, 'left'],
];
const CLERK_POSE: [number, Pose][] = [
  [0, 'stand'],
  [B.ask + 6, 'hold'],
  [B.hint, 'stand'],
  [B.pay + 4, 'point'],
  [B.card, 'stand'],
];
const CLERK_EMO: [number, Emotion][] = [
  [0, 'happy'],
  [B.ask, 'neutral'],
  [B.pay, 'happy'],
];

/** Мир магазина: фон, герои, касса. Живёт в кадрах всей сцены. */
const Shop: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {s, tx, ty} = cam(frame);

  const jp = keyed(frame, fps, JASUR_POSE);
  const je = keyed(frame, fps, JASUR_EMO);
  const cp = keyed(frame, fps, CLERK_POSE);
  const ce = keyed(frame, fps, CLERK_EMO);

  // Уходит с покупками (бит 8): влево, с шагом
  const walk0 = WALK;
  const jx = tween(frame, [[0, 300], [walk0, -300]], 42) + tween(frame, JASUR_AWAY);
  const walking = frame >= walk0 && frame < walk0 + 42;
  const bob = walking ? -Math.abs(Math.sin((frame - walk0) * 0.45)) * 12 : 0;

  // Покупки на прилавке: появляются в бите 1, уходят с Jasur в бите 8
  const item = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 11, stiffness: 160, mass: 0.6}});
  const onCounter = frame < B.bye - 2;
  const pop = (x: number, p: number, el: React.ReactNode) => (
    <g transform={`translate(${x} 1128) scale(${p}) translate(${-x} -1128)`}>{el}</g>
  );

  return (
    <AbsoluteFill style={{background: C.cream}}>
      <Camera s={s} tx={tx} ty={ty}>
        <ShopBg />
        <ShopTerminal />
        <Character
          who="clerk"
          x={800 + tween(frame, CLERK_AWAY)}
          y={FLOOR}
          flip={frame < B.pay}
          pose={cp.value}
          poseFrom={cp.from}
          poseT={cp.t}
          armR={frame >= B.pay && frame < B.card ? {sh: 60, el: -70} : undefined}
          emotion={ce.value}
          emotionFrom={ce.from}
          emotionT={ce.t}
          look="left"
          prop={frame >= B.ask && frame < B.hint ? 'bag' : 'none'}
          talking={inRange(frame, [
            [B.ask + 16, B.ask + 38],
            [B.pay + 16, B.pay + 52],
          ])}
        />
        <ShopCounter>
          {onCounter && pop(712, item(10), <Bread x={650} y={1128} />)}
          {onCounter && pop(820, item(16), <Milk x={790} y={1128} />)}
        </ShopCounter>
        <Character
          who="jasur"
          x={jx}
          y={FLOOR}
          bob={bob}
          pose={jp.value}
          poseFrom={jp.from}
          poseT={jp.t}
          emotion={je.value}
          emotionFrom={je.from}
          emotionT={je.t}
          look={lookAt(frame, JASUR_LOOK)}
          frozen={frame >= B.freeze && frame < B.hint}
          headTilt={nod(frame, B.answer + 2)}
          prop={frame >= B.bye - 2 ? 'groceries' : frame >= B.card + 4 ? 'card' : 'none'}
          talking={inRange(frame, [
            [B.answer + 14, B.answer + 34],
            [B.card + 16, B.card + 28],
            [B.bye + 16, B.bye + 32],
          ])}
        />
      </Camera>
      <Floor />
    </AbsoluteFill>
  );
};

const Story: React.FC = () => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Shop />

    {/* 1 · Хук */}
    <Beat from={B.hook} to={B.ask}>
      <div style={{position: 'absolute', left: SAFE.left, width: 848, top: 262, display: 'flex', flexDirection: 'column'}}>
        <Words text="Kassir soʻradi —" role="hook" size={80} color={C.navy} delay={2} />
        <Words text="Jasur qotib qoldi" role="hook" size={80} color={C.navy} accent={['qotib', 'qoldi']} delay={11} />
      </div>
    </Beat>

    {/* 2 · Кассир: «Пакет нужен?» */}
    <Beat from={B.ask} to={B.freeze}>
      <SpeechBubble ru="Пакет нужен?" uz="Paket kerakmi?" x={520} y={640} tailX={560} delay={14} />
    </Beat>

    {/* 3 · Jasur застыл, над головой «?» */}
    <Beat from={B.freeze} to={B.hint}>
      <Question x={520} y={690} delay={14} />
    </Beat>

    {/* 4 · Ustoz в окошке и подсказка */}
    <Beat from={B.hint} to={B.answer}>
      <UstozHintTalk />
    </Beat>

    {/* 5 · Jasur: «Нет, спасибо» */}
    <Beat from={B.answer} to={B.pay}>
      <SpeechBubble ru="Нет, спасибо" uz="Yoʻq, rahmat" x={496} y={650} tailX={500} delay={12} />
      <div style={{position: 'absolute', left: 812, top: 380}}>
        <Check delay={24} size={96} />
      </div>
    </Beat>

    {/* 6 · Кассир: «Картой или наличными?» */}
    <Beat from={B.pay} to={B.card}>
      <SpeechBubble ru="Картой или наличными?" uz="Karta bilanmi yoki naqdmi?" x={496} y={640} tailX={560} delay={14} />
    </Beat>

    {/* 7 · Jasur: «Картой» */}
    <Beat from={B.card} to={B.bye}>
      <SpeechBubble ru="Картой" uz="Karta bilan" x={470} y={650} tailX={500} delay={14} />
      <div style={{position: 'absolute', left: 736, top: 490}}>
        <Check delay={27} size={96} />
      </div>
    </Beat>

    {/* 8 · «Спасибо!» и тизер */}
    <Beat from={B.bye} to={WALK}>
      <SpeechBubble ru="Спасибо!" uz="Rahmat!" x={372} y={560} tailX={310} delay={14} />
    </Beat>
    <Beat from={B.bye + 36} to={SCENE}>
      <Teaser text="Jasur ishga kechikdi" />
    </Beat>
  </AbsoluteFill>
);

/** Ustoz говорит, пока появляются строки подсказки. */
const UstozHintTalk: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <UstozWindow
        enter={0}
        exit={B.answer - B.hint - 12}
        pose="idea"
        emotion="happy"
        look="left"
        talking={frame >= 16 && frame < 58}
      />
      <UstozHint
        delay={16}
        stagger={20}
        y={548}
        lines={[
          {ru: 'Да, пожалуйста', uz: 'Ha, iltimos'},
          {ru: 'Нет, спасибо', uz: 'Yoʻq, rahmat'},
        ]}
      />
    </>
  );
};

// Звуки по сценарию: поп — пузыри и «?», вжух — Ustoz, динь — правильный ответ, смешок — в конце
const scenes: SceneDef[] = [
  {
    theme: 'cream',
    dur: SCENE,
    el: <Story />,
    sfx: [
      [10, 'pop'],
      [B.ask + 14, 'pop'],
      [B.freeze + 14, 'pop'],
      [B.hint, 'whoosh'],
      [B.answer + 12, 'pop'],
      [B.answer + 26, 'ding'],
      [B.pay + 14, 'pop'],
      [B.card + 14, 'pop'],
      [B.card + 29, 'ding'],
      [B.bye + 14, 'pop'],
      [B.bye + 26, 'giggle'],
    ],
  },
];

export const PAKET_SCENES = scenes;
export const Paket: React.FC = () => <Reel scenes={scenes} outro={<OutroWave />} captionPlate />;

/** Обложка: Jasur в терракотовом круге, «1-qism», «Пакет нужен?». */
export const PaketCover: React.FC = () => (
  <EpisodeCover id="paket-cover" part="1-qism">
    Пакет <span style={{color: C.terra}}>нужен?</span>
  </EpisodeCover>
);
