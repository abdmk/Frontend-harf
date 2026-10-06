import type { Notification } from '@/types/domain/notification';

export type NotificationGroup = 'today' | 'week' | 'earlier';
export type NotificationView = Notification & { when: string; group: NotificationGroup };

const GROUP_LABEL: Record<NotificationGroup, string> = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  earlier: 'أقدم',
};

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

/** «منذ» بالعربية بأرقام لاتينية كبقيّة الموقع — تُحسب على الخادم فلا يختلف الترطيب */
export function relativeAr(at: string, now: number): string {
  const diff = Math.max(0, now - Date.parse(at));
  const minutes = Math.floor(diff / MIN);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return minutes === 1 ? 'قبل دقيقة' : minutes === 2 ? 'قبل دقيقتين' : `قبل ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'قبل ساعة' : hours === 2 ? 'قبل ساعتين' : `قبل ${hours} ساعات`;
  const days = Math.floor(diff / DAY);
  if (days === 1) return 'أمس';
  if (days === 2) return 'قبل يومين';
  if (days <= 10) return `قبل ${days} أيام`;
  return `قبل ${days} يوماً`;
}

/** اليوم = آخر 24 ساعة، هذا الأسبوع = آخر 7 أيام — مرتّبة من الأحدث */
export function toViews(items: Notification[], now: number): NotificationView[] {
  return [...items]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .map((n) => {
      const age = now - Date.parse(n.at);
      const group: NotificationGroup = age < DAY ? 'today' : age < 7 * DAY ? 'week' : 'earlier';
      return { ...n, when: relativeAr(n.at, now), group };
    });
}

export function groupViews(items: NotificationView[]) {
  return (Object.keys(GROUP_LABEL) as NotificationGroup[])
    .map((key) => ({ key, label: GROUP_LABEL[key], items: items.filter((n) => n.group === key) }))
    .filter((g) => g.items.length > 0);
}
