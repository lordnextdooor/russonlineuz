import type { APIRoute } from 'astro';

// Страницы для поисковиков: пары uz/ru. «Спасибо» и 404 сюда не входят (noindex)
const pages = [
  { uz: '/', ru: '/ru/' },
  { uz: '/privacy/', ru: '/ru/privacy/' },
];

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(path, site).href;
  const urls = pages.flatMap((pair) =>
    Object.values(pair).map(
      (path) => `  <url>
    <loc>${abs(path)}</loc>
    <xhtml:link rel="alternate" hreflang="uz" href="${abs(pair.uz)}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${abs(pair.ru)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pair.uz)}"/>
  </url>`,
    ),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
