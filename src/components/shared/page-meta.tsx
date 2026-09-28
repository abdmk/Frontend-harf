import { siteConfig } from '@/config/site';

/** عنوان التبويب ووصف الصفحة — React 19 يرفع `<title>`/`<meta>` المُرسَلة من أي مكوّن إلى `<head>` تلقائياً */
export function PageMeta({ title, description, noindex }: { title?: string; description?: string; noindex?: boolean }) {
  return (
    <>
      <title>{title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.description}`}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
    </>
  );
}
