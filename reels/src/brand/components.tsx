// Общие элементы серии: появление слов, зачёркивание, галочка, маркер, знак, финал, прогресс-бар
import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {C, FONT, SAFE, THEME, TYPE, Theme, WORD_SPRING, WORD_STAGGER} from './tokens';

const useSpring = (delay: number, config = WORD_SPRING) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

/** Слова появляются по одному: снизу вверх с пружиной. Слова из accent — цветом акцента. */
export const Words: React.FC<{
  text: string;
  delay?: number;
  role?: keyof typeof TYPE;
  color: string;
  accent?: string[];
  accentColor?: string;
  stagger?: number;
  size?: number;
}> = ({text, delay = 0, role = 'body', color, accent = [], accentColor = C.terra, stagger = WORD_STAGGER, size}) => (
  <div
    style={{
      ...TYPE[role],
      ...(size ? {fontSize: size} : {}),
      fontFamily: FONT,
      color,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      columnGap: '0.28em',
    }}
  >
    {text.split(' ').map((word, i) => (
      <Word key={i} delay={delay + i * stagger} color={accent.includes(word) ? accentColor : color}>
        {word}
      </Word>
    ))}
  </div>
);

const Word: React.FC<{delay: number; color: string; children: React.ReactNode}> = ({delay, color, children}) => {
  const p = useSpring(delay);
  return (
    <span style={{display: 'inline-block', color, opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 40}px)`}}>
      {children}
    </span>
  );
};

/** Появление блока пружиной (масштаб + прозрачность). */
export const Pop: React.FC<{delay?: number; from?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  from = 0.6,
  children,
  style,
}) => {
  const p = useSpring(delay, {damping: 12, stiffness: 140, mass: 0.7});
  return (
    <div style={{opacity: Math.min(1, p * 1.5), transform: `scale(${from + (1 - from) * p})`, ...style}}>{children}</div>
  );
};

/** Текст с ошибкой: линия перечёркивает за 8 кадров, затем текст тускнеет до 45%. */
export const StrikeText: React.FC<{text: string; delay: number; color: string; role?: keyof typeof TYPE; enter?: number}> = ({
  text,
  delay,
  color,
  role = 'phrase',
  enter = 0,
}) => {
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const line = interpolate(frame, [delay, delay + 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const dim = interpolate(frame, [delay + 8, delay + 14], [1, 0.45], clamp);
  return (
    <Pop delay={enter}>
      <div style={{position: 'relative', display: 'inline-block', ...TYPE[role], fontFamily: FONT, color}}>
        <span style={{opacity: dim}}>{text}</span>
        <div
          style={{
            position: 'absolute',
            left: -10,
            right: -10,
            top: '52%',
            height: 8,
            borderRadius: 4,
            background: color,
            transform: `scaleX(${line})`,
            transformOrigin: 'left center',
          }}
        />
      </div>
    </Pop>
  );
};

/** Галочка: круг пружиной, затем обводка галочки. */
export const Check: React.FC<{delay: number; size?: number; color?: string; mark?: string}> = ({
  delay,
  size = 96,
  color = C.terra,
  mark = C.cream,
}) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, {damping: 12, stiffness: 160, mass: 0.6});
  const draw = interpolate(frame, [delay + 6, delay + 18], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{transform: `scale(${p})`, flexShrink: 0}}>
      <circle cx="24" cy="24" r="24" fill={color} />
      <path
        d="M14 24.5l7 7 13-14"
        fill="none"
        stroke={mark}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw}
      />
    </svg>
  );
};

/** Плашка-маркер под словом: растёт слева направо. */
export const Marker: React.FC<{delay: number; color: string; children: React.ReactNode}> = ({delay, color, children}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <span style={{position: 'relative', display: 'inline-block', padding: '0 18px'}}>
      <span
        style={{
          position: 'absolute',
          inset: '6% 0',
          borderRadius: 12,
          background: color,
          transform: `scaleX(${s})`,
          transformOrigin: 'left center',
        }}
      />
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};

// Облачка знака — контуры из site/scripts/og.mjs (viewBox 0 0 100 62)
const LEFT = 'M8.5 1.75H52.5A5 5 0 0 1 57.5 6.75V36.75A5 5 0 0 1 52.5 41.75H25L12 52.5L14 41.75H8.5A5 5 0 0 1 3.5 36.75V6.75A5 5 0 0 1 8.5 1.75Z';
const RIGHT = 'M49 16.5H90A5 5 0 0 1 95 21.5V49A5 5 0 0 1 90 54H82.5L84 60.5L73 54H49A5 5 0 0 1 44 49V21.5A5 5 0 0 1 49 16.5Z';

/** Знак «Aa / Яя»: сначала левое облачко, через 6 кадров правое. outline — цвет фона. */
export const Mark: React.FC<{
  size: number;
  delay?: number;
  outline?: string;
  left?: string;
  leftText?: string;
  opacity?: number;
  still?: boolean;
}> = ({size, delay = 0, outline = C.cream, left = C.navy, leftText = C.cream, opacity = 1, still = false}) => {
  const a = useSpring(delay, {damping: 12, stiffness: 140, mass: 0.7});
  const b = useSpring(delay + 6, {damping: 12, stiffness: 140, mass: 0.7});
  const bubble = (p: number, ox: number, oy: number): React.CSSProperties => ({
    transformBox: 'fill-box',
    transformOrigin: `${ox}% ${oy}%`,
    transform: `scale(${still ? 1 : p})`,
  });
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 100 62" style={{opacity, overflow: 'visible'}}>
      <g style={bubble(a, 20, 90)}>
        <path d={LEFT} fill={left} />
        <text x="16.5" y="28" fontFamily={FONT} fontWeight={800} fontSize="18" fill={leftText}>
          Aa
        </text>
      </g>
      <g style={bubble(b, 80, 95)}>
        <path d={RIGHT} fill={C.terra} stroke={outline} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke" />
        <text x="57" y="41.3" fontFamily={FONT} fontWeight={800} fontSize="18" fill={C.cream}>
          Яя
        </text>
      </g>
    </svg>
  );
};

/** Крупный знак в углу на 6% прозрачности — медленно всплывает, чтобы фон не был мёртвым. */
const Watermark: React.FC<{theme: Theme}> = ({theme}) => {
  const frame = useCurrentFrame();
  const navy = theme === 'navy';
  return (
    <div style={{position: 'absolute', right: -260, bottom: 20 + frame * 0.6, opacity: navy ? 0.05 : 0.04}}>
      <Mark size={900} still outline={THEME[theme].bg} left={navy ? C.cream : C.navy} leftText={THEME[theme].bg} />
    </div>
  );
};

/** Сцена: фон темы + центрированная колонка в безопасной зоне. */
export const Scene: React.FC<{theme: Theme; children: React.ReactNode; gap?: number}> = ({theme, children, gap = 40}) => (
  <AbsoluteFill style={{background: THEME[theme].bg}}>
    <Watermark theme={theme} />
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        right: SAFE.right,
        top: SAFE.top + 60,
        bottom: SAFE.bottom + 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/** Перевод на узбекский под русской фразой. */
export const Translation: React.FC<{text: string; theme: Theme; delay: number}> = ({text, theme, delay}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        ...TYPE.translation,
        fontFamily: FONT,
        color: THEME[theme].sub,
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** Небольшая подпись заглавными с разрядкой. */
export const Label: React.FC<{text: string; color: string; delay?: number; size?: number}> = ({text, color, delay = 0, size}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        ...TYPE.caption,
        ...(size ? {fontSize: size} : {}),
        fontFamily: FONT,
        color,
        opacity: Math.min(1, p),
        textTransform: 'uppercase',
      }}
    >
      {text}
    </div>
  );
};

/** Финал: знак, «1-dars bepul», @russonlineuz, «Nazokat Yusupova». children — доп. слой поверх (например, персонаж машет). */
export const Outro: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{background: C.navy, alignItems: 'center', justifyContent: 'center', gap: 44, fontFamily: FONT, paddingBottom: 120}}
  >
    <Mark size={360} delay={2} outline={C.navy} left={C.cream} leftText={C.navy} />
    <Pop delay={14}>
      <div style={{fontSize: 96, fontWeight: 900, color: C.cream, letterSpacing: -1}}>
        1-dars <span style={{color: C.terraLight}}>bepul</span>
      </div>
    </Pop>
    <Pop delay={22} from={0.9}>
      <div style={{fontSize: 52, fontWeight: 800, color: C.cream}}>@russonlineuz</div>
    </Pop>
    <Pop delay={28} from={0.9}>
      <div style={{...TYPE.caption, fontSize: 32, color: C.peach, textTransform: 'uppercase'}}>Nazokat Yusupova</div>
    </Pop>
    {children}
  </AbsoluteFill>
);

// Звуки из public/audio (синтезированы scripts/make-audio.mjs) и их громкость
export type Sfx = 'pop' | 'ding' | 'swipe' | 'impact' | 'whoosh' | 'giggle';
const SFX_VOLUME: Record<Sfx, number> = {pop: 0.55, ding: 0.45, swipe: 0.5, impact: 0.7, whoosh: 0.4, giggle: 0.4};
const MUSIC_VOLUME = 0.3;

/** sfx — звуки внутри сцены: [кадр от начала сцены, звук]. */
export type SceneDef = {theme: Theme; dur: number; el: React.ReactNode; sfx?: [number, Sfx][]};
export const TRANSITION = 10;
export const OUTRO = 75;

/** Музыка на весь ролик, шторки между сценами, звуки сцен и финала. */
const Soundtrack: React.FC<{scenes: SceneDef[]; total: number}> = ({scenes, total}) => {
  const events: [number, Sfx][] = [];
  let start = 0;
  // После каждой сцены идёт шторка (после последней — к финалу)
  scenes.forEach((s) => {
    (s.sfx ?? []).forEach(([at, kind]) => events.push([start + at, kind]));
    start += s.dur - TRANSITION;
    events.push([start - 2, 'whoosh']);
  });
  events.push([start + 2, 'impact'], [start + 14, 'ding']);
  return (
    <>
      <Audio
        src={staticFile('audio/music.wav')}
        volume={(f) =>
          MUSIC_VOLUME * interpolate(f, [0, 8, total - 20, total], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
        }
      />
      {events.map(([at, kind], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={30}>
          <Audio src={staticFile(`audio/${kind}.wav`)} volume={SFX_VOLUME[kind]} />
        </Sequence>
      ))}
    </>
  );
};

export const reelDuration = (scenes: SceneDef[]) =>
  scenes.reduce((s, x) => s + x.dur, 0) + OUTRO - TRANSITION * scenes.length;

/**
 * Ролик: сцены со шторкой снизу вверх, финал, прогресс-бар и подпись поверх. outro — доп. слой финала.
 * captionPlate — подпись на кремовой плашке (когда под ней не фон сцены, а пол с плиткой).
 */
export const Reel: React.FC<{scenes: SceneDef[]; outro?: React.ReactNode; captionPlate?: boolean}> = ({scenes, outro, captionPlate}) => {
  const frame = useCurrentFrame();
  const total = reelDuration(scenes);
  // Тема активной сцены — для цвета прогресс-бара и подписи
  let t = 0;
  let theme: Theme | null = null;
  for (const s of scenes) {
    if (frame < t + s.dur - TRANSITION / 2) {
      theme = s.theme;
      break;
    }
    t += s.dur - TRANSITION;
  }
  const colors = theme ? THEME[theme] : null;
  const timing = linearTiming({durationInFrames: TRANSITION, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <Soundtrack scenes={scenes} total={total} />
      <TransitionSeries>
        {scenes.flatMap((s, i) => [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.dur}>
            {s.el}
          </TransitionSeries.Sequence>,
          <TransitionSeries.Transition key={`t${i}`} presentation={slide({direction: 'from-bottom'})} timing={timing} />,
        ])}
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro>{outro}</Outro>
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {colors && (
        <>
          <div
            style={{
              position: 'absolute',
              top: SAFE.top,
              left: SAFE.left,
              width: 1080 - SAFE.left - SAFE.right,
              height: 8,
              borderRadius: 4,
              background: `${colors.text}26`,
            }}
          >
            <div style={{height: 8, borderRadius: 4, background: colors.accent, width: `${(frame / total) * 100}%`}} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: SAFE.left,
              top: 1440,
              ...TYPE.caption,
              color: colors.sub,
              // Плашка не сдвигает текст: отступы компенсированы отрицательным полем
              ...(captionPlate ? {background: C.cream, padding: '14px 22px', margin: '-14px 0 0 -22px', borderRadius: 999} : {}),
            }}
          >
            NAZOKAT YUSUPOVA · @RUSSONLINEUZ
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/** Обложка: статичный кадр для сетки 3:4 — хук в зоне y 360–1400, водяной знак, плашка. */
export const Cover: React.FC<{children: React.ReactNode; badge?: string}> = ({children, badge = '1-dars bepul'}) => (
  <AbsoluteFill style={{background: C.cream, fontFamily: FONT}}>
    <div style={{position: 'absolute', right: -260, bottom: 20}}>
      <Mark size={900} opacity={0.04} still />
    </div>
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: 360,
        height: 1040,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 64,
        textAlign: 'center',
      }}
    >
      <div style={{...TYPE.hook, fontSize: 116, color: C.navy}}>{children}</div>
      <div style={{background: C.navy, color: C.cream, fontSize: 48, fontWeight: 800, padding: '18px 44px', borderRadius: 999}}>
        {badge}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <Mark size={96} still />
        <div style={{fontSize: 40, fontWeight: 800, color: C.navy}}>
          RUSSONLINE<span style={{color: C.terra}}>UZ</span>
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
