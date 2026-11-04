// Композиции серии моушн-Reels: ролик 1080×1920 и обложка к каждому
import React from 'react';
import {Composition, Still} from 'remotion';
import './brand/fonts';
import {reelDuration} from './brand/components';
import {FPS, H, W} from './brand/tokens';
import {CharactersSheet} from './reels/CharactersSheet';
import {DOKONDA_SCENES, Dokonda, DokondaCover} from './reels/Dokonda';
import {METRO_SCENES, Metro, MetroCover} from './reels/Metro';
import {OPOZDAL_SCENES, Opozdal, OpozdalCover} from './reels/Opozdal';
import {PAKET_SCENES, Paket, PaketCover} from './reels/Paket';
import {TYVY_SCENES, TyVy, TyVyCover} from './reels/TyVy';
import {ZABOLELA_SCENES, Zabolela, ZabolelaCover} from './reels/Zabolela';

export const Root: React.FC = () => (
  <>
    <Composition id="zabolela" component={Zabolela} durationInFrames={reelDuration(ZABOLELA_SCENES)} fps={FPS} width={W} height={H} />
    <Still id="zabolela-cover" component={ZabolelaCover} width={W} height={H} />
    <Composition id="dokonda" component={Dokonda} durationInFrames={reelDuration(DOKONDA_SCENES)} fps={FPS} width={W} height={H} />
    <Still id="dokonda-cover" component={DokondaCover} width={W} height={H} />
    <Composition id="ty-vy" component={TyVy} durationInFrames={reelDuration(TYVY_SCENES)} fps={FPS} width={W} height={H} />
    <Still id="ty-vy-cover" component={TyVyCover} width={W} height={H} />
    {/* Серия «Jasur va Ustoz» */}
    <Composition id="paket" component={Paket} durationInFrames={reelDuration(PAKET_SCENES)} fps={FPS} width={W} height={H} />
    <Still id="paket-cover" component={PaketCover} width={W} height={H} />
    <Composition id="opozdal" component={Opozdal} durationInFrames={reelDuration(OPOZDAL_SCENES)} fps={FPS} width={W} height={H} />
    <Still id="opozdal-cover" component={OpozdalCover} width={W} height={H} />
    <Composition id="metro" component={Metro} durationInFrames={reelDuration(METRO_SCENES)} fps={FPS} width={W} height={H} />
    <Still id="metro-cover" component={MetroCover} width={W} height={H} />
    <Still id="characters-sheet" component={CharactersSheet} width={W} height={H} />
  </>
);
