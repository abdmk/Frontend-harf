# Harf — Vite + React Router SPA

Pure client-side React SPA. No Next.js, no SSR. Vite 7 + React 19 + React Router 7.
All API/auth logic uses localStorage for demo mode; ready for a separate backend.

## Structure (Bulletproof React)

```
src/
  app/          routes/ (pages), layouts/, router.tsx (AppRouter), provider.tsx (AppProvider)
  assets/       static content (legal texts, fonts, payment marks)
  components/   ui/ (shadcn components), shared/, layout/
  config/       paths, demo flag, design-tokens/, publisher terms
  features/     one folder per feature: api/ components/ hooks/ types/ utils/
  hooks/        shared hooks
  lib/          preconfigured libraries: auth, utils (cn), json-store, media-store
  stores/       persisted client state (consent, cart, verification, submissions…)
  testing/      test setup + mocks/ (demo data standing in for the backend)
  types/        shared domain types
  utils/        pure helpers (format, csv, svg-check, payout, commerce quote…)
```

Rules (enforced by ESLint `import-x/no-restricted-paths`): features never import other
features or `app`; shared folders never import `features` or `app`; compose in `app/routes`.
