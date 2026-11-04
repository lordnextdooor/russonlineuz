// Общие элементы серий «Jasur va Ustoz»: бит-слой, тизер следующей серии, Jasur машет в финале, обложка «N-qism».
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cover} from '../components';
import {C, FONT, WORD_SPRING} from '../tokens';
import {CharacterArt} from './Character';
import {CharacterWindow} from './UstozWindow';
import type {Emotion} from './rig';

export const inRange = (f: number, ranges: [number, number][]) => ranges.some(([a, b]) => f >= a && f < b);

/** Кивок: два коротких наклона головы за 20 кадров начиная с from (градусы для headTilt). */
export const nod = (frame: number, from: number, amp = 7) =>
  frame >= from && frame < from + 20 ? amp * Math.abs(Math.sin(((frame - from) / 10) * Math.PI)) : 0;

/** Бит — слой поверх мира: появляется в from, гаснет за 6 кадров до to. */
export const Beat: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => (
  <Sequence from={from} durationInFrames={to - from} layout="none">
    <BeatFade dur={to - from}>{children}</BeatFade>
  </Sequence>
);
const BeatFade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** Тизер следующей серии внизу кадра: «Keyingi qism:» и название. */
export const Teaser: React.FC<{text: string; delay?: number; x?: number; y?: number}> = ({text, delay = 0, x = 496, y = 1384}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: WORD_SPRING});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -100%) translateY(${(1 - p) * 40}px)`,
        opacity: Math.min(1, p),
        background: C.navy,
        borderRadius: 36,
        padding: '22px 44px 26px',
        textAlign: 'center',
        width: 'max-content',
        maxWidth: 848,
        fontFamily: FONT,
      }}
    >
      <div style={{fontSize: 34, fontWeight: 600, color: C.peach, lineHeight: 1.2}}>Keyingi qism:</div>
      <div style={{fontSize: 52, fontWeight: 800, color: C.cream, lineHeight: 1.2}}>{text}</div>
    </div>
  );
};

/** Финал: Jasur выглядывает снизу в круглом окошке и машет. */
export const OutroWave: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CharacterWindow
      who="jasur"
      from="bottom"
      x={420}
      y={1214}
      size={240}
      enter={30}
      pose="wave"
      poseFrom="stand"
      poseT={Math.min(1, Math.max(0, (frame - 36) / 8))}
      emotion="happy"
    />
  );
};

/** Обложка серии: Jasur в терракотовом круге, «N-qism», заголовок (children). */
export const EpisodeCover: React.FC<{id: string; part: string; emotion?: Emotion; children: React.ReactNode}> = ({
  id,
  part,
  emotion = 'surprised',
  children,
}) => (
  <Cover>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
      <svg width={300} height={300} viewBox="0 0 300 300">
        <defs>
          <clipPath id={id}>
            <circle cx={150} cy={150} r={150} />
          </clipPath>
        </defs>
        <circle cx={150} cy={150} r={150} fill={C.terra} />
        <g clipPath={`url(#${id})`}>
          <CharacterArt who="jasur" x={150} y={140 + 680 * 0.62} scale={0.62} emotion={emotion} frozen />
        </g>
      </svg>
      <div style={{fontSize: 44, fontWeight: 800, color: C.terraDark, letterSpacing: 0}}>{part}</div>
      <div>{children}</div>
    </div>
  </Cover>
);
