# حرف — مكتبة الخطوط العربية

واجهة المكتبة (Front-End) مبنية بـ **Next.js (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui**، وتُدار بـ **pnpm**.

## التشغيل

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| الأمر         | ما يفعله                                                  |
| ------------- | --------------------------------------------------------- |
| `pnpm check`  | typecheck + lint (مع حدود الطبقات) + اختبارات الوحدات     |
| `pnpm build`  | نسخة الإنتاج                                              |
| `pnpm e2e`    | يبني نسخة الإنتاج ويشغّل رحلات Playwright تحت CSP الصارمة |
| `pnpm format` | Prettier (مع ترتيب أصناف Tailwind)                        |
| `pnpm icons`  | يعيد توليد الأيقونات من `tools/icons/uicons.zip`          |

> `@playwright/test` مثبّت على نسخة تطابق متصفّح Chromium المثبّت في بيئة التطوير. عند الترقية حدّث المتصفّح معه (`pnpm exec playwright install chromium`).

## البنية (Bulletproof React — حسب الميزة)

```
reference/         مراجع التصميم — لا تُعدَّل ولا تُحذف
tools/icons/       مصدر طقم الأيقونات
scripts/           مولّدات (الأيقونات)
e2e/               اختبارات Playwright
src/
  app/             المسارات وتركيب الـfeatures فقط
  components/
    ui/            مكوّنات shadcn بأسلوب حرف + الأيقونات
    shared/        مكوّنات مشتركة (FontCard, FontGrid, Carousel, FileIcon…)
    layout/        الترويسة والتذييل والأقسام العامة
  features/<name>/ api/ components/ hooks/ types/ utils/ — لكل ميزة
  config/          المسارات، التنقّل، الخطوط
  hooks/ lib/      أدوات عامة (cn, format, labels, auth)
  types/domain/    أنواع المجال (Font, User, Notification…)
  mocks/           بيانات تجريبية فقط
  assets/          الخطوط والشعار
  proxy.ts         CSP بـnonce ورؤوس الأمان
```

**قواعد الطبقات** (يفرضها ESLint — `import/no-restricted-paths`):

- الـfeature لا يستورد من feature آخر. التركيب يحدث في `src/app` عبر فتحات (slots)، مثل `<FontCard favorite={<FavoriteButton />} />`.
- الشيفرة المشتركة (`components`, `lib`, `hooks`, `types`, `config`, `mocks`) لا تستورد من `features` ولا من `app`.
- كل مجلّد جديد داخل `src/features` يدخل تحت هذه القواعد تلقائياً.

## البيانات التجريبية ← الخادم الحقيقي

كل البيانات في `src/mocks/*`، ولا تصل إليها المكوّنات مباشرة. كل feature يقرأ عبر دوال `api/` الخاصة به، مثل `getFonts` و`getFont` و`getCurrentUser`. هذه الدوال تعمل على الخادم فقط (`server-only`).

للربط بواجهة حقيقية يُستبدل تنفيذ هذه الدوال وحدها، دون لمس المكوّنات. الأسعار والتراخيص والحدود في البيانات التجريبية أمثلة مؤقتة، وليست قرارات تجارية.

**الحساب التجريبي:** `?as=free` أو `?as=studio` في أي رابط. يُحفظ في كوكي `httpOnly`، ويُستبدل بجلسة حقيقية لاحقاً.

## الأمان

- CSP بـnonce لكل طلب، مع `strict-dynamic`، و`frame-ancestors 'none'`، ورؤوس `nosniff` و`Referrer-Policy`.
- معاملات الرابط تُتحقّق بـZod على الخادم، والقيم غير الصالحة تعود إلى الافتراضي.
- لا HTML خام (`react/no-danger`). الاستثناء الوحيد سكربت الوضع الليلي الثابت، وهو يعمل بـnonce.
- الصلاحيات تُفحص على الخادم: لوحة المسبك للاستوديو فقط.
- لا أسرار في الواجهة. انظر `.env.example`.
