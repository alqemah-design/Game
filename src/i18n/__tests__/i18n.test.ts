import { ar } from '../ar';
import { en } from '../en';
import { format, pluralCategory } from '../core';

const leaves = (o: unknown, prefix = ''): string[] =>
  Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    typeof v === 'string' ? [prefix + k] : v && typeof v === 'object' && 'other' in v ? [prefix + k] : leaves(v, `${prefix}${k}.`));

describe('dictionaries', () => {
  it('English has exactly the Arabic keys', () => {
    expect(leaves(en).sort()).toEqual(leaves(ar).sort());
  });
  it('placeholders match between languages', () => {
    const ph = (s: unknown) => JSON.stringify(s).match(/\{\w+\}/g)?.filter((x, i, a) => a.indexOf(x) === i).sort() ?? [];
    for (const key of leaves(ar)) {
      const get = (d: unknown) => key.split('.').reduce((n: any, p) => n[p], d);
      expect([key, ph(get(en))]).toEqual([key, ph(get(ar))]);
    }
  });
  it('no empty strings', () => {
    for (const d of [ar, en]) expect(JSON.stringify(d)).not.toMatch(/:""/);
  });
});

describe('format', () => {
  it('fills placeholders and falls back to Arabic, then to the key', () => {
    expect(format('en', en, ar, 'common.level', { level: 3 })).toBe('Level 3');
    expect(format('ar', ar, ar, 'common.level', { level: 3 })).toBe('المستوى 3');
    expect(format('en', {}, ar, 'common.back')).toBe('رجوع');
    expect(format('en', en, ar, 'no.such.key' as never)).toBe('no.such.key');
  });
  it('uses Arabic plural categories', () => {
    expect([0, 1, 2, 3, 10, 11, 99, 100, 102, 103].map((n) => pluralCategory('ar', n)))
      .toEqual(['zero', 'one', 'two', 'few', 'few', 'many', 'many', 'other', 'other', 'few']);
    expect(format('ar', ar, ar, 'success.points', { count: 5 })).toBe('+5 نقاط');
    expect(format('ar', ar, ar, 'success.points', { count: 12 })).toBe('+12 نقطة');
    expect(format('en', en, ar, 'success.points', { count: 1 })).toBe('+1 point');
    expect(format('en', en, ar, 'success.points', { count: 7 })).toBe('+7 points');
  });
});
