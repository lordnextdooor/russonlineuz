// Фон «магазин»: полка с товарами, касса с терминалом, пол. 2–3 плоские формы, без текста.
// Координаты — мир 1080×1920 (при камере 1:1 совпадает с кадром). Пол — на линии y = FLOOR.
import React from 'react';
import {C} from '../tokens';

export const FLOOR = 1425;

const layer: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'};

/** Задний план: полка за покупателем. */
export const ShopBg: React.FC = () => (
  <svg viewBox="0 0 1080 1920" style={layer}>
    <rect x={40} y={880} width={500} height={232} rx={28} fill={C.navy} />
    <rect x={62} y={990} width={456} height={12} rx={6} fill={C.peach} />
    {[
      [84, 924, 58, 66, C.terra],
      [158, 906, 48, 84, C.cream],
      [222, 936, 70, 54, C.peach],
      [312, 914, 54, 76, C.terraLight],
      [382, 930, 62, 60, C.cream],
      [458, 908, 48, 82, C.terra],
      [84, 1036, 70, 66, C.peach],
      [170, 1020, 50, 82, C.terraLight],
      [236, 1044, 64, 58, C.cream],
      [318, 1028, 52, 74, C.terra],
      [386, 1040, 66, 62, C.peach],
      [468, 1022, 46, 80, C.cream],
    ].map(([x, y, w, h, fill], i) => (
      <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} rx={10} fill={fill as string} />
    ))}
  </svg>
);

/** Терминал для оплаты картой. Отдельный слой: ставится между фоном и кассиром, чтобы рука кассира могла на него указать. */
export const ShopTerminal: React.FC<{x?: number}> = ({x = 934}) => (
  <svg viewBox="0 0 1080 1920" style={layer}>
    <rect x={x} y={1034} width={84} height={100} rx={16} fill={C.navy} />
    <rect x={x + 12} y={1046} width={60} height={36} rx={7} fill={C.cream} />
    <circle cx={x + 42} cy={1106} r={9} fill={C.terraLight} />
  </svg>
);

/** Передний план: касса перед кассиром. children — предметы на прилавке (координаты мира). */
export const ShopCounter: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1080 1920" style={layer}>
    <rect x={590} y={1150} width={470} height={320} rx={26} fill={C.terra} />
    <rect x={570} y={1126} width={510} height={36} rx={18} fill={C.navy} />
    {children}
  </svg>
);

/** Хлеб и молоко на прилавке (низ — на уровне столешницы). */
export const Bread: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-54} width={124} height={54} rx={27} fill={C.terraLight} />
    {[28, 56, 84].map((dx) => (
      <line key={dx} x1={dx} y1={-40} x2={dx + 12} y2={-16} stroke={C.cream} strokeWidth={6} strokeLinecap="round" />
    ))}
  </g>
);
export const Milk: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={-112} width={60} height={112} rx={8} fill={C.navy} />
    <path d="M 0 -106 L 30 -136 L 60 -106 Z" fill={C.navy} />
    <rect x={0} y={-76} width={60} height={26} fill={C.cream} />
  </g>
);

/**
 * Пол поверх мира, неподвижный в кадре: на нём стоят герои, по нему идёт подпись ролика.
 * Плитка (кремовые швы, ряды смещены) — чтобы нижняя треть не была пустой однотонной плашкой.
 * Первый ряд выше остальных: в нём подпись на кремовой плашке (Reel captionPlate).
 */
export const Floor: React.FC = () => {
  const top = FLOOR - 5;
  const rows = [top + 150, top + 300, top + 460];
  const joint = 8;
  return (
    <svg viewBox={`0 ${top} 1080 ${1920 - top}`} style={{position: 'absolute', left: 0, top, width: 1080, height: 1920 - top}}>
      <rect x={0} y={top} width={1080} height={1920 - top} fill={C.peach} />
      {rows.map((y) => (
        <rect key={y} x={0} y={y} width={1080} height={joint} fill={C.cream} />
      ))}
      {rows.slice(0, -1).map((y, i) =>
        [0, 1, 2, 3].map((k) => {
          const x = (i % 2 ? 120 : 300) + k * 360;
          return <rect key={`${y}-${k}`} x={x} y={y} width={joint} height={rows[i + 1] - y} fill={C.cream} />;
        }),
      )}
    </svg>
  );
};
export const ShopFloor = Floor;

/** Камера: мир 1080×1920 масштабируется и сдвигается (tx, ty — сдвиг левого верхнего угла). */
export const Camera: React.FC<{s: number; tx: number; ty: number; children: React.ReactNode}> = ({s, tx, ty, children}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: 1080,
      height: 1920,
      transformOrigin: '0 0',
      transform: `translate(${tx}px, ${ty}px) scale(${s})`,
    }}
  >
    {children}
  </div>
);
