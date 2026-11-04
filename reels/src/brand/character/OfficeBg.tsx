// Фон «офис»: дверь, настенные часы, окно, стулья и столы. Плоские формы в палитре, без текста.
// Координаты — мир (при камере 1:1 x 0–1080 совпадает с кадром); мир шире кадра: окно и стол Jasur — правее, x 1100–1620.
// Пол — на линии FLOOR (общий с магазином), сам пол — Floor из ShopBg.
import React from 'react';
import {C} from '../tokens';

const layer: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'};

export const OFFICE = {
  door: {x: 50, w: 310, top: 580},
  clock: {x: 480, y: 720, r: 84},
  bossX: 820,
  bossDesk: {x: 600, w: 450},
  jasurX: 1420,
  jasurDesk: {x: 1240, w: 380},
  deskTop: 1128,
  /** Сидящий за столом: стопы ниже пола на столько (ноги скрыты столом). */
  sit: 150,
};

/** Настенные часы. minutes — минут после 9:00 (15 → 9:15). */
export const WallClock: React.FC<{x: number; y: number; r: number; minutes: number}> = ({x, y, r, minutes}) => {
  const min = minutes * 6;
  const hour = 270 + minutes * 0.5;
  const hand = (deg: number, len: number, w: number) => (
    <line x1={0} y1={0} x2={0} y2={-len} stroke={C.navy} strokeWidth={w} strokeLinecap="round" transform={`rotate(${deg})`} />
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={C.navy} />
      <circle r={r - 14} fill={C.cream} />
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x={-4} y={-(r - 22)} width={8} height={16} rx={4} fill={C.terra} transform={`rotate(${a})`} />
      ))}
      {hand(hour, r * 0.42, 12)}
      {hand(min, r * 0.66, 8)}
      <circle r={9} fill={C.terra} />
    </g>
  );
};

/** Спинка стула за сидящим (ставится в фон, за персонажем). */
const ChairBack: React.FC<{x: number}> = ({x}) => (
  <rect x={x - 124} y={OFFICE.deskTop - 150} width={248} height={170} rx={40} fill={C.terraDark} />
);

/** Задний план офиса: дверь (проём светлой терракотой), часы, окно, спинки стульев. */
export const OfficeBg: React.FC<{minutes?: number}> = ({minutes = 15}) => {
  const {door, clock} = OFFICE;
  return (
    <svg viewBox="0 0 1080 1920" style={layer}>
      <rect x={door.x} y={door.top} width={door.w} height={1440 - door.top} rx={24} fill={C.navy} />
      <rect x={door.x + 26} y={door.top + 26} width={door.w - 52} height={1440 - door.top} rx={10} fill={C.terraLight} />
      <WallClock x={clock.x} y={clock.y} r={clock.r} minutes={minutes} />
      {/* Окно между столами */}
      <rect x={1080} y={640} width={250} height={320} rx={24} fill={C.navy} />
      <rect x={1100} y={660} width={210} height={135} rx={10} fill={C.peach} />
      <rect x={1100} y={805} width={210} height={135} rx={10} fill={C.peach} />
      <ChairBack x={OFFICE.bossX} />
      <ChairBack x={OFFICE.jasurX} />
    </svg>
  );
};

/** Стол — передний план перед сидящим: синяя тумба, персиковая столешница. children — предметы на столе. */
export const OfficeDesk: React.FC<{x: number; w: number; children?: React.ReactNode}> = ({x, w, children}) => (
  <svg viewBox="0 0 1080 1920" style={layer}>
    <rect x={x + 20} y={OFFICE.deskTop + 20} width={w - 40} height={1450 - OFFICE.deskTop} rx={20} fill={C.navy} />
    <rect x={x} y={OFFICE.deskTop} width={w} height={34} rx={17} fill={C.peach} />
    {/* Тумба с тремя ящиками: персиковые ручки, чтобы синий фасад не был пустым */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={x + w - 150} y={OFFICE.deskTop + 80 + i * 90} width={70} height={14} rx={7} fill={C.peach} />
    ))}
    <rect x={x + w - 196} y={OFFICE.deskTop + 40} width={8} height={1440 - OFFICE.deskTop - 60} rx={4} fill={C.peach} />
    {children}
  </svg>
);

/** Стопка бумаг на столе (низ — на столешнице). */
export const Papers: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x} y={OFFICE.deskTop - 14} width={120} height={14} rx={4} fill={C.cream} transform={`rotate(-3 ${x} ${OFFICE.deskTop})`} />
    <rect x={x + 6} y={OFFICE.deskTop - 26} width={120} height={12} rx={4} fill={C.cream} />
  </g>
);

/** Кружка на столе. */
export const Mug: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x} y={OFFICE.deskTop - 64} width={50} height={64} rx={12} fill={C.terra} />
    <path d={`M ${x + 48} ${OFFICE.deskTop - 50} q 26 0 26 20 q 0 20 -26 20`} fill="none" stroke={C.terra} strokeWidth={9} />
  </g>
);

/** Ноутбук (крышкой к зрителю). */
export const Laptop: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x} y={OFFICE.deskTop - 104} width={150} height={98} rx={12} fill={C.navy} />
    <circle cx={x + 75} cy={OFFICE.deskTop - 56} r={10} fill={C.cream} />
    <rect x={x - 12} y={OFFICE.deskTop - 10} width={174} height={10} rx={5} fill={C.navy} />
  </g>
);
