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
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          radix: ['radix-ui'],
        },
      },
    },
  },
});
