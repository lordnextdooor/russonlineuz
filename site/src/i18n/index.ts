import uz from './uz.json';
import ru from './ru.json';

export const locales = ['uz', 'ru'] as const;
export type Locale = (typeof locales)[number];
export type Dict = typeof uz;

// Словари обязаны совпадать по ключам: ru.json проверяется по типу uz.json
const dicts: Record<Locale, Dict> = { uz, ru };

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}

/** Подставляет значения в шаблон вида «{n} dars / oy». */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

/** 1350000 → «1 350 000» (неразрывные пробелы, как принято в сумах). */
export function formatSum(value: number): string {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function homePath(locale: Locale): string {
  return locale === 'uz' ? '/' : `/${locale}/`;
}
