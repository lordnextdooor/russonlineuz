// Ustoz в круглом окошке «как в Zoom» (выезжает справа) и терракотовая плашка с подсказкой.
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../tokens';
import {CharacterArt, CharacterProps} from './Character';

type WindowProps = {
    /** Левый верхний угол и диаметр окошка (по сценарию — 260 px в зоне x 640–900, y 260–520). */
    x?: number;
    y?: number;
    size?: number;
    /** Кадр, когда окошко выезжает, и кадр, когда уезжает обратно. */
    enter?: number;
    exit?: number;
    /** Откуда выезжает: справа (звонок Ustoz) или снизу (герой выглядывает из-за края). */
    from?: 'right' | 'bottom';
  } & Omit<CharacterProps, 'x' | 'y' | 'scale'>;

/** Круглое окошко с персонажем по плечи. */
export const CharacterWindow: React.FC<WindowProps> = ({x = 640, y = 260, size = 260, enter = 0, exit, from = 'right', who, ...character}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cfg = {damping: 14, stiffness: 120, mass: 0.8};
  const pin = spring({frame: frame - enter, fps, config: cfg});
  const pout = exit === undefined ? 0 : spring({frame: frame - exit, fps, config: {damping: 200}, durationInFrames: 12});
  const away = from === 'right' ? 1080 - x + 40 : 1920 - y + 40;
  const d = (1 - pin) * away + pout * away;
  const clipId = `window-${who}-${x}-${y}`;
  const r = size / 2;
  const ring = Math.round(size * 0.05);
  const k = size / 260;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{position: 'absolute', left: x, top: y, transform: from === 'right' ? `translateX(${d}px)` : `translateY(${d}px)`}}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={r} cy={r} r={r - ring} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r} fill={C.navy} />
      <circle cx={r} cy={r} r={r - ring} fill={C.cream} />
      <g clipPath={`url(#${clipId})`}>
        {/* Персонаж по плечи: голова в центре окошка */}
        <CharacterArt who={who} x={r} y={r * 0.92 + 680 * 0.52 * k} scale={0.52 * k} {...character} />
      </g>
    </svg>
  );
};

/** Ustoz в окошке «как в Zoom» в правом верхнем углу рабочей зоны. */
export const UstozWindow: React.FC<Omit<WindowProps, 'who'>> = (props) => <CharacterWindow who="ustoz" {...props} />;

/** Плашка-подсказка: строки «русская фраза + перевод» появляются по очереди. */
export const UstozHint: React.FC<{
  lines: {ru: string; uz: string}[];
  delay?: number;
  stagger?: number;
  x?: number;
  y?: number;
  width?: number;
  size?: number;
  /** Мелкая строка под подсказкой (например, форма для женщины), появляется после строк. */
  note?: React.ReactNode;
  /** Строка-правило над фразами (например, «Notanishga — «Вы»»), появляется первой; строки сдвигаются на stagger. */
  title?: React.ReactNode;
}> = ({lines, delay = 0, stagger = 14, x = 72, y = 560, width = 848, size = 72, note, title}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const plate = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{position: 'absolute', left: x, top: y, width, fontFamily: FONT}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 40,
          background: C.terra,
          transform: `scaleX(${plate})`,
          transformOrigin: 'left center',
        }}
      />
      <div style={{position: 'relative', padding: '34px 40px', display: 'flex', flexDirection: 'column', gap: 26, textAlign: 'center'}}>
        {title && <HintNote delay={delay + 8} size={56} weight={800}>{title}</HintNote>}
        {lines.map((l, i) => {
          const p = spring({frame: frame - delay - 8 - (i + (title ? 1 : 0)) * stagger, fps, config: {damping: 14, stiffness: 120, mass: 0.8}});
          return (
            <div key={i} style={{opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 30}px)`}}>
              <div style={{fontSize: size, fontWeight: 900, lineHeight: 1.1, color: C.cream, letterSpacing: -1, textWrap: 'balance'}}>{l.ru}</div>
              <div style={{fontSize: 44, fontWeight: 500, lineHeight: 1.3, color: C.cream}}>{l.uz}</div>
            </div>
          );
        })}
        {note && <HintNote delay={delay + 8 + (lines.length + (title ? 1 : 0)) * stagger}>{note}</HintNote>}
      </div>
    </div>
  );
};

const HintNote: React.FC<{delay: number; size?: number; weight?: number; children: React.ReactNode}> = ({delay, size = 40, weight = 600, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 120, mass: 0.8}});
  return (
    <div style={{opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 20}px)`, fontSize: size, fontWeight: weight, lineHeight: 1.2, color: C.cream}}>
      {children}
    </div>
  );
};

/** Выделение буквы в подсказке: жирнее и с подчёркиванием (окончание «-а» и т. п.). */
export const HintAccent: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{fontWeight: 900, borderBottom: `5px solid ${C.cream}`, paddingBottom: 2}}>{children}</span>
);
