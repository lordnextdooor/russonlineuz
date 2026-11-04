// Ролик 3 · Ты yoki Вы? — marketing/reels/scripts-motion-01.md
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Check, Cover, Label, Marker, Pop, Reel, Scene, SceneDef, Translation, Words} from '../brand/components';
import {C, FONT, THEME, TYPE, Theme} from '../brand/tokens';

/** «Вы = siz»: местоимение, знак «=» пружиной и перевод. */
const Equals: React.FC<{theme: Theme; ru: string; uz: string; who: string[]}> = ({theme, ru, uz, who}) => {
  const t = THEME[theme];
  return (
    <Scene theme={theme} gap={70}>
      <div style={{display: 'flex', alignItems: 'center', gap: 40, fontFamily: FONT, fontWeight: 900}}>
        <Pop delay={2}>
          <div style={{fontSize: 220, color: t.accent, lineHeight: 1}}>{ru}</div>
        </Pop>
        <Pop delay={12} from={0.2}>
          <div style={{fontSize: 140, color: t.text, lineHeight: 1}}>=</div>
        </Pop>
        <Pop delay={20}>
          <div style={{fontSize: 160, color: t.text, lineHeight: 1}}>{uz}</div>
        </Pop>
      </div>
      <div style={{display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center'}}>
        {who.map((w, i) => (
          <Pop key={w} delay={34 + i * 6} from={0.7}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 48,
                fontWeight: 700,
                color: t.text,
                border: `4px solid ${t.accent}`,
                borderRadius: 999,
                padding: '14px 34px',
              }}
            >
              {w}
            </div>
          </Pop>
        ))}
      </div>
    </Scene>
  );
};

/** Слово переворачивается: «вас» уходит, «тебя» приходит; перевод сменяется вместе с ним. */
const Flip: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)} as const;
  const out = interpolate(frame, [at, at + 8], [0, 90], clamp);
  const inn = interpolate(frame, [at + 8, at + 16], [-90, 0], clamp);
  const second = frame >= at + 8;
  const word = second ? 'тебя' : 'вас';
  const angle = second ? inn : out;
  return (
    <Scene theme="cream" gap={44}>
      <Pop delay={2}>
        <div style={{...TYPE.phrase, fontSize: 112, color: C.navy, fontFamily: FONT, whiteSpace: 'nowrap'}}>
          Как{' '}
          <span style={{display: 'inline-block', color: C.terra, transform: `perspective(800px) rotateX(${angle}deg)`}}>{word}</span>{' '}
          зовут?
        </div>
      </Pop>
      <div style={{position: 'relative', height: 80, width: '100%'}}>
        <div style={{position: 'absolute', left: 0, right: 0, opacity: second ? 0 : 1}}>
          <Translation text="Ismingiz nima?" theme="cream" delay={14} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, opacity: second ? 1 : 0}}>
          <Translation text="Isming nima?" theme="cream" delay={at + 10} />
        </div>
      </div>
    </Scene>
  );
};

/** Обводка-круг вокруг «Вы» рисуется линией, затем галочка. */
const Circled: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [delay, delay + 16], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{position: 'relative', width: 420, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontSize: 200, fontWeight: 900, color: C.cream, lineHeight: 1}}>Вы</div>
      <svg width="420" height="300" viewBox="0 0 420 300" style={{position: 'absolute', inset: 0}}>
        <ellipse cx="210" cy="155" rx="195" ry="130" fill="none" stroke={C.terraLight} strokeWidth="10" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} transform="rotate(-6 210 155)" />
      </svg>
      <div style={{position: 'absolute', right: -20, top: -10}}>
        <Check delay={delay + 16} size={96} color={C.terraLight} mark={C.navy} />
      </div>
    </div>
  );
};

/** Плашка «Qiziq» влетает с наклоном. */
const Tilt: React.FC<{delay: number; children: React.ReactNode}> = ({delay, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 10, stiffness: 140, mass: 0.7}});
  return <div style={{transform: `translateX(${(1 - p) * -700}px) rotate(${-4 * p}deg)`}}>{children}</div>;
};

// Местоимение, «=», перевод, плашки — в такт анимации Equals
const EQUALS_SFX: SceneDef['sfx'] = [[2, 'pop'], [12, 'pop'], [20, 'pop'], [34, 'pop']];

const scenes: SceneDef[] = [
  {
    theme: 'cream',
    dur: 55,
    sfx: [[0, 'impact'], [20, 'pop']],
    el: (
      <Scene theme="cream" gap={40}>
        <Words text="Boshliqqa «ты» deysizmi?" role="hook" size={128} color={C.navy} accent={['«ты»']} />
        <Pop delay={20}>
          <div style={{fontFamily: FONT, fontSize: 200, fontWeight: 900, color: C.terra, lineHeight: 1}}>?</div>
        </Pop>
      </Scene>
    ),
  },
  {theme: 'cream', dur: 95, el: <Equals theme="cream" ru="Вы" uz="siz" who={['boshliq', 'shifokor', 'notanish odam']} />, sfx: EQUALS_SFX},
  {theme: 'navy', dur: 95, el: <Equals theme="navy" ru="Ты" uz="sen" who={['doʻst', 'oila', 'bola']} />, sfx: EQUALS_SFX},
  {
    theme: 'navy',
    dur: 90,
    sfx: [[4, 'swipe'], [34, 'pop']],
    el: (
      <Scene theme="navy" gap={50}>
        <Tilt delay={4}>
          <div style={{background: C.terra, color: C.cream, fontFamily: FONT, fontSize: 64, fontWeight: 900, padding: '16px 48px', borderRadius: 20}}>
            Qiziq
          </div>
        </Tilt>
        <div style={{...TYPE.body, fontSize: 76, color: C.cream, fontFamily: FONT}}>
          <Words text="ota-onaga ham odatda" role="body" size={76} color={C.cream} delay={16} />
          <div style={{marginTop: 24, color: C.navy, fontSize: 150, fontWeight: 900}}>
            <Marker delay={34} color={C.peach}>
              «ты»
            </Marker>
          </div>
        </div>
      </Scene>
    ),
  },
  {theme: 'cream', dur: 130, el: <Flip at={62} />, sfx: [[2, 'pop'], [62, 'swipe'], [72, 'pop']]},
  {
    theme: 'navy',
    dur: 105,
    sfx: [[24, 'swipe'], [40, 'ding']],
    el: (
      <Scene theme="navy" gap={50}>
        <Words text="Ikkilansangiz — «Вы» deng" role="body" size={80} color={C.cream} accent={['«Вы»']} accentColor={C.terraLight} />
        <Circled delay={24} />
        <Label text="Bu — hurmat" color={C.peach} delay={48} size={44} />
      </Scene>
    ),
  },
];

export const TYVY_SCENES = scenes;
export const TyVy: React.FC = () => <Reel scenes={scenes} />;

export const TyVyCover: React.FC = () => (
  <Cover>
    <div style={{fontSize: 220, lineHeight: 1}}>
      <span style={{color: C.terra}}>Ты</span> yoki <span style={{color: C.terra}}>Вы</span>?
    </div>
    <div style={{fontSize: 80, marginTop: 30}}>Boshliqqa «ты» deysizmi?</div>
  </Cover>
);
