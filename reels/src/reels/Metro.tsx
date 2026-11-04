// «Jasur va Ustoz» · 3-qism · «Где метро?» — marketing/reels/scripts-characters-01.md, серия 3
// Одна сцена «улица» (бит 1–8, камера переходит между героями) + общий финал Outro (бит 9).
// Отличия от таблицы сценария по времени: хук держится 2,7 с (≥ 2,5 с — замечание владельца), ответ прохожего — 3,8 с
// (жест «прямо», затем «направо» и стрелка), уход Jasur с тизером — 3,7 с; итого ≈ 28,8 с вместо 26. Тексты — без изменений.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {Check, Reel, SceneDef, Words} from '../brand/components';
import {C, FONT, SAFE} from '../brand/tokens';
import {
  Beat,
  Camera,
  Character,
  EpisodeCover,
  FLOOR,
  HintAccent,
  OutroWave,
  STREET,
  SpeechBubble,
  StreetBg,
  StreetFloor,
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
const B = {hook: 0, ask: 80, hm: 170, hint: 230, answer: 380, dir: 485, thanks: 600, leave: 680, end: 790};
const SCENE = B.end + 10; // +10 — шторка к финалу
const APPROACH = B.ask + 2; // Jasur бодро подходит к прохожему
const LEAVE_WALK = B.leave + 8; // Jasur уходит к метро, камера едет за ним
const LEAVE_DUR = 48;
const JX0 = 190;
const JX_END = 1600;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Плавный «горб» 0 → 1 → 0 за dur кадров (поклон). */
const bump = (frame: number, from: number, dur: number) =>
  frame < from || frame > from + dur ? 0 : Math.sin(((frame - from) / dur) * Math.PI);

// ---------- Камера ----------
// Крупные планы подобраны так, чтобы второй герой целиком был за краем кадра
type Shot = {s: number; fx: number; fy: number; ax: number; ay: number};
const WIDE: Shot = {s: 1, fx: 0, fy: 0, ax: 0, ay: 0};
const JASUR: Shot = {s: 1.25, fx: STREET.jasurX, fy: 605, ax: 480, ay: 720};
// Ниже — для подсказки Ustoz: сверху место под окошко и плашку
const JASUR_LOW: Shot = {...JASUR, ay: 1010};
const PASSER: Shot = {s: 1.25, fx: STREET.passerX, fy: 605, ax: 600, ay: 720};
const SHOTS: [number, Shot][] = [
  [0, WIDE],
  [B.ask - 2, JASUR],
  [B.hm - 2, PASSER],
  [B.hint - 4, JASUR_LOW],
  [B.answer - 2, JASUR],
  [B.dir - 2, PASSER],
  [B.thanks - 2, JASUR],
  [B.leave - 2, WIDE],
];

// В крупном плане второй герой уходит за край кадра вместе с камерой (и возвращается вместе с ней)
const JASUR_AWAY: [number, number][] = [[0, 0], [B.hm - 2, -340], [B.hint - 4, 0], [B.dir - 2, -340], [B.thanks - 2, 0]];
const PASSER_AWAY: [number, number][] = [[0, 0], [B.ask - 2, 400], [B.hm - 2, 0], [B.hint - 4, 400], [B.dir - 2, 0], [B.thanks - 2, 400], [B.leave - 2, 0]];
// Уходит за край быстрее камеры (6 кадров из 14), чтобы в середине переезда не висеть разрезанным у края
const AWAY_DUR = 6;
// «Хм»: прохожий отступает на полшага
const PASSER_STEP: [number, number][] = [[0, 0], [B.hm + 6, 50], [B.dir - 2, 0]];

const jasurX = (f: number) =>
  f < LEAVE_WALK ? tween(f, [[0, JX0], [APPROACH, STREET.jasurX]], 22) : tween(f, [[0, STREET.jasurX], [LEAVE_WALK, JX_END]], LEAVE_DUR);
const walkingAt = (f: number) => (f >= APPROACH && f < APPROACH + 22) || (f >= LEAVE_WALK && f < LEAVE_WALK + LEAVE_DUR);

const cam = (frame: number) => {
  const s = tween(frame, SHOTS.map(([f, v]) => [f, v.s]));
  const tx = tween(frame, SHOTS.map(([f, v]) => [f, v.ax - v.fx * v.s]));
  const ty = tween(frame, SHOTS.map(([f, v]) => [f, v.ay - v.fy * v.s]));
  // Бит 8: камера едет за Jasur к метро; в конце в кадре — дома, указатель «М» и вход
  const follow = Math.min(0, Math.max(360 - JX_END, 360 - jasurX(frame)));
  return {s, tx: tx + follow, ty};
};

// ---------- Ключи персонажей ----------
const JASUR_POSE: [number, Pose][] = [
  [0, 'hold'],
  [B.ask, 'stand'],
  [B.thanks + 4, 'thanks'],
  [B.leave, 'stand'],
];
const JASUR_EMO: [number, Emotion][] = [
  [0, 'happy'],
  [44, 'surprised'],
  [62, 'confused'],
  [B.ask, 'happy'],
  [B.ask + 58, 'oops'],
  [B.hint + 6, 'confused'],
  [B.hint + 96, 'happy'],
  [B.leave, 'proud'],
  [LEAVE_WALK + LEAVE_DUR, 'happy'],
];
const JASUR_LOOK: [number, Look][] = [
  [0, 'down'],
  [44, 'front'],
  [B.ask, 'right'],
  [B.ask + 58, 'front'],
  [B.hint + 6, 'up'],
  [B.answer, 'right'],
  [B.answer + 10, 'down'],
  [B.answer + 34, 'right'],
  [LEAVE_WALK + LEAVE_DUR, 'right'],
];
const PASSER_POSE: [number, Pose][] = [
  [0, 'stand'],
  [B.dir + 10, 'pointUp'],
  [B.dir + 50, 'point'],
  [B.thanks, 'stand'],
  [B.leave + 12, 'wave'],
  [B.leave + 50, 'stand'],
];
const PASSER_EMO: [number, Emotion][] = [
  [0, 'neutral'],
  [B.hm + 4, 'surprised'],
  [B.hint, 'neutral'],
  [B.dir, 'happy'],
];
const PASSER_LOOK: [number, Look][] = [
  [0, 'left'],
  [B.dir + 10, 'up'],
  [B.dir + 50, 'right'],
  [B.thanks, 'left'],
  [B.leave + 20, 'right'],
];

/** Мир улицы: дома, фонарь, метро, прохожий, Jasur; тротуар — поверх, неподвижный по вертикали. */
const Street: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {s, tx, ty} = cam(frame);

  const jp = keyed(frame, fps, JASUR_POSE);
  const je = keyed(frame, fps, JASUR_EMO);
  const pp = keyed(frame, fps, PASSER_POSE);
  const pe = keyed(frame, fps, PASSER_EMO);

  // Телефон садится в хуке: заряд уходит до нуля, Jasur удивлён
  const level = interpolate(frame, [12, 40], [0.75, 0], {...clamp, easing: Easing.in(Easing.quad)});
  const jx = jasurX(frame) + tween(frame, JASUR_AWAY, AWAY_DUR);
  const step = walkingAt(frame) ? -Math.abs(Math.sin(frame * 0.45)) * 12 : 0;
  // Вежливый лёгкий поклон перед вопросом
  const bow = bump(frame, B.answer + 6, 26);

  return (
    <AbsoluteFill style={{background: C.cream}}>
      <Camera s={s} tx={tx} ty={ty}>
        <StreetBg />
        <Character
          who="passerby"
          x={STREET.passerX + tween(frame, PASSER_AWAY, AWAY_DUR) + tween(frame, PASSER_STEP, 12)}
          y={FLOOR}
          pose={pp.value}
          poseFrom={pp.from}
          poseT={pp.t}
          emotion={pe.value}
          emotionFrom={pe.from}
          emotionT={pe.t}
          look={keyed(frame, fps, PASSER_LOOK).value}
          talking={inRange(frame, [[B.dir + 16, B.dir + 70]])}
        />
        <Character
          who="jasur"
          x={jx}
          y={FLOOR}
          bob={step + bow * 14}
          pose={jp.value}
          poseFrom={jp.from}
          poseT={jp.t}
          emotion={je.value}
          emotionFrom={je.from}
          emotionT={je.t}
          look={keyed(frame, fps, JASUR_LOOK).value}
          headTilt={bow * -5 + nod(frame, B.hint + 98, 6) + nod(frame, B.thanks + 14, 6)}
          prop={frame < B.ask + 6 ? 'phone' : 'none'}
          phoneLevel={level}
          talking={inRange(frame, [
            [B.ask + 14, B.ask + 42],
            [B.answer + 14, B.answer + 58],
            [B.thanks + 14, B.thanks + 36],
          ])}
        />
      </Camera>
      <StreetFloor offset={tx}>
        <FloorArrow />
      </StreetFloor>
    </AbsoluteFill>
  );
};

// ---------- Стрелки «прямо → направо» ----------
const ARROW_W = 30;
/** Две части стрелки: «прямо» (вверх) и «направо» (поворот и вправо, с наконечником). evolvePath рисует линию. */
const Route: React.FC<{up: string; right: string; head: string; t1: number; t2: number; color?: string; w?: number}> = ({
  up,
  right,
  head,
  t1,
  t2,
  color = C.terra,
  w = ARROW_W,
}) => {
  const a = evolvePath(t1, up);
  const b = evolvePath(t2, right);
  const h = evolvePath(Math.max(0, (t2 - 0.7) / 0.3), head);
  const stroke = {fill: 'none', stroke: color, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  return (
    <g>
      {t1 > 0 && <path d={up} {...stroke} strokeDasharray={a.strokeDasharray} strokeDashoffset={a.strokeDashoffset} />}
      {t2 > 0 && <path d={right} {...stroke} strokeDasharray={b.strokeDasharray} strokeDashoffset={b.strokeDashoffset} />}
      {t2 > 0.7 && <path d={head} {...stroke} strokeDasharray={h.strokeDasharray} strokeDashoffset={h.strokeDashoffset} />}
    </g>
  );
};

const draw = (frame: number, from: number, dur: number) =>
  interpolate(frame, [from, from + dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

/** Бит 8: стрелка «прямо → направо» рисуется на тротуаре, когда Jasur дошёл до метро (координаты кадра). */
const FloorArrow: React.FC = () => {
  const frame = useCurrentFrame();
  const from = LEAVE_WALK + LEAVE_DUR + 2;
  if (frame < from) return null;
  return (
    <Route
      up="M 330 1735 L 330 1600"
      right="M 330 1600 Q 330 1548 382 1548 L 790 1548"
      head="M 752 1508 L 794 1548 L 752 1588"
      t1={draw(frame, from, 12)}
      t2={draw(frame, from + 12, 16)}
      w={34}
    />
  );
};

/** Бит 6: жест прохожего и стрелка-указатель на кремовой табличке слева от него. Время — от начала бита. */
const DirSign: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 26, fps, config: {damping: 14, stiffness: 140, mass: 0.7}});
  return (
    <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <g transform={`translate(255 960) scale(${p}) translate(-255 -960)`} opacity={Math.min(1, p * 1.5)}>
        <rect x={110} y={810} width={290} height={300} rx={40} fill={C.cream} />
        <Route
          up="M 180 1060 L 180 920"
          right="M 180 920 Q 180 870 230 870 L 330 870"
          head="M 296 836 L 334 870 L 296 904"
          t1={draw(frame, 32, 12)}
          t2={draw(frame, 56, 14)}
        />
      </g>
    </svg>
  );
};

/** Ustoz с улыбкой качает головой, затем подсказка. */
const UstozHintTalk: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame >= 8 && frame < 38 ? 7 * Math.sin(((frame - 8) / 30) * Math.PI * 3) : 0;
  return (
    <>
      <UstozWindow
        enter={0}
        exit={B.answer - B.hint - 12}
        emotion="happy"
        look="left"
        headTilt={shake}
        talking={frame >= 30 && frame < 84}
      />
      <UstozHint
        delay={22}
        stagger={20}
        y={548}
        size={64}
        title={
          <>
            Notanishga — «<HintAccent>Вы</HintAccent>»
          </>
        }
        lines={[{ru: 'Извините, вы не подскажете, где метро?', uz: 'Kechirasiz, metro qayerdaligini aytib bera olasizmi?'}]}
      />
    </>
  );
};

const Story: React.FC = () => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Street />

    {/* 1 · Хук: Jasur на улице, телефон сел */}
    <Beat from={B.hook} to={B.ask}>
      <div style={{position: 'absolute', left: SAFE.left, width: 848, top: 262, display: 'flex', flexDirection: 'column'}}>
        <Words text="Jasur notanishga" role="hook" size={96} color={C.navy} accent={['notanishga']} delay={2} />
        <Words text="«ты» dedi…" role="hook" size={96} color={C.navy} delay={11} />
      </div>
    </Beat>

    {/* 2 · Jasur бодро: «Ты знаешь, где метро?» — ошибка, зачёркивание и «xato» */}
    <Beat from={B.ask} to={B.hm}>
      <SpeechBubble ru={'Ты знаешь,\nгде метро?'} uz="Bilasanmi, metro qayerda?" x={500} y={650} tailX={480} delay={12} strike={50} mark="xato" />
    </Beat>

    {/* 3 · Прохожий: брови вверх, отступает на полшага (смешок «хм») — без реплики */}

    {/* 4 · Ustoz в окошке и подсказка */}
    <Beat from={B.hint} to={B.answer}>
      <UstozHintTalk />
    </Beat>

    {/* 5 · Jasur вежливо, с лёгким поклоном */}
    <Beat from={B.answer} to={B.dir}>
      <SpeechBubble ru="Извините, вы не подскажете, где метро?" x={500} y={650} tailX={480} delay={12} size={68} />
      <div style={{position: 'absolute', left: 812, top: 300}}>
        <Check delay={30} size={96} />
      </div>
    </Beat>

    {/* 6 · Прохожий улыбается, показывает: прямо, потом направо */}
    <Beat from={B.dir} to={B.thanks}>
      <SpeechBubble ru="Прямо, потом направо" uz="Toʻgʻriga, keyin oʻngga" x={560} y={650} tailX={600} delay={8} />
      <DirSign />
    </Beat>

    {/* 7 · Jasur благодарит */}
    <Beat from={B.thanks} to={B.leave}>
      <SpeechBubble ru="Спасибо большое!" uz="Katta rahmat!" x={500} y={650} tailX={480} delay={12} />
    </Beat>

    {/* 8 · Jasur уходит к метро, стрелка на тротуаре; тизер */}
    <Beat from={B.leave + 30} to={SCENE}>
      <Teaser text="Jasur shifokorda" />
    </Beat>
  </AbsoluteFill>
);

// Звуки по сценарию: поп — хук и пузыри, свайп — зачёркивание ошибки, смешок — «хм» прохожего, вжух — Ustoz и уход,
// динь — правильный вопрос и «Спасибо большое!»
const scenes: SceneDef[] = [
  {
    theme: 'cream',
    dur: SCENE,
    el: <Story />,
    sfx: [
      [10, 'pop'],
      [B.ask + 12, 'pop'],
      [B.ask + 50, 'swipe'],
      [B.hm + 8, 'giggle'],
      [B.hint, 'whoosh'],
      [B.answer + 12, 'pop'],
      [B.answer + 30, 'ding'],
      [B.dir + 8, 'pop'],
      [B.thanks + 12, 'pop'],
      [B.thanks + 28, 'ding'],
      [B.leave, 'whoosh'],
    ],
  },
];

export const METRO_SCENES = scenes;
export const Metro: React.FC = () => <Reel scenes={scenes} outro={<OutroWave />} captionPlate />;

/** Обложка: Jasur в терракотовом круге, «3-qism», «Вы не подскажете?». */
export const MetroCover: React.FC = () => (
  <EpisodeCover id="metro-cover" part="3-qism" emotion="confused">
    <span style={{color: C.terra}}>Вы</span> не подскажете?
  </EpisodeCover>
);
