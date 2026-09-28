export type NotificationKind = 'approved' | 'download' | 'receipt' | 'follow' | 'ai';

export type Notification = {
  id: string;
  kind: NotificationKind;
  /** النصّ كاملاً؛ `strong` جزء منه يُبرَز (اسم الخط أو الشخص) — نصّ عادي لا HTML */
  text: string;
  strong?: string;
  /** ISO 8601 */
  at: string;
  unread: boolean;
};
