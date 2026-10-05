// تطبيق الوضع المحفوظ قبل أول رسم — يمنع وميض الفاتح قبل الداكن.
// ملف مستقلّ (لا سكربت مضمّن) حتى تبقى سياسة CSP صارمة: script-src 'self' فقط.
(function () {
  try {
    var t = localStorage.getItem('harf-theme');
    if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var d = document.documentElement;
    d.classList.toggle('dark', t === 'dark');
    d.style.colorScheme = t;
  } catch {
    // التخزين غير متاح — يبقى الوضع الافتراضي
  }
})();
