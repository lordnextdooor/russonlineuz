// Ролик 1 · «Я заболел» yoki «Я заболела»? — marketing/reels/scripts-motion-01.md
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cover, Label, Pop, Reel, Scene, SceneDef, StrikeText, Translation, Words} from '../brand/components';
import {C, FONT, THEME, TYPE, Theme} from '../brand/tokens';

/** Русский глагол, к которому прилетает окончание «а» цветом акцента. */
const Ending: React.FC<{base: string; delay: number; theme: Theme; size?: number}> = ({base, delay, theme, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 160, mass: 0.6}});
  return (
    <div style={{...TYPE.phrase, ...(size ? {fontSize: size} : {}), fontFamily: FONT, color: THEME[theme].text, whiteSpace: 'nowrap'}}>
      {base}
      <span
        style={{
          display: 'inline-block',
          color: THEME[theme].accent,
          opacity: Math.min(1, p * 2),
          transform: `translateY(${(1 - p) * -160}px) scale(${0.4 + 0.6 * p})`,
        }}
      >
        а
      </span>
    </div>
  );
};

/** Карточка «ERKAK / AYOL» с фразой и галочкой. */
const Card: React.FC<{who: string; base: string; ending: boolean; delay: number}> = ({who, base, ending, delay}) => (
  <Pop delay={delay} from={0.8}>
    <div
      style={{
        width: 800,
        background: C.cream,
        borderRadius: 32,
        padding: '36px 44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14}}>
        <Label text={who} color={C.terraDark} delay={delay + 4} size={30} />
        {ending ? (
          <Ending base={base} delay={delay + 14} theme="cream" size={72} />
        ) : (
          <div style={{...TYPE.phrase, fontSize: 72, color: C.navy}}>{base}</div>
        )}
      </div>
      <Check delay={delay + 22} size={84} />
    </div>
  </Pop>
);

/** Ошибочная форма зачёркивается, ниже появляется правильная с «а». */
const Pair: React.FC<{theme: Theme; base: string; uz: string}> = ({theme, base, uz}) => (
  <Scene theme={theme} gap={36}>
    <StrikeText text={base} delay={16} color={THEME[theme].text} role="phrase" />
    <Ending base={base} delay={30} theme={theme} />
    <Translation text={uz} theme={theme} delay={42} />
  </Scene>
);

/** Большая «а» падает сверху и приземляется с отскоком. */
const BigA: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 7, stiffness: 140, mass: 0.8}});
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 360,
        fontWeight: 900,
        lineHeight: 1,
        color: C.terra,
        transform: `translateY(${(1 - p) * -500}px)`,
        opacity: frame < delay ? 0 : 1,
      }}
    >
      «а»
    </div>
  );
};

// Зачёркивание, прилёт «а», перевод — в такт анимации Pair
const PAIR_SFX: SceneDef['sfx'] = [[16, 'swipe'], [32, 'pop']];

const scenes: SceneDef[] = [
  {
    theme: 'cream',
    dur: 55,
    sfx: [[0, 'impact'], [18, 'pop']],
    el: (
      <Scene theme="cream" gap={70}>
        <Words text="Ayol boʻlsangiz, bunday demang!" role="hook" color={C.navy} accent={['demang!']} />
        <Pop delay={18}>
          <div style={{...TYPE.phrase, fontSize: 110, color: C.navy}}>Я заболел</div>
        </Pop>
      </Scene>
    ),
  },
  {
    theme: 'cream',
    dur: 80,
    sfx: [[12, 'swipe'], [30, 'pop']],
    el: (
      <Scene theme="cream" gap={48}>
        <StrikeText text="Я заболел" delay={12} color={C.navy} role="phrase" />
        <Pop delay={30} from={0.85}>
          <div style={{background: C.navy, color: C.cream, fontSize: 48, fontWeight: 800, padding: '16px 36px', borderRadius: 999}}>
            Ayol uchun — xato
          </div>
        </Pop>
      </Scene>
    ),
  },
  {
    theme: 'cream',
    dur: 95,
    sfx: [[12, 'pop'], [30, 'ding']],
    el: (
      <Scene theme="cream" gap={44}>
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <Ending base="Я заболел" delay={10} theme="cream" />
          <Check delay={30} />
        </div>
        <Translation text="Kasal boʻlib qoldim" theme="cream" delay={38} />
      </Scene>
    ),
  },
  {
    theme: 'navy',
    dur: 105,
    sfx: [[6, 'pop'], [28, 'ding'], [26, 'pop'], [40, 'pop'], [48, 'ding']],
    el: (
      <Scene theme="navy" gap={40}>
        <Card who="Erkak" base="Я заболел" ending={false} delay={6} />
        <Card who="Ayol" base="Я заболел" ending delay={26} />
      </Scene>
    ),
  },
  {
    theme: 'cream',
    dur: 90,
    sfx: [[22, 'impact'], [40, 'pop']],
    el: (
      <Scene theme="cream" gap={30}>
        <Words text="Ayol gapirsa — oxiriga" role="body" size={68} color={C.navy} />
        <BigA delay={16} />
        <Label text="oʻtgan zamonda" color={C.terraDark} delay={40} size={34} />
      </Scene>
    ),
  },
  {theme: 'navy', dur: 85, el: <Pair theme="navy" base="Я устал" uz="Charchadim" />, sfx: PAIR_SFX},
  {theme: 'cream', dur: 85, el: <Pair theme="cream" base="Я опоздал" uz="Kechikdim" />, sfx: PAIR_SFX},
];

export const ZABOLELA_SCENES = scenes;
export const Zabolela: React.FC = () => <Reel scenes={scenes} />;

export const ZabolelaCover: React.FC = () => (
  <Cover>
    <div>Ayol boʻlsangiz,</div>
    <div>
      <span style={{color: C.terra}}>bunday</span> demang!
    </div>
    <div style={{...TYPE.phrase, fontSize: 96, marginTop: 40, opacity: 0.8}}>Я заболел</div>
  </Cover>
);
