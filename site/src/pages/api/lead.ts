import type { APIRoute } from 'astro';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from 'astro:env/server';
import { formatLeadMessage, isRateLimited, parseLead, sendToTelegram } from '../../lib/lead';

export const prerender = false;

const thanksPath = (lang: string) => (lang === 'ru' ? '/ru/spasibo/' : '/rahmat/');

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  // Форма работает и без JS: тогда отвечаем редиректом, с JS — JSON
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const reply = (status: number, body: Record<string, unknown>, lang = 'uz') =>
    wantsJson
      ? Response.json(body, { status })
      : body.ok
        ? redirect(thanksPath(lang), 303)
        : redirect(`${lang === 'ru' ? '/ru/' : '/'}?error=${body.error}#ariza`, 303);

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return reply(400, { ok: false, error: 'bad_request' });
  }

  const lang = data.get('lang') === 'ru' ? 'ru' : 'uz';
  const parsed = parseLead(data);

  // Ботам отвечаем «успехом», чтобы они не подбирали обход
  if (!parsed.ok && parsed.spam) return reply(200, { ok: true }, lang);
  if (!parsed.ok) return reply(422, { ok: false, error: 'invalid', fields: parsed.fields }, lang);

  let ip = 'unknown';
  try {
    ip = clientAddress;
  } catch {
    // адрес клиента недоступен в некоторых окружениях
  }
  if (isRateLimited(ip)) return reply(429, { ok: false, error: 'rate_limited' }, lang);

  const text = formatLeadMessage(parsed.lead);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    if (import.meta.env.DEV) {
      console.log('[lead] Telegram не настроен, заявка только в логе:\n' + text);
      return reply(200, { ok: true }, lang);
    }
    console.error('[lead] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы');
    return reply(500, { ok: false, error: 'send_failed' }, lang);
  }

  try {
    await sendToTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, text);
  } catch (err) {
    console.error('[lead] не удалось отправить в Telegram', err);
    return reply(502, { ok: false, error: 'send_failed' }, lang);
  }

  return reply(200, { ok: true }, lang);
};
