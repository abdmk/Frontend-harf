import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// العرض التجريبي (الحسابات الوهمية و?as=) في التطوير والمعاينات فقط — Vercel يضبط VERCEL_ENV وقت البناء
const demo = process.env.VERCEL_ENV !== 'production';

export default defineConfig({
  plugins: [tsconfigPaths(), react(), tailwindcss()],
  define: { 'import.meta.env.VITE_DEMO_MODE': JSON.stringify(demo ? 'true' : 'false') },
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    rollupOptions: {
      output: {
        // المكتبات في حزم ثابتة منفصلة: تتغيّر نادراً فيبقيها المتصفّح مخزّنة بين النشرات
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'react';
          if (/[\\/](radix-ui|@radix-ui)[\\/]/.test(id)) return 'radix';
          if (/[\\/]zod[\\/]/.test(id)) return 'zod';
        },
      },
    },
  },
});
