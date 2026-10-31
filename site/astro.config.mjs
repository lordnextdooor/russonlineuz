// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// Адрес сайта (canonical, hreflang, sitemap, картинки превью):
// 1) SITE_URL — если задан вручную;
// 2) на Vercel — основной адрес проекта: свой домен, когда он подключён, иначе *.vercel.app
//    (после подключения домена достаточно сделать Redeploy);
// 3) локально — localhost.
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site: siteUrl,
  // Страницы статические; на сервере работает только /api/lead (prerender = false)
  adapter: vercel(),
  // CSS небольшой (~25 КБ) — встраиваем в HTML, чтобы не блокировать первую отрисовку
  build: { inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'uz',
    locales: ['uz', 'ru'],
    routing: { prefixDefaultLocale: false },
  },
  env: {
    schema: {
      // Задаются в панели Vercel (Settings → Environment Variables) или в локальном .env
      TELEGRAM_BOT_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      TELEGRAM_CHAT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      // ID счётчиков — публичные (видны в коде страницы), подставляются при сборке
      PUBLIC_YM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_META_PIXEL_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
});
