import tariffs from '../data/tariffs.json';
import { formatSum } from '../i18n';

export interface Lead {
  name: string;
  phone: string;
  telegram: string | null;
  format: 'individual' | 'group' | 'unknown';
  time: 'day' | 'evening';
  tariff: string | null;
  lang: 'uz' | 'ru';
}

export type ParseResult =
  | { ok: true; lead: Lead }
  | { ok: false; spam: true }
  | { ok: false; spam: false; fields: Array<'name' | 'phone'> };

const FORMATS = ['individual', 'group', 'unknown'] as const;
const TIMES = ['day', 'evening'] as const;
const allTariffs = [...tariffs.individual, ...tariffs.group];

/** Людям нужно больше пары секунд, чтобы заполнить форму; ботам — нет. */
const MIN_FILL_MS = 2500;

const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

export function parseLead(data: FormData, now = Date.now()): ParseResult {
  const get = (key: string) => String(data.get(key) ?? '').trim();

  // Ловушка: скрытое поле заполняют только боты
  if (get('website')) return { ok: false, spam: true };
  const ts = Number(get('ts'));
  if (ts && now - ts < MIN_FILL_MS) return { ok: false, spam: true };

  const name = get('name').replace(/\s+/g, ' ').slice(0, 80);
  const digits = get('phone').replace(/\D/g, '');
  const local = digits.startsWith('998') ? digits.slice(3) : digits;

  const fields: Array<'name' | 'phone'> = [];
  if (!name) fields.push('name');
  if (local.length !== 9) fields.push('phone');
  if (fields.length) return { ok: false, spam: false, fields };

  const tg = get('telegram').replace(/^@/, '');
  const tariffId = get('tariff');

  return {
    ok: true,
    lead: {
      name,
      phone: `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`,
      telegram: /^[A-Za-z0-9_]{4,32}$/.test(tg) ? tg : null,
      format: pick(get('format'), FORMATS, 'unknown'),
      time: pick(get('time'), TIMES, 'evening'),
      tariff: allTariffs.some((t) => t.id === tariffId) ? tariffId : null,
      lang: get('lang') === 'ru' ? 'ru' : 'uz',
    },
  };
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Сообщение учителю — на русском, коротко и по делу. */
export function formatLeadMessage(lead: Lead): string {
  const formats = { individual: 'Индивидуально', group: 'Мини-группа', unknown: 'Пока не знает' };
  const times = { day: 'Днём (12:00)', evening: 'Вечером' };

  const lines = [
    '<b>🆕 Новая заявка на бесплатный урок</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${lead.phone}`,
    `<b>Telegram:</b> ${lead.telegram ? `@${lead.telegram}` : '—'}`,
    `<b>Формат:</b> ${formats[lead.format]}`,
  ];

  const tariff = allTariffs.find((t) => t.id === lead.tariff);
  if (tariff) {
    const kind = tariffs.individual.includes(tariff) ? 'Индивидуально' : 'Мини-группа';
    lines.push(`<b>Тариф:</b> ${kind}, ${tariff.perWeek}×/нед — ${formatSum(tariff.priceMonth)} сум/мес`);
  }

  lines.push(`<b>Удобное время:</b> ${times[lead.time]}`, `<b>Язык сайта:</b> ${lead.lang.toUpperCase()}`);
  return lines.join('\n');
}

export async function sendToTelegram(token: string, chatId: string, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    // Тело ответа Telegram не содержит токен — его безопасно логировать
    throw new Error(`Telegram API ${res.status}: ${await res.text()}`);
  }
}

/**
 * Ограничение частоты: не больше 3 заявок за 10 минут с одного адреса.
 * Память живёт внутри одного экземпляра функции — это защита от наивного спама,
 * а не строгий лимит (вместе с ловушкой и проверкой времени этого достаточно для старта).
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  const limited = recent.length >= MAX_PER_WINDOW;
  if (!limited) recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return limited;
}
