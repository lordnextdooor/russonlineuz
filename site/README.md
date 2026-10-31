# Сайт RUSSONLINEUZ

Лендинг онлайн-школы русского языка: узбекский (`/`) и русский (`/ru/`).
Astro 7, обычный CSS, хостинг Vercel. ТЗ — `../SITE_SPEC.md`, брендбук — `../docs/brandbook.md`,
выкладка — `../docs/deploy.md`.

## Команды

```bash
npm install      # один раз после скачивания
npm run dev      # локально: http://localhost:4321
npm run build    # сборка для продакшна (проверить, что всё собирается)
npm run og       # перерисовать картинки превью public/og-*.png и logo-512.png
```

Для отправки заявок локально скопируйте `.env.example` в `.env` и впишите токен бота и ID чата.
Без них в режиме разработки заявка просто печатается в лог.

## Где что менять

| Что | Где |
|---|---|
| Тексты сайта | `src/i18n/uz.json`, `src/i18n/ru.json` (ключи должны совпадать) |
| Цены и расписание | `src/data/tariffs.json` |
| Instagram / Telegram / телефон | `src/data/site.json` |
| Блоки лендинга | `src/components/*.astro`, порядок — `src/components/Landing.astro` |
| Цвета и шрифты | `src/styles/global.css` (по брендбуку) |
| Приём заявок → Telegram | `src/pages/api/lead.ts`, `src/lib/lead.ts` |
| Счётчики аналитики | `src/components/Analytics.astro` (ID — в переменных окружения) |

## Переменные окружения

| Имя | Зачем |
|---|---|
| `TELEGRAM_BOT_TOKEN` | токен бота (секрет, только в `.env` и Vercel) |
| `TELEGRAM_CHAT_ID` | чат, куда приходят заявки |
| `PUBLIC_YM_ID`, `PUBLIC_GA4_ID`, `PUBLIC_META_PIXEL_ID` | счётчики; пусто — не подключаются |

## Защита формы от спама

Скрытое поле-ловушка, отсев отправок быстрее 2,5 секунды после открытия страницы,
не больше 3 заявок за 10 минут с одного адреса (в памяти функции — мягкое ограничение).
