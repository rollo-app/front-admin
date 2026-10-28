# front-admin

Backoffice de Rollo (superadmin). Ver `README.md` para correrlo; acá solo las reglas.

## Stack
Next 16.4 (App Router, `cacheComponents`, `src/proxy.ts` en vez de middleware), React 19, Tailwind, shadcn v4 "base-nova" sobre Base UI (`render`, NO `asChild`), Recharts vía shadcn `chart`. Tests: vitest + jsdom + Testing Library. Antes de tocar APIs de Next 16, leé `AGENTS.md`.

## Comandos
`npm run dev` · `npm test` · `npm run build` · `npm run lint`

## Regla BFF
El browser nunca habla con el backend. Solo `src/lib/api.ts` (server) llama al backend con el token de la cookie httpOnly `rollo_admin_session` (`session.ts`, constantes en `session-constants.ts`). `requireSession()` (`auth.ts`, cacheado por render) protege `(panel)`. `/logout` revalida antes de borrar la cookie. Única env: `BACKEND_URL` (server-only).

## Tema
Tokens en `src/app/globals.css` (hex, dark por `prefers-color-scheme`). El `--primary` cobalto es solo para acciones. Nada de colores o tamaños fuera de los tokens.

## Componentes
- `components/shell/`: `AppShell`, `Sidebar`, `PageHeader`, `nav-items`.
- `components/data/`: `DataTable`, `Pagination`, `SearchBox`, `StatCard`, `UsageMeter`, `ChartCard`, `EmptyState`, `ErrorState`.
- `lib/page-params.ts`, `lib/format.ts`.

## Sección nueva
Lista = `PageHeader` + `DataTable` sobre un endpoint del backend con el helper `paginate`. Params de URL: `page`, `pageSize` (25/50/100), `sort`, `order`, `q`. Agregá el item en `nav-items`.

## Idioma
Copy de UI en español rioplatense; código y tests en inglés; commits en español.

## Ramas
`develop` default, features por PR, `main` = producción (Vercel).

## Limitaciones conocidas
Búsqueda case-insensitive solo ASCII; `formatDate` con UTC-3 fijo; días de métricas en UTC.
