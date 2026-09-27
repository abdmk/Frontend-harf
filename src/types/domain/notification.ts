export type Notification = {
  id: string;
  kind: 'ok' | 'download' | 'receipt';
  text: string;
  when: string;
  unread: boolean;
};
