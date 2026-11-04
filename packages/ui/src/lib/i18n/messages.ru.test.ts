import { describe, expect, test } from 'bun:test';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { dict as enDict } from './messages/en';
import { dict as ruDict } from './messages/ru';

// The ru dictionary gets feature-module strings by spreading each module's
// `ru` block. A rebuild that emits `.en` spreads silently fills the Russian
// dictionary with English module values — parity tests cannot see it because
// the keys match. This test checks the values actually come from the ru blocks.
describe('ru module spreads', () => {
  test('every ru module value reaches the ru dictionary', async () => {
    const dir = join(import.meta.dirname, 'messages');
    const files = readdirSync(dir).filter((f) => f.endsWith('.i18n.ts') && !f.endsWith('.test.ts'));
    const misrouted: string[] = [];
    for (const f of files) {
      const mod = (await import(join(dir, f))) as Record<string, unknown>;
      for (const block of Object.values(mod)) {
        if (!block || typeof block !== 'object') continue;
        const locales = block as Record<string, Record<string, string> | undefined>;
        if (!locales.ru || !locales.en) continue;
        for (const [key, value] of Object.entries(locales.ru)) {
          if (ruDict[key] === value) continue;
          // A ru value genuinely identical to English (tokens, brands) looks
          // the same through any spread; not what this test guards.
          if (enDict[key] === value) continue;
          misrouted.push(`${f}:${key}`);
        }
      }
    }
    expect(misrouted.slice(0, 10)).toEqual([]);
  });
});
