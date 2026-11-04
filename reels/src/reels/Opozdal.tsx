// «Jasur va Ustoz» · 2-qism · «Я опоздал» — marketing/reels/scripts-characters-01.md, серия 2
// Одна сцена «офис» (бит 1–8, камера переходит между героями) + общий финал Outro (бит 9).
// Отличия от таблицы сценария по времени: хук держится 2,7 с (замечание владельца — ≥ 2,5 с),
// тизер — 2,5 с, чтобы успеть прочитать; итого ≈ 27,5 с вместо 25. Тексты — без изменений.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Reel, SceneDef, Words} from '../brand/components';
import {C, FONT, SAFE} from '../brand/tokens';
import {
  Beat,
  Camera,
  Character,
  EpisodeCover,
  FLOOR,
  Floor,
  HintAccent,
  Laptop,
  Mug,
  OFFICE,
  OfficeBg,
  OfficeDesk,
  OutroWave,
  Papers,
  SpeechBubble,
  Teaser,
  UstozHint,
  UstozWindow,
  inRange,
  keyed,
  nod,
  tween,
} from '../brand/character';
import type {Emotion, Look, Pose} from '../brand/character';

// ---------- Тайминг битов (кадры, 30 fps) ----------
const B = {hook: 0, boss: 80, oops: 150, what: 225, hint: 275, answer: 425, come: 515, desk: 620, end: 760};
const SCENE = B.end + 10; // +10 — шторка к финалу
const WALK = B.desk + 12; // Jasur идёт к своему столу
const WALK_DUR = 45;
const SIT = WALK + WALK_DUR + 2;

// ---------- Камера ----------
// Крупные планы подобраны так, чтобы второй герой целиком был за краем кадра
type Shot = {s: number; fx: number; fy: number; ax: number; ay: number};
const WIDE: Shot = {s: 1, fx: 0, fy: 0, ax: 0, ay: 0};
const BOSS: Shot = {s: 1.25, fx: OFFICE.bossX, fy: 950, ax: 560, ay: 820};
const JASUR: Shot = {s: 1.25, fx: 210, fy: 605, ax: 480, ay: 720};
// Ниже — для подсказки Ustoz: сверху место под окошко и плашку
const JASUR_LOW: Shot = {...JASUR, ay: 950};
const SHOTS: [number, Shot][] = [
  [0, WIDE],
  [B.boss - 2, BOSS],
  [B.oops - 2, JASUR],
  [B.what - 2, BOSS],
  [B.hint - 4, JASUR_LOW],
  [B.answer - 2, JASUR],
  [B.come - 2, BOSS],
  [B.desk - 2, WIDE],
];

const JX0 = 210; // Jasur в дверях
// В крупном плане начальника Jasur отходит за левый край (иначе у края видна его ладонь); сдвиг идёт вместе с камерой
const JASUR_AWAY: [number, number][] = [[0, 0], [B.boss - 2, -220], [B.oops - 2, 0], [B.what - 2, -220], [B.hint - 4, 0], [B.come - 2, -220], [B.desk - 2, 0]];
const jasurX = (f: number) => tween(f, [[0, JX0], [WALK, OFFICE.jasurX]], WALK_DUR);

const cam = (frame: number) => {
  const s = tween(frame, SHOTS.map(([f, v]) => [f, v.s]));
  const tx = tween(frame, SHOTS.map(([f, v]) => [f, v.ax - v.fx * v.s]));
  const ty = tween(frame, SHOTS.map(([f, v]) => [f, v.ay - v.fy * v.s]));
  // Бит 8: камера едет за Jasur, пока он идёт к столу; в конце стол начальника уходит за левый край
  const follow = Math.min(0, Math.max(-1060, 360 - jasurX(frame)));
  return {s, tx: tx + follow, ty};
};

// ---------- Ключи персонажей ----------
const JASUR_POSE: [number, Pose][] = [
  [0, 'stand'],
  [B.oops + 4, 'nape'],
  [B.hint, 'stand'],
];
const JASUR_EMO: [number, Emotion][] = [
  [0, 'puff'],
  [B.oops, 'oops'],
  [B.hint + 6, 'confused'],
  [B.hint + 96, 'happy'],
  [SIT + 4, 'proud'],
];
const JASUR_LOOK: [number, Look][] = [
  [0, 'right'],
  [B.oops, 'front'],
  [B.hint + 6, 'up'],
  [B.answer, 'right'],
  [B.desk, 'right'],
  [SIT + 4, 'front'],
];
const BOSS_POSE: [number, Pose][] = [
  [0, 'stand'],
  [B.come + 6, 'welcome'],
  [B.desk + 10, 'stand'],
];
const BOSS_EMO: [number, Emotion][] = [
  [0, 'neutral'],
  [B.boss + 8, 'surprised'],
  [B.oops + 20, 'neutral'],
  [B.what, 'confused'],
  [B.hint, 'neutral'],
  [B.come, 'happy'],
];
const BOSS_LOOK: [number, Look][] = [
  [0, 'down'],
  [B.boss + 8, 'left'],
  [B.desk + 16, 'right'],
];

/** Мир офиса: фон, начальник за столом, Jasur. Живёт в кадрах всей сцены. */
const Office: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {s, tx, ty} = cam(frame);

  const jp = keyed(frame, fps, JASUR_POSE);
  const je = keyed(frame, fps, JASUR_EMO);
  const bp = keyed(frame, fps, BOSS_POSE);
  const be = keyed(frame, fps, BOSS_EMO);

  // Часы: минутная стрелка доходит с 9:05 до 9:15
  const minutes = interpolate(frame, [4, 40], [5, 15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  // Запыхался: плечи плавно поднимаются и опускаются (бит 1–2)
  // Только вниз (стопы уходят за пол), чтобы ноги не отрывались от пола
  const puff = frame < B.oops ? (1 + Math.sin(frame * 0.22)) * 3.5 * interpolate(frame, [B.boss, B.oops], [1, 0.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  // Идёт к столу с шагом, затем садится
  const jx = jasurX(frame) + tween(frame, JASUR_AWAY);
  const walking = frame >= WALK && frame < WALK + WALK_DUR;
  const step = walking ? -Math.abs(Math.sin((frame - WALK) * 0.45)) * 12 : 0;
  const sit = interpolate(frame, [SIT, SIT + 12], [0, OFFICE.sit], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  // Облегчённый выдох за столом — кивок; Jasur кивает и после подсказки
  const jasurTilt = nod(frame, B.hint + 98, 6) + nod(frame, SIT + 10, 5);

  return (
    <AbsoluteFill style={{background: C.cream}}>
      <Camera s={s} tx={tx} ty={ty}>
        <OfficeBg minutes={minutes} />
        <Character
          who="boss"
          x={OFFICE.bossX}
          y={FLOOR + OFFICE.sit}
          flip
          pose={bp.value}
          poseFrom={bp.from}
          poseT={bp.t}
          emotion={be.value}
          emotionFrom={be.from}
          emotionT={be.t}
          look={keyed(frame, fps, BOSS_LOOK).value}
          talking={inRange(frame, [
            [B.what + 10, B.what + 22],
            [B.come + 16, B.come + 52],
          ])}
        />
        <OfficeDesk x={OFFICE.bossDesk.x} w={OFFICE.bossDesk.w}>
          <Mug x={700} />
          <Papers x={880} />
        </OfficeDesk>
        <Character
          who="jasur"
          x={jx}
          y={FLOOR + sit}
          bob={step + puff}
          pose={jp.value}
          poseFrom={jp.from}
          poseT={jp.t}
          emotion={je.value}
          emotionFrom={je.from}
          emotionT={je.t}
          look={keyed(frame, fps, JASUR_LOOK).value}
          headTilt={jasurTilt}
          talking={inRange(frame, [
            [B.oops + 14, B.oops + 40],
            [B.answer + 14, B.answer + 44],
          ])}
        />
        <OfficeDesk x={OFFICE.jasurDesk.x} w={OFFICE.jasurDesk.w}>
          <Laptop x={1530} />
        </OfficeDesk>
      </Camera>
      <Floor />
    </AbsoluteFill>
  );
};

/** Ustoz мягко кивает, пока появляется подсказка. */
const UstozHintTalk: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <UstozWindow
        enter={0}
        exit={B.answer - B.hint - 12}
        emotion="happy"
        look="left"
        headTilt={nod(frame, 14, 6) + nod(frame, 70, 6)}
        talking={frame >= 16 && frame < 62}
      />
      <UstozHint
        delay={16}
        stagger={20}
        y={548}
        lines={[{ru: 'Извините, я опоздал', uz: 'Kechirasiz, kechikdim'}]}
        note={
          <>
            Ayol: я опоздал<HintAccent>а</HintAccent>
          </>
        }
      />
    </>
  );
};

const Story: React.FC = () => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Office />

    {/* 1 · Хук: Jasur в дверях, часы 9:15 */}
    <Beat from={B.hook} to={B.boss}>
      <div style={{position: 'absolute', left: SAFE.left, width: 848, top: 262, display: 'flex', flexDirection: 'column'}}>
        <Words text="Jasur ishga kechikdi." role="hook" size={96} color={C.navy} accent={['kechikdi.']} delay={2} />
        <Words text="Nima deydi?" role="hook" size={96} color={C.navy} delay={11} />
      </div>
    </Beat>

    {/* 2 · Начальник поднимает взгляд: «…» */}
    <Beat from={B.boss} to={B.oops}>
      <SpeechBubble ru="…" x={560} y={570} tailX={560} delay={16} size={96} />
    </Beat>

    {/* 3 · Jasur неуверенно: «Я опоздать…» — ошибка, зачёркивание и «xato» */}
    <Beat from={B.oops} to={B.what}>
      <SpeechBubble ru="Я опоздать…" x={500} y={650} tailX={480} delay={12} strike={46} mark="xato" />
    </Beat>

    {/* 4 · Начальник переспрашивает */}
    <Beat from={B.what} to={B.hint}>
      <SpeechBubble ru="Что?" uz="Nima?" x={560} y={580} tailX={560} delay={10} />
    </Beat>

    {/* 5 · Ustoz в окошке и подсказка */}
    <Beat from={B.hint} to={B.answer}>
      <UstozHintTalk />
    </Beat>

    {/* 6 · Jasur спокойно: «Извините, я опоздал» */}
    <Beat from={B.answer} to={B.come}>
      <SpeechBubble ru="Извините, я опоздал" uz="Kechirasiz, kechikdim" x={500} y={650} tailX={480} delay={12} />
      <div style={{position: 'absolute', left: 812, top: 330}}>
        <Check delay={26} size={96} />
      </div>
    </Beat>

    {/* 7 · Начальник: «Ничего. Проходите» и жест «заходите» */}
    <Beat from={B.come} to={B.desk}>
      <SpeechBubble ru="Ничего. Проходите" uz="Hechqisi yoʻq. Kiring" x={560} y={580} tailX={560} delay={14} />
    </Beat>

    {/* 8 · Jasur садится за стол; тизер */}
    <Beat from={SIT + 8} to={SCENE}>
      <Teaser text="Jasur metroni qidiradi" />
    </Beat>
  </AbsoluteFill>
);

// Звуки по сценарию: поп — хук и пузыри, свайп — зачёркивание ошибки, смешок — «Что?», вжух — Ustoz, динь — правильно и за столом
const scenes: SceneDef[] = [
  {
    theme: 'cream',
    dur: SCENE,
    el: <Story />,
    sfx: [
      [10, 'pop'],
      [B.boss + 16, 'pop'],
      [B.oops + 12, 'pop'],
      [B.oops + 46, 'swipe'],
      [B.what + 10, 'pop'],
      [B.what + 22, 'giggle'],
      [B.hint, 'whoosh'],
      [B.answer + 12, 'pop'],
      [B.answer + 28, 'ding'],
      [B.come + 14, 'pop'],
      [SIT + 10, 'ding'],
    ],
  },
];

export const OPOZDAL_SCENES = scenes;
export const Opozdal: React.FC = () => <Reel scenes={scenes} outro={<OutroWave />} captionPlate />;

/** Обложка: Jasur в терракотовом круге, «2-qism», «Я опоздал». */
export const OpozdalCover: React.FC = () => (
  <EpisodeCover id="opozdal-cover" part="2-qism" emotion="oops">
    Я <span style={{color: C.terra}}>опоздал</span>
  </EpisodeCover>
);
