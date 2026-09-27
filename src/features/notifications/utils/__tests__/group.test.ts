import { describe, expect, it } from 'vitest';

import type { Notification } from '@/types/domain/notification';

import { groupViews, relativeAr, toViews } from '../group';

const NOW = Date.parse('2026-09-27T12:00:00Z');
const ago = (min: number) => new Date(NOW - min * 60_000).toISOString();
const n = (id: string, min: number): Notification => ({ id, kind: 'download', text: id, at: ago(min), unread: false });

describe('relativeAr', () => {
  it.each([
    [0, 'الآن'],
    [1, 'قبل دقيقة'],
    [2, 'قبل دقيقتين'],
    [20, 'قبل 20 دقيقة'],
    [120, 'قبل ساعتين'],
    [5 * 60, 'قبل 5 ساعات'],
    [26 * 60, 'أمس'],
    [2 * 1440, 'قبل يومين'],
    [3 * 1440, 'قبل 3 أيام'],
    [12 * 1440, 'قبل 12 يوماً'],
  ])('%i دقيقة ← %s', (min, label) => expect(relativeAr(ago(min), NOW)).toBe(label));

  it('لا يعرض وقتاً في المستقبل', () => expect(relativeAr(ago(-5), NOW)).toBe('الآن'));
});

describe('toViews + groupViews', () => {
  it('يرتّب من الأحدث ويجمّع ويُسقط المجموعات الفارغة', () => {
    const groups = groupViews(toViews([n('old', 10 * 1440), n('now', 5), n('week', 2 * 1440)], NOW));
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ['اليوم', ['now']],
      ['هذا الأسبوع', ['week']],
      ['أقدم', ['old']],
    ]);
    expect(groupViews(toViews([n('a', 1)], NOW)).map((g) => g.key)).toEqual(['today']);
  });
});
