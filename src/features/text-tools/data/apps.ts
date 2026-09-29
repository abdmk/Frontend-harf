/**
 * البرامج الشائعة التي تعرض العربية منفصلة ومقلوبة. كلها تحتاج الوصل والعكس معاً؛
 * الفرق في النصيحة العملية لكل برنامج — تظهر تحت الشرائح حين يُختار.
 */
export const APPS = [
  {
    id: 'after-effects',
    name: 'After Effects',
    tip: 'الصق النتيجة في طبقة نص، واختر خطاً عربياً. إن فعّلت «محرّك نصوص الشرق الأوسط» من التفضيلات فلا تحتاج الأداة.',
  },
  {
    id: 'premiere',
    name: 'Premiere Pro',
    tip: 'للعناوين في Essential Graphics حين لا يعمل محرّك الشرق الأوسط. اكسر الأسطر الطويلة يدوياً قبل النسخ.',
  },
  {
    id: 'photoshop',
    name: 'Photoshop / Illustrator',
    tip: 'للنسخ التي لا تدعم العربية، أو حين يكون «مؤلّف النص» لاتينياً. الأفضل تفعيل المؤلّف العالمي إن توفّر.',
  },
  {
    id: 'unity',
    name: 'Unity',
    tip: 'لمكوّن Text وTextMeshPro. تأكّد أن ملف الخط يحوي أشكال العرض العربية، وأضفها إلى أطلس TMP.',
  },
  {
    id: 'unreal',
    name: 'Unreal Engine',
    tip: 'لـUMG وText Render. أضف نطاق أشكال العرض (FB50–FDFF وFE70–FEFF) إلى الخط المستورد.',
  },
  {
    id: 'blender',
    name: 'Blender',
    tip: 'لكائنات النص: اختر ملف خط عربي من خصائص النص قبل اللصق، وإلا ظهرت مربّعات.',
  },
  {
    id: 'other',
    name: 'برنامج آخر',
    tip: 'الإعداد الافتراضي — وصل الحروف وعكس الاتجاه — يناسب أغلب البرامج التي لا تدعم العربية.',
  },
] as const;

export type AppId = (typeof APPS)[number]['id'];

export const appById = (id: string | null) => APPS.find((a) => a.id === id) ?? APPS.at(-1)!;
