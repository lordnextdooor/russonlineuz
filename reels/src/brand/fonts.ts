// Montserrat из @fontsource (latin, latin-ext, cyrillic). Рендер ждёт, пока шрифты загрузятся.
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {continueRender, delayRender} from 'remotion';

const handle = delayRender('Montserrat');
Promise.all(
  [500, 600, 800, 900].map((w) => document.fonts.load(`${w} 40px Montserrat`, 'Aa Яя oʻ gʻ')),
).then(() => continueRender(handle));
