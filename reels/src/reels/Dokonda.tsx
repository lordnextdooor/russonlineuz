// Ролик 2 · Doʻkonda kerak boʻladigan 3 ibora — marketing/reels/scripts-motion-01.md
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cover, Pop, Reel, Scene, SceneDef, Translation, Words} from '../brand/components';
import {C, FONT, THEME, TYPE, Theme} from '../brand/tokens';

const stroke = {fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

/** Линейные иконки 48×48 в стиле Icon.astro */
const Basket: React.FC<{color: string}> = ({color}) => (
  <svg width="220" height="220" viewBox="0 0 48 48">
    <path d="M6 18h36l-4 22H10z" {...stroke} stroke={color} />
    <path d="M16 18l6-10M32 18l-6-10M18 26v8M24 26v8M30 26v8" {...stroke} stroke={color} />
  </svg>
);
const Tag: React.FC<{color: string}> = ({color}) => (
  <svg width="200" height="200" viewBox="0 0 48 48">
    <path d="M24 4v8" {...stroke} stroke={color} />
    <path d="M14 12h20l4 30H10z" {...stroke} stroke={color} />
    <circle cx="24" cy="18" r="2.5" {...stroke} stroke={color} />
    <path d="M19 30h10M21 36h6" {...stroke} stroke={color} />
  </svg>
);
const Eye: React.FC<{color: string}> = ({color}) => (
  <svg width="200" height="200" viewBox="0 0 48 48">
    <path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z" {...stroke} stroke={color} />
    <circle cx="24" cy="24" r="6" {...stroke} stroke={color} />
  </svg>
);

/** Номер фразы в терракотовом круге. */
const Badge: React.FC<{n: number; delay: number}> = ({n, delay}) => (
  <Pop delay={delay}>
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: 999,
        background: C.terra,
        color: C.cream,
        fontFamily: FONT,
        fontSize: 72,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {n}
    </div>
  </Pop>
);

/** Иконка покачивается, как ценник на ниточке. */
const Swing: React.FC<{children: React.ReactNode; delay: number; amp?: number}> = ({children, delay, amp = 14}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 140, mass: 0.7}});
  const t = Math.max(0, frame - delay);
  const angle = amp * Math.exp(-t / 30) * Math.sin(t / 4);
  return (
    <div style={{opacity: Math.min(1, p * 1.5), transform: `scale(${0.6 + 0.4 * p}) rotate(${angle}deg)`, transformOrigin: '50% 0%'}}>
      {children}
    </div>
  );
};

/** Банковская карта въезжает в терминал. */
const CardPay: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [delay, delay + 16], [-420, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{position: 'relative', width: 360, height: 220}}>
      <div style={{position: 'absolute', right: 0, top: 0, width: 170, height: 220, borderRadius: 24, background: C.cream, opacity: 0.95}}>
        <div style={{margin: '24px auto 0', width: 120, height: 70, borderRadius: 10, background: C.navy}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center'}}>
          <Check delay={delay + 18} size={64} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 60,
          width: 230,
          height: 140,
          borderRadius: 18,
          background: C.terraLight,
          transform: `translateX(${x}px)`,
          boxShadow: 'none',
        }}
      >
        <div style={{margin: '26px 0 0 24px', width: 46, height: 34, borderRadius: 6, background: C.peach}} />
      </div>
    </div>
  );
};

const Phrase: React.FC<{theme: Theme; n: number; ru: string; uz: string; icon: React.ReactNode}> = ({theme, n, ru, uz, icon}) => (
  <Scene theme={theme} gap={44}>
    <Badge n={n} delay={2} />
    <Words text={ru} role="phrase" size={104} color={THEME[theme].text} delay={8} stagger={4} />
    <Translation text={uz} theme={theme} delay={26} />
    {icon}
  </Scene>
);

/** Закладка, которая заливается терракотой — «сохраните». */
const Bookmark: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 140, mass: 0.7}});
  const fill = interpolate(frame, [delay + 14, delay + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width="220" height="270" viewBox="0 0 44 54" style={{transform: `translateY(${(1 - drop) * -300}px)`, opacity: frame < delay ? 0 : 1}}>
      <defs>
        <clipPath id="bm">
          <path d="M6 2h32a2 2 0 0 1 2 2v46l-18-11L4 50V4a2 2 0 0 1 2-2z" />
        </clipPath>
      </defs>
      <rect x="0" y={54 - 54 * fill} width="44" height="54" fill={C.terra} clipPath="url(#bm)" />
      <path d="M6 2h32a2 2 0 0 1 2 2v46l-18-11L4 50V4a2 2 0 0 1 2-2z" fill="none" stroke={C.terra} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
};

/** Огромная «3» за хуком. */
const BigThree: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 11, stiffness: 120, mass: 0.9}});
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 520,
        fontWeight: 900,
        lineHeight: 0.9,
        color: C.terraLight,
        opacity: Math.min(1, p),
        transform: `scale(${0.5 + 0.5 * p})`,
      }}
    >
      3
    </div>
  );
};

// Номер, фраза по словам, иконка — в такт анимации Phrase
const PHRASE_SFX: SceneDef['sfx'] = [[2, 'pop'], [34, 'pop']];

const scenes: SceneDef[] = [
  {
    theme: 'navy',
    dur: 60,
    sfx: [[0, 'impact'], [14, 'pop'], [24, 'pop']],
    el: (
      <Scene theme="navy" gap={30}>
        <Words text="Doʻkonda kerak boʻladigan" role="hook" size={96} color={C.cream} delay={4} />
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <BigThree />
          <Swing delay={24} amp={8}>
            <Basket color={C.peach} />
          </Swing>
        </div>
        <Words text="ibora" role="hook" size={120} color={C.cream} delay={14} />
      </Scene>
    ),
  },
  {
    theme: 'cream',
    dur: 115,
    sfx: PHRASE_SFX,
    el: (
      <Phrase
        theme="cream"
        n={1}
        ru="Покажите, пожалуйста"
        uz="Iltimos, koʻrsating"
        icon={<Swing delay={34} amp={0}><Eye color={C.terra} /></Swing>}
      />
    ),
  },
  {
    theme: 'navy',
    dur: 115,
    sfx: PHRASE_SFX,
    el: (
      <Phrase
        theme="navy"
        n={2}
        ru="Сколько это стоит?"
        uz="Bu qancha turadi?"
        icon={<Swing delay={34}><Tag color={C.terraLight} /></Swing>}
      />
    ),
  },
  {
    theme: 'cream',
    dur: 120,
    sfx: [[2, 'pop'], [40, 'swipe'], [58, 'ding']],
    el: (
      <Scene theme="cream" gap={44}>
        <Badge n={3} delay={2} />
        <Words text="Можно оплатить картой?" role="phrase" size={104} color={C.navy} delay={8} stagger={4} />
        <Translation text="Karta bilan toʻlasam boʻladimi?" theme="cream" delay={26} />
        <CardPay delay={40} />
      </Scene>
    ),
  },
  {
    theme: 'cream',
    dur: 95,
    sfx: [[10, 'pop'], [24, 'ding']],
    el: (
      <Scene theme="cream" gap={50}>
        <Bookmark delay={6} />
        <Words text="Saqlab qoʻying — doʻkonda ochasiz" role="body" size={80} color={C.navy} delay={20} accent={['Saqlab', 'qoʻying']} />
      </Scene>
    ),
  },
];

export const DOKONDA_SCENES = scenes;
export const Dokonda: React.FC = () => <Reel scenes={scenes} />;

export const DokondaCover: React.FC = () => (
  <Cover>
    <div>
      <span style={{color: C.terra}}>Doʻkonda</span> kerak
    </div>
    <div>boʻladigan</div>
    <div style={{fontSize: 260, lineHeight: 1, color: C.terra}}>3 ibora</div>
    <div style={{...TYPE.translation, fontSize: 56, color: C.terraDark, marginTop: 24}}>Сколько это стоит?</div>
  </Cover>
);
