import { useMemo, useState } from 'react';

import { Avatar } from '@/components/shared/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { SearchField } from '@/components/shared/search-field';
import { Badge } from '@/components/ui/badge';
import { SearchIcon } from '@/components/ui/icons';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AdminAnalytics } from '@/types/domain/analytics';

const PLAN = { free: ['neutral', 'مجاني'], basic: ['warning', 'الأساسية'], studio: ['info', 'استوديو'] } as const;

/** سجلّ الحسابات: بحث بالاسم أو البريد + فلتر «المدفوع فقط» — حالة فارغة تقول ما العمل */
export function UsersRegistry({ users }: { users: AdminAnalytics['users'] }) {
  const [q, setQ] = useState('');
  const [paid, setPaid] = useState(false);
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter(
      (u) => (!paid || u.plan !== 'free') && (!t || u.name.toLowerCase().includes(t) || u.email.includes(t)),
    );
  }, [users, q, paid]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchField
          label="ابحث في الحسابات"
          placeholder="ابحث باسم أو بريد…"
          value={q}
          onChange={setQ}
          className="min-w-60 flex-1"
        />
        <label className="flex items-center gap-2 text-meta">
          <Switch checked={paid} onCheckedChange={setPaid} />
          المدفوع فقط
        </label>
      </div>
      {rows.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead>الخطة</TableHead>
              <TableHead>التسجيل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => {
              const [tone, label] = PLAN[u.plan];
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <Avatar initials={u.name.slice(0, 2).toUpperCase()} seed={u.id} size="sm" />
                      {u.name}
                    </span>
                  </TableCell>
                  <TableCell dir="ltr" className="text-right text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge tone={tone}>{label}</Badge>
                  </TableCell>
                  <TableCell dir="ltr" className="text-right text-muted-foreground">
                    {u.joined.replaceAll('-', '/')}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<SearchIcon />}
          title="لا نتائج مطابقة"
          description="جرّب اسماً أو بريداً آخر، أو ألغِ فلتر المدفوع."
          headingLevel="h3"
        />
      )}
      <p className="text-caption text-tertiary">
        {rows.length} من {users.length} (بيانات تجريبية خياليّة)
      </p>
    </div>
  );
}
