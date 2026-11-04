// Фон «улица»: плоские дома с окнами, фонарь, указатель метро «М» в терракотовом круге, вход в метро. Без текста, кроме «М».
// Координаты — мир (при камере 1:1 x 0–1080 совпадает с кадром); мир шире кадра: справа, x 1100–2500, — дома и метро,
// туда Jasur уходит в конце. Тротуар — StreetFloor, неподвижный в кадре, как пол в магазине и офисе (линия FLOOR).
import React from 'react';
import {C, FONT} from '../tokens';
import {FLOOR} from './ShopBg';

const layer: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'};

export const STREET = {
  jasurX: 330,
  passerX: 800,
  /** Указатель метро и вход: открываются, когда камера едет вправо за Jasur. */
  metroX: 2040,
  entrance: {x: 2110, w: 260},
};

type House = {x: number; w: number; top: number; fill: string; frame: string; pane: string; windows: [number, number][]};

// За героями (x 140–1060) — светлая терракота: на ней читаются и персиковые лица, и синие пальто
const HOUSES: House[] = [
  // Крыши в первом кадре (x 0–1080) — не выше y 600: над ними хук
  {x: -560, w: 640, top: 600, fill: C.peach, frame: C.navy, pane: C.cream, windows: [[-470, 680], [-300, 680], [-470, 920], [-300, 920]]},
  {x: 80, w: 980, top: 600, fill: C.terraLight, frame: C.navy, pane: C.peach, windows: [[475, 680], [900, 680], [475, 920], [900, 920]]},
  {x: 1060, w: 400, top: 420, fill: C.navy, frame: C.navy, pane: C.peach, windows: [[1110, 500], [1290, 500], [1110, 740], [1290, 740], [1110, 980], [1290, 980]]},
  {x: 1460, w: 500, top: 520, fill: C.terraLight, frame: C.navy, pane: C.peach, windows: [[1500, 600], [1780, 600], [1500, 850], [1780, 850]]},
  {x: 1960, w: 640, top: 440, fill: C.navy, frame: C.navy, pane: C.peach, windows: [[2120, 520], [2300, 520], [2480, 520], [2480, 760], [2480, 1000]]},
];

/** Окно: синяя рама, две персиковые створки. */
const Win: React.FC<{x: number; y: number; frame: string; pane: string}> = ({x, y, frame, pane}) => (
  <g>
    <rect x={x} y={y} width={130} height={170} rx={16} fill={frame} />
    <rect x={x + 14} y={y + 14} width={102} height={66} rx={8} fill={pane} />
    <rect x={x + 14} y={y + 90} width={102} height={66} rx={8} fill={pane} />
  </g>
);

/** Фонарь: синий столб, кремовый плафон (без свечения). dir — куда смотрит плафон: 1 вправо, −1 влево. */
const Lamp: React.FC<{x: number; dir?: 1 | -1}> = ({x, dir = 1}) => (
  <g transform={dir === -1 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
    <rect x={x - 9} y={700} width={18} height={FLOOR - 700} rx={9} fill={C.navy} />
    <rect x={x - 26} y={FLOOR - 40} width={52} height={40} rx={12} fill={C.navy} />
    <path d={`M ${x} 712 Q ${x} 660 ${x + 60} 660`} fill="none" stroke={C.navy} strokeWidth={16} strokeLinecap="round" />
    <path d={`M ${x + 34} 660 L ${x + 94} 660 L ${x + 84} 694 L ${x + 44} 694 Z`} fill={C.navy} />
    <rect x={x + 48} y={694} width={32} height={22} rx={8} fill={C.cream} />
  </g>
);

/** Указатель метро: столб и терракотовый круг с кремовой «М» (кремовое кольцо отделяет круг от фона). */
export const MetroSign: React.FC<{x: number; y?: number; r?: number}> = ({x, y = 650, r = 96}) => (
  <g>
    <rect x={x - 10} y={y} width={20} height={FLOOR - y} rx={10} fill={C.cream} />
    <circle cx={x} cy={y} r={r + 12} fill={C.cream} />
    <circle cx={x} cy={y} r={r} fill={C.terra} />
    <text x={x} y={y + r * 0.42} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 1.22} fill={C.cream}>
      М
    </text>
  </g>
);

/** Вход в метро: арка в синем доме, внутри персиковый проём со ступенями. */
const Entrance: React.FC<{x: number; w: number}> = ({x, w}) => (
  <g>
    <path d={`M ${x} ${FLOOR} L ${x} 1030 Q ${x} 900 ${x + w / 2} 900 Q ${x + w} 900 ${x + w} 1030 L ${x + w} ${FLOOR} Z`} fill={C.peach} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={x + 24 + i * 14} y={1250 + i * 44} width={w - 48 - i * 28} height={12} rx={6} fill={C.terraLight} />
    ))}
  </g>
);

/** Задний план улицы. */
export const StreetBg: React.FC = () => (
  <svg viewBox="0 0 1080 1920" style={layer}>
    {HOUSES.map((h, i) => (
      <g key={i}>
        <rect x={h.x} y={h.top} width={h.w} height={FLOOR - h.top + 10} fill={h.fill} />
        {/* Карниз сверху и цоколь снизу — тёмная терракота */}
        <rect x={h.x} y={h.top} width={h.w} height={22} fill={C.terraDark} />
        <rect x={h.x} y={FLOOR - 60} width={h.w} height={70} fill={C.terraDark} />
        {h.windows.map(([wx, wy], k) => (
          <Win key={k} x={wx} y={wy} frame={h.fill === C.navy ? C.cream : h.frame} pane={h.fill === C.navy ? C.peach : h.pane} />
        ))}
      </g>
    ))}
    {/* Фонарь слева, за краем крупного плана прохожего: не спорит с его жестом */}
    <Lamp x={30} dir={-1} />
    <Entrance x={STREET.entrance.x} w={STREET.entrance.w} />
    <MetroSign x={STREET.metroX} />
  </svg>
);

/**
 * Тротуар поверх мира, неподвижный по вертикали: плитка (кремовые швы), бордюр и полоса дороги внизу,
 * чтобы нижняя треть кадра не была пустой. offset — сдвиг камеры по x: швы едут вместе с миром.
 * Первый ряд плитки выше остальных — в нём подпись ролика на плашке (Reel captionPlate).
 */
export const StreetFloor: React.FC<{offset?: number; children?: React.ReactNode}> = ({offset = 0, children}) => {
  const top = FLOOR - 5;
  const rows = [top + 150, top + 245];
  const curb = top + 340;
  const road = curb + 26;
  const joint = 8;
  const tile = 240;
  const shift = (((offset % tile) + tile) % tile) - tile;
  return (
    <svg viewBox={`0 ${top} 1080 ${1920 - top}`} style={{position: 'absolute', left: 0, top, width: 1080, height: 1920 - top}}>
      <rect x={0} y={top} width={1080} height={curb - top} fill={C.peach} />
      {rows.map((y) => (
        <rect key={y} x={0} y={y} width={1080} height={joint} fill={C.cream} />
      ))}
      {/* Вертикальные швы: в верхнем ряду реже, в нижних — шахматкой */}
      {[top, ...rows].map((y, i) => {
        const next = i < rows.length ? rows[i] : curb;
        const step = i === 0 ? tile * 1.5 : tile;
        const from = i === 0 ? shift * 1.5 : shift + (i % 2 ? tile / 2 : 0);
        return Array.from({length: 8}, (_, k) => from + k * step).map((x) => (
          <rect key={`${y}-${x}`} x={x} y={y} width={joint} height={next - y} fill={C.cream} />
        ));
      })}
      <rect x={0} y={curb} width={1080} height={road - curb} fill={C.terraDark} />
      <rect x={0} y={road} width={1080} height={1920 - road} fill={C.navy} />
      {Array.from({length: 6}, (_, k) => shift * 1.5 + k * 360).map((x) => (
        <rect key={x} x={x + 60} y={road + 58} width={180} height={14} rx={7} fill={C.cream} />
      ))}
      {children}
    </svg>
  );
};
