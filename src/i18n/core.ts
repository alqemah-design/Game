/**
 * Minimal, dependency-free i18n.
 * - Dictionaries are plain nested objects; Arabic (ar.ts) is the source of truth and every other
 *   language must have exactly the same keys (enforced by the `Dict` type at compile time).
 * - `{name}` placeholders are filled from params.
 * - Plurals use CLDR categories; Arabic needs zero/one/two/few/many/other.
 */
export type Lang = 'ar' | 'en';
export const LANGS: readonly Lang[] = ['ar', 'en'];
export const RTL_LANGS: readonly Lang[] = ['ar'];

export type PluralForms = { other: string; zero?: string; one?: string; two?: string; few?: string; many?: string };
type Leaf = string | PluralForms;

/** Same shape as the Arabic dictionary, with every leaf widened to string / plural forms. */
export type Shape<T> = { [K in keyof T]: T[K] extends string ? string : T[K] extends PluralForms ? PluralForms : Shape<T[K]> };

/** "a.b.c" paths to every leaf of a dictionary. */
export type Path<T> = {
  [K in keyof T & string]: T[K] extends string | PluralForms ? K : `${K}.${Path<T[K]>}`;
}[keyof T & string];

export type Params = Record<string, string | number>;

/** CLDR plural category for a count. */
export function pluralCategory(lang: Lang, n: number): keyof PluralForms {
  if (lang === 'ar') {
    const m = Math.abs(n) % 100;
    if (n === 0) return 'zero';
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    if (m >= 3 && m <= 10) return 'few';
    if (m >= 11 && m <= 99) return 'many';
    return 'other';
  }
  return n === 1 ? 'one' : 'other';
}

const isPlural = (v: unknown): v is PluralForms => typeof v === 'object' && v !== null && 'other' in v;

function lookup(dict: unknown, key: string): Leaf | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' || isPlural(node) ? node : undefined;
}

/**
 * Translate `key` in `dict`. Missing keys fall back to `fallback` (Arabic), then to the key itself,
 * so a gap never crashes the app or shows an empty button.
 */
export function format(lang: Lang, dict: unknown, fallback: unknown, key: string, params?: Params): string {
  const leaf = lookup(dict, key) ?? lookup(fallback, key);
  if (leaf === undefined) return key;
  let text: string;
  if (isPlural(leaf)) {
    const n = Number(params?.count ?? 0);
    text = leaf[pluralCategory(lang, n)] ?? leaf.other;
  } else text = leaf;
  return params ? text.replace(/\{(\w+)\}/g, (m, p) => (p in params ? String(params[p]) : m)) : text;
}
