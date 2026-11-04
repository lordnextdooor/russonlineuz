// Лист персонажей «Jasur va Ustoz» для согласования владельцем (still 1080×1920). Не для публикации.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from '../brand/tokens';
import {CharacterArt} from '../brand/character';
import type {Emotion, Pose, Prop, Who} from '../brand/character';

type Cell = {emotion: Emotion; pose: Pose; prop?: Prop; label: string; armR?: {sh?: number; el?: number}};

const ROWS: {who: Who; name: string; note: string; cells: Cell[]}[] = [
  {
    who: 'ustoz',
    name: 'Ustoz',
    note: 'обобщённый образ · пучок · синее платье · терракотовый шарф',
    cells: [
      {emotion: 'neutral', pose: 'stand', label: 'спокойно · стоит'},
      {emotion: 'happy', pose: 'wave', label: 'радость · машет'},
      {emotion: 'proud', pose: 'idea', label: 'гордость · подсказка'},
      {emotion: 'surprised', pose: 'shrug', label: 'удивление · разводит'},
      {emotion: 'happy', pose: 'thumbsUp', label: 'радость · «класс»'},
    ],
  },
  {
    who: 'jasur',
    name: 'Jasur',
    note: 'короткие волосы · рюкзак · кремовая рубашка · синие брюки',
    cells: [
      {emotion: 'happy', pose: 'wave', label: 'радость · машет'},
      {emotion: 'confused', pose: 'shrug', label: 'не понял · разводит'},
      {emotion: 'surprised', pose: 'stand', label: 'удивление · застыл'},
      {emotion: 'oops', pose: 'point', label: '«упс» · румянец'},
      {emotion: 'proud', pose: 'thumbsUp', label: 'гордость · «класс»'},
    ],
  },
  {
    who: 'clerk',
    name: 'Кассир',
    note: 'собеседник: синяя одежда · персиковый фартук',
    cells: [
      {emotion: 'neutral', pose: 'stand', label: 'спокойно · стоит'},
      {emotion: 'neutral', pose: 'hold', prop: 'bag', label: 'держит пакет'},
      {emotion: 'happy', pose: 'thumbsUp', label: 'радость · «класс»'},
      {emotion: 'confused', pose: 'shrug', label: 'не понял · разводит'},
      {emotion: 'happy', pose: 'point', label: 'радость · указывает', armR: {sh: 32, el: 0}},
    ],
  },
];

const SCALE = 0.4;
const ROW_TOP = [250, 810, 1370];
const COLS = [118, 329, 540, 751, 962];

export const CharactersSheet: React.FC = () => (
  <AbsoluteFill style={{background: C.cream, fontFamily: FONT}}>
    <div style={{position: 'absolute', left: 72, top: 70, color: C.navy}}>
      <div style={{fontSize: 64, fontWeight: 900, letterSpacing: -1}}>
        Jasur va <span style={{color: C.terra}}>Ustoz</span>
      </div>
      <div style={{fontSize: 28, fontWeight: 600, letterSpacing: 3, color: C.terraDark, marginTop: 10, textTransform: 'uppercase'}}>
        Персонажи · v1 · на согласование
      </div>
    </div>
    {ROWS.map((row, ri) => (
      <React.Fragment key={row.who}>
        <div style={{position: 'absolute', left: 72, top: ROW_TOP[ri], display: 'flex', alignItems: 'baseline', gap: 20}}>
          <div style={{fontSize: 40, fontWeight: 900, color: C.navy}}>{row.name}</div>
          <div style={{fontSize: 22, fontWeight: 500, color: C.terraDark}}>{row.note}</div>
        </div>
        {row.cells.map((cell, ci) => (
          <div
            key={ci}
            style={{position: 'absolute', left: COLS[ci] - 100, width: 200, top: ROW_TOP[ri] + 448, textAlign: 'center', fontSize: 20, fontWeight: 600, color: C.navy}}
          >
            {cell.label}
          </div>
        ))}
      </React.Fragment>
    ))}
    <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      {ROWS.map((row, ri) =>
        row.cells.map((cell, ci) => (
          <CharacterArt
            key={`${ri}-${ci}`}
            who={row.who}
            x={COLS[ci]}
            y={ROW_TOP[ri] + 430}
            scale={SCALE}
            emotion={cell.emotion}
            pose={cell.pose}
            prop={cell.prop}
            armR={cell.armR}
            frozen
            seed={`${row.who}-${ci}`}
          />
        )),
      )}
    </svg>
  </AbsoluteFill>
);
