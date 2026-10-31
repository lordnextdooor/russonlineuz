// Генерирует картинки для превью ссылок (Open Graph) и квадратный логотип.
// Запуск: npm run og → public/og-uz.png, public/og-ru.png, public/logo-512.png
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const out = (name) => fileURLToPath(new URL(`public/${name}`, root));

const C = { navy: '#1F2D4D', terra: '#C8553D', cream: '#FFF6EC', terraLight: '#E07A5F', terraDark: '#A8432F', white: '#FFFFFF' };

// Satori не ищет недостающие буквы в файле с тем же именем — кириллице нужно своё имя
const font = (subset, weight) => ({
  name: subset === 'cyrillic' ? 'MontserratCyr' : 'Montserrat',
  weight,
  style: 'normal',
  data: readFileSync(new URL(`node_modules/@fontsource/montserrat/files/montserrat-${subset}-${weight}-normal.woff`, root)),
});
const fonts = [600, 800, 900].flatMap((w) => [font('latin', w), font('cyrillic', w)]);
const FAMILY = 'Montserrat, MontserratCyr';

// Satori принимает дерево объектов, как JSX без React
const h = (type, style, ...children) => ({ type, props: { style, children: children.flat() } });

// Облачка знака — те же контуры, что в src/components/Mark.astro (viewBox 0 0 100 62)
const LEFT = 'M8.5 1.75H52.5A5 5 0 0 1 57.5 6.75V36.75A5 5 0 0 1 52.5 41.75H25L12 52.5L14 41.75H8.5A5 5 0 0 1 3.5 36.75V6.75A5 5 0 0 1 8.5 1.75Z';
const RIGHT = 'M49 16.5H90A5 5 0 0 1 95 21.5V49A5 5 0 0 1 90 54H82.5L84 60.5L73 54H49A5 5 0 0 1 44 49V21.5A5 5 0 0 1 49 16.5Z';

async function bubblePng(d, w, fill, outline) {
  const stroke = outline ? `stroke="${outline}" stroke-width="3" stroke-linejoin="round" paint-order="stroke"` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w * 0.62}" viewBox="0 0 100 62"><path d="${d}" fill="${fill}" ${stroke}/></svg>`;
  const png = await sharp(Buffer.from(svg), { density: 300 }).resize(Math.round(w)).png().toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

/** Знак «Aa / Яя»: облачка картинками, буквы — текстом Montserrat поверх. */
async function mark(w, outline = C.cream) {
  const u = w / 100;
  const abs = (left, top) => ({ position: 'absolute', left: left * u, top: top * u });
  const letters = (color) => ({ fontFamily: FAMILY, fontSize: 18 * u, fontWeight: 800, color, lineHeight: 1 });
  return h(
    'div',
    { display: 'flex', position: 'relative', width: w, height: w * 0.62 },
    { type: 'img', props: { src: await bubblePng(LEFT, w, C.navy), width: w, height: w * 0.62, style: abs(0, 0) } },
    h('div', { ...abs(16.5, 13.6), ...letters(C.white) }, 'Aa'),
    { type: 'img', props: { src: await bubblePng(RIGHT, w, C.terra, outline), width: w, height: w * 0.62, style: abs(0, 0) } },
    h('div', { ...abs(57, 26.9), ...letters(C.white) }, 'Яя'),
  );
}

const words = (text, style) => text.split(' ').map((word) => h('span', style, word));

async function ogImage({ before, accent, after, subtitle, pill }) {
  const title = { fontSize: 66, fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5 };
  // В satori padding прибавляется к размеру блока, поэтому поля задаём размерами внутреннего блока
  return h(
    'div',
    { display: 'flex', width: 1200, height: 630, background: C.cream, alignItems: 'center', justifyContent: 'center', fontFamily: FAMILY, color: C.navy },
    h(
      'div',
      { display: 'flex', width: 1056, height: 486 },
    h(
      'div',
      { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 760, height: 486 },
      h(
        'div',
        { display: 'flex', alignItems: 'center', gap: 14 },
        await mark(70),
        h(
          'div',
          { display: 'flex', flexDirection: 'column' },
          h('div', { display: 'flex', fontSize: 30, fontWeight: 800 }, 'RUSSONLINE', h('span', { color: C.terra }, 'UZ')),
          h('div', { fontSize: 14, fontWeight: 600, letterSpacing: 4, color: C.terraDark, marginTop: 4 }, 'RUS TILI ONLINE'),
        ),
      ),
      h(
        'div',
        { display: 'flex', flexWrap: 'wrap', columnGap: 18, ...title },
        words(before, {}),
        words(accent, { color: C.terra }),
        words(after, {}),
      ),
      h(
        'div',
        { display: 'flex', alignItems: 'center', gap: 24 },
        h('div', { background: C.navy, color: C.cream, fontSize: 28, fontWeight: 800, padding: '14px 28px', borderRadius: 999, whiteSpace: 'nowrap' }, pill),
        h('div', { fontSize: 22, fontWeight: 600, color: C.terraDark, whiteSpace: 'nowrap' }, subtitle),
      ),
    ),
    h('div', { display: 'flex', width: 296, height: 486, alignItems: 'center', justifyContent: 'flex-end' }, await mark(280)),
    ),
  );
}

async function avatar() {
  // Аватар по брендбуку: знак в кремовом круге на терракотовом фоне
  return h(
    'div',
    { display: 'flex', width: 512, height: 512, background: C.terra, alignItems: 'center', justifyContent: 'center', fontFamily: FAMILY },
    h(
      'div',
      { display: 'flex', width: 440, height: 440, borderRadius: 999, background: C.cream, alignItems: 'center', justifyContent: 'center' },
      await mark(300),
    ),
  );
}

async function render(tree, width, height, file) {
  const svg = await satori(tree, { width, height, fonts });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out(file));
  console.log('✓', file);
}

await render(
  await ogImage({
    before: 'Rus tilida',
    accent: 'erkin',
    after: 'gapiring — noldan boshlab',
    subtitle: 'Zoom orqali jonli darslar',
    pill: '1-dars bepul',
  }),
  1200,
  630,
  'og-uz.png',
);
await render(
  await ogImage({
    before: 'Говорите по-⁠русски',
    accent: 'свободно',
    after: '— с нуля',
    subtitle: 'Живые уроки в Zoom',
    pill: 'Первый урок бесплатно',
  }),
  1200,
  630,
  'og-ru.png',
);
await render(await avatar(), 512, 512, 'logo-512.png');
