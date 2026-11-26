import { useCallback, useMemo } from 'react';
import { getLocales } from 'expo-localization';
import { useProgress } from '@/data/progressStore';
import { ar, type Dict } from './ar';
import { en } from './en';
import { format, RTL_LANGS, type Lang, type Params, type Path } from './core';

export type { Lang } from './core';
export type TKey = Path<Dict>;
export type LanguagePref = Lang | 'system';

const DICTS: Record<Lang, unknown> = { ar, en };

/** 'system' follows the device when it is a supported language; otherwise Arabic (the app's home language). */
export function resolveLang(pref: LanguagePref | undefined): Lang {
  if (pref === 'ar' || pref === 'en') return pref;
  if (pref === 'system') {
    const code = getLocales()[0]?.languageCode;
    if (code === 'en') return 'en';
  }
  return 'ar';
}

export const translate = (lang: Lang, key: TKey, params?: Params) => format(lang, DICTS[lang], ar, key, params);

/** Pick the right name from bilingual content data ({ ar, en }). */
export const localName = (item: { ar: string; en?: string }, lang: Lang) => (lang === 'en' && item.en ? item.en : item.ar);

/** Current UI language outside React (e.g. for speech). */
export const currentLang = () => resolveLang(useProgress.getState().language);

export function useI18n() {
  const pref = useProgress((s) => s.language);
  const lang = resolveLang(pref);
  const t = useCallback((key: TKey, params?: Params) => translate(lang, key, params), [lang]);
  return useMemo(() => {
    const isRTL = RTL_LANGS.includes(lang);
    return {
      t,
      lang,
      isRTL,
      dir: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
      /** Arrow pointing "back" in the reading direction. */
      backArrow: isRTL ? '→' : '←',
      name: (item: { ar: string; en?: string }) => localName(item, lang),
    };
  }, [t, lang]);
}
