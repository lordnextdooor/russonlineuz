// Обложки Highlights для Instagram по брендбуку: кремовый фон, терракотовый линейный значок.
// Запуск: node scripts/highlights.mjs → ../marketing/design/highlights/*.png и preview.png
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const outDir = fileURLToPath(new URL('../marketing/design/highlights/', root));
mkdirSync(outDir, { recursive: true });

const C = { navy: '#1F2D4D', terra: '#C8553D', cream: '#FFF6EC', peach: '#F2B5A3' };

// Линейные значки 24×24 в стиле src/components/Icon.astro
const covers = [
  { file: '1-men-haqimda', label: 'Men haqimda', icon: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5a8 8 0 0 1 16 0"/>' },
  {
    file: '2-bepul-dars',
    label: 'Bepul dars',
    icon: '<rect x="3" y="8" width="18" height="4.5" rx="1"/><path d="M5 12.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7.5"/><path d="M12 8v13"/><path d="M12 8C10.5 4 6.5 4 7 6.5S12 8 12 8z"/><path d="M12 8c1.5-4 5.5-4 5-1.5S12 8 12 8z"/>',
  },
  { file: '3-narxlar', label: 'Narxlar', icon: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.6"/>' },
  { file: '4-natijalar', label: 'Natijalar', icon: '<path d="M3.5 20.5h17"/><path d="M5 16l5-5 3.5 3.5L20 8"/><path d="M15 8h5v5"/>' },
  {
    file: '5-fikrlar',
    label: 'Fikrlar',
    icon: '<path d="M20.5 14.5a2 2 0 0 1-2 2H8l-4.5 4v-15a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/><path d="M12 13l-2.5-2.4a1.5 1.5 0 1 1 2.5-1.7a1.5 1.5 0 1 1 2.5 1.7z"/>',
  },
  { file: '6-dars-jarayoni', label: 'Dars jarayoni', icon: '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5l6-3.5v10l-6-3.5"/>' },
  {
    file: '7-qabul',
    label: 'Qabul',
    icon: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18"/><path d="M8 2.5v4"/><path d="M16 2.5v4"/><path d="M8 14h3"/>',
  },
];

// Instagram вырезает из сторис 1080×1920 круг по центру — значок держим в центре
function coverSvg(icon) {
  const size = 500;
  const x = (1080 - size) / 2;
  const y = (1920 - size) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="${C.cream}"/>
  <circle cx="540" cy="960" r="400" fill="none" stroke="${C.peach}" stroke-width="10"/>
  <svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${C.terra}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
</svg>`;
}

for (const c of covers) {
  await sharp(Buffer.from(coverSvg(c.icon))).png({ compressionLevel: 9 }).toFile(`${outDir}${c.file}.png`);
  console.log('✓', `${c.file}.png`);
}

// Превью: как ряд выглядит в профиле (круги + подписи), светлая и тёмная тема Instagram
const font = (weight) => ({
  name: 'Montserrat',
  weight,
  style: 'normal',
  data: readFileSync(new URL(`node_modules/@fontsource/montserrat/files/montserrat-latin-${weight}-normal.woff`, root)),
});
const h = (type, style, ...children) => ({ type, props: { style, children: children.flat() } });

const circles = await Promise.all(
  covers.map(async (c) => {
    const png = await sharp(Buffer.from(coverSvg(c.icon)))
      .extract({ left: 0, top: 420, width: 1080, height: 1080 })
      .resize(150)
      .png()
      .toBuffer();
    return { ...c, src: `data:image/png;base64,${png.toString('base64')}` };
  }),
);

const row = (bg, text) =>
  h(
    'div',
    { display: 'flex', gap: 28, padding: '36px 40px', background: bg, fontFamily: 'Montserrat' },
    circles.map((c) =>
      h(
        'div',
        { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 160 },
        h(
          'div',
          { display: 'flex', width: 160, height: 160, borderRadius: 999, border: '3px solid #C7C7C7', alignItems: 'center', justifyContent: 'center' },
          { type: 'img', props: { src: c.src, width: 146, height: 146, style: { borderRadius: 999 } } },
        ),
        h('div', { marginTop: 12, fontSize: 20, fontWeight: 600, color: text }, c.label),
      ),
    ),
  );

const width = 40 * 2 + 160 * covers.length + 28 * (covers.length - 1);
const svg = await satori(h('div', { display: 'flex', flexDirection: 'column', width }, row('#FFFFFF', '#262626'), row('#000000', '#F5F5F5')), {
  width,
  height: 2 * (36 * 2 + 160 + 12 + 26),
  fonts: [font(600)],
});
await sharp(Buffer.from(svg)).png().toFile(`${outDir}preview.png`);
console.log('✓ preview.png');
