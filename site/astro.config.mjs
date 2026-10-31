// @ts-check
import { defineConfig, envField } from 'astro/config';
import netlify from '@astrojs/netlify';

// Адрес сайта (canonical, hreflang, sitemap, картинки превью):
// 1) SITE_URL — если задан вручную;
// 2) на Netlify — переменная URL: свой домен, когда он подключён, иначе *.netlify.app
//    (после подключения домена достаточно пересобрать сайт);
// 3) локально — localhost.
const siteUrl =
  process.env.SITE_URL ?? (process.env.NETLIFY === 'true' && process.env.URL ? process.env.URL : 'http://localhost:4321');

export default defineConfig({
  site: siteUrl,
  // Страницы статические; на сервере работает только /api/lead (prerender = false)
  // Эмуляция Netlify в `astro dev` не нужна (edge-функции требуют Deno); переменные — из .env
  adapter: netlify({ devFeatures: false }),
  // CSS небольшой (~25 КБ) — встраиваем в HTML, чтобы не блокировать первую отрисовку
  build: { inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'uz',
    locales: ['uz', 'ru'],
    routing: { prefixDefaultLocale: false },
  },
  env: {
    schema: {
      // Задаются в панели Netlify (Site configuration → Environment variables) или в локальном .env
      TELEGRAM_BOT_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      TELEGRAM_CHAT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      // ID счётчиков — публичные (видны в коде страницы), подставляются при сборке
      PUBLIC_YM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_META_PIXEL_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
