import { describe, expect, test } from 'bun:test';

import { useI18nStore } from '@/lib/i18n';

import './easterEggCopy';

describe('easter egg copy loading', () => {
  test('a locale without a copy file does not throw when it becomes active', () => {
    // The ru fork ships no easter-egg copy. Switching to it used to call
    // LOADERS['ru'] inside the i18n subscription and abort app startup with
    // "LOADERS[locale] is not a function", leaving the splash screen forever.
    expect(() => useI18nStore.getState().setLocale('ru')).not.toThrow();
  });
});
