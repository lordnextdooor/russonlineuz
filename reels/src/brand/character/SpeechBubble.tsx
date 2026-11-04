// Облачко реплики: русская фраза крупно, узбекский перевод мелко под ней. Появляется пружиной от хвостика.
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../tokens';

const BORDER = 6;
const TAIL_W = 60;
const TAIL_H = 54;

export const SpeechBubble: React.FC<{
  ru: string;
  uz?: string;
  /** Центр облачка по x и его нижний край по y (без хвостика), координаты кадра. */
  x?: number;
  y: number;
  /** x кончика хвостика (на кого указывает); null — без хвостика. */
  tailX?: number | null;
  delay?: number;
  size?: number;
  maxWidth?: number;
  /** Ошибка: кадр, когда реплику зачёркивают (как StrikeText: линия за 8 кадров, затем текст тускнеет до 45%). */
  strike?: number;
  /** Пометка к ошибке («xato») — синяя плашка у угла облачка, появляется после зачёркивания. */
  mark?: string;
}> = ({ru, uz, x = 496, y, tailX = x, delay = 0, size = 80, maxWidth = 848, strike, mark}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 150, mass: 0.7}});
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  // Ручной перенос в ru — символ \n: тогда каждая строка зачёркивается отдельно, по очереди
  const rows = ru.split('\n');
  // Линия по каждой строке; на все строки вместе — те же 8 кадров
  const line = (i: number) =>
    strike === undefined
      ? 0
      : interpolate(frame, [strike + (8 * i) / rows.length, strike + (8 * (i + 1)) / rows.length], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const dim = strike === undefined ? 1 : interpolate(frame, [strike + 8, strike + 14], [1, 0.45], clamp);
  const pm = strike === undefined ? 0 : spring({frame: frame - strike - 8, fps, config: {damping: 12, stiffness: 160, mass: 0.6}});
  // Основание хвостика — не дальше 120 px от центра облачка, кончик отклоняется не больше чем на 60 px
  const base = tailX === null ? 0 : Math.max(-120, Math.min(120, tailX - x));
  const tip = tailX === null ? 0 : Math.max(-60, Math.min(60, tailX - x - base));
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)', width: 'max-content', maxWidth}}>
      <div
        style={{
          position: 'relative',
          opacity: Math.min(1, p * 1.6),
          transform: `scale(${0.5 + 0.5 * p})`,
          transformOrigin: `calc(50% + ${base}px) calc(100% + ${TAIL_H}px)`,
        }}
      >
        <div
          style={{
            background: C.cream,
            border: `${BORDER}px solid ${C.navy}`,
            borderRadius: 48,
            padding: '26px 46px 28px',
            textAlign: 'center',
            fontFamily: FONT,
            textWrap: 'balance',
          }}
        >
          <div style={{fontSize: size, fontWeight: 900, lineHeight: 1.1, color: C.navy, letterSpacing: -1}}>
            {rows.map((row, i) => (
            <React.Fragment key={i}>
            {i > 0 && <br />}
            <span style={{position: 'relative', display: 'inline-block'}}>
              <span style={{opacity: dim}}>{row}</span>
              {strike !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    left: -10,
                    right: -10,
                    top: '52%',
                    height: 8,
                    borderRadius: 4,
                    background: C.navy,
                    transform: `scaleX(${line(i)})`,
                    transformOrigin: 'left center',
                  }}
                />
              )}
            </span>
            </React.Fragment>
            ))}
          </div>
          {uz && <div style={{fontSize: 44, fontWeight: 500, lineHeight: 1.3, color: C.terraDark, marginTop: 10}}>{uz}</div>}
        </div>
        {mark && (
          <div
            style={{
              position: 'absolute',
              right: -22,
              top: -34,
              transform: `scale(${pm})`,
              background: C.navy,
              color: C.cream,
              fontFamily: FONT,
              fontSize: 40,
              fontWeight: 800,
              lineHeight: 1,
              padding: '12px 26px 14px',
              borderRadius: 999,
            }}
          >
            {mark}
          </div>
        )}
        {tailX !== null && (
          <svg
            width={TAIL_W + Math.abs(tip) * 2}
            height={TAIL_H}
            viewBox={`${-TAIL_W / 2 - Math.abs(tip)} 0 ${TAIL_W + Math.abs(tip) * 2} ${TAIL_H}`}
            style={{position: 'absolute', left: `calc(50% + ${base}px)`, top: `calc(100% - ${BORDER}px)`, transform: 'translateX(-50%)', overflow: 'visible'}}
          >
            <path d={`M ${-TAIL_W / 2} -1 L ${TAIL_W / 2} -1 L ${tip} ${TAIL_H - 4} Z`} fill={C.cream} />
            <path
              d={`M ${-TAIL_W / 2} 0 L ${tip} ${TAIL_H - 4} L ${TAIL_W / 2} 0`}
              fill="none"
              stroke={C.navy}
              strokeWidth={BORDER}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

/** Знак «?» (или другой, например «…») над головой: выскакивает пружиной. */
export const Question: React.FC<{x: number; y: number; delay?: number; size?: number; color?: string; char?: string}> = ({
  x,
  y,
  delay = 0,
  size = 240,
  color = C.navy,
  char = '?',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 160, mass: 0.6}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -100%) scale(${p})`,
        transformOrigin: '50% 100%',
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1,
        color,
      }}
    >
      {char}
    </div>
  );
};
