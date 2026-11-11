import { create } from 'zustand';

import { useI18n, useI18nStore, type Locale } from '@/lib/i18n';

import { copy as enCopy } from './copy/en';
import type { EasterEggCopy } from './copy/types';

// Locales without a copy file (the ru fork ships none) fall back to the
// callers' ordinary translated text instead of loading a joke file.
const LOADERS = {
  de: () => import('./copy/de'),
  fr: () => import('./copy/fr'),
  nl: () => import('./copy/nl'),
  'zh-CN': () => import('./copy/zh-CN'),
  'zh-TW': () => import('./copy/zh-TW'),
  uk: () => import('./copy/uk'),
  es: () => import('./copy/es'),
  'pt-BR': () => import('./copy/pt-BR'),
  ko: () => import('./copy/ko'),
  pl: () => import('./copy/pl'),
  ja: () => import('./copy/ja'),
  tr: () => import('./copy/tr'),
  ar: () => import('./copy/ar'),
  he: () => import('./copy/he'),
};

type CopyLocale = keyof typeof LOADERS;

const hasCopy = (locale: Locale): locale is CopyLocale => locale in LOADERS;

const useCopyStore = create<{ byLocale: Partial<Record<Locale, EasterEggCopy>> }>(() => ({ byLocale: { en: enCopy } }));

const requested = new Set<Locale>(['en']);

const request = (locale: Locale) => {
  if (locale === 'en' || requested.has(locale)) return;
  if (!hasCopy(locale)) return;
  requested.add(locale);
  LOADERS[locale]()
    .then(({ copy }) => useCopyStore.setState((state) => ({ byLocale: { ...state.byLocale, [locale]: copy } })))
    .catch(() => requested.delete(locale));
};

// Load alongside the locale's dictionary, so the first draft heading already
// has its lines instead of switching text a moment after it appears.
request(useI18nStore.getState().locale);
useI18nStore.subscribe((state) => request(state.locale));

/**
 * The easter-egg lines for the current locale, or null while they load. Every
 * caller falls back to its ordinary translated text on null, so a user never
 * sees another language's joke.
 */
export function useEasterEggCopy(): EasterEggCopy | null {
  const { locale } = useI18n();
  return useCopyStore((state) => state.byLocale[locale] ?? null);
}
