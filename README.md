# Rollo front-admin

Backoffice de Rollo. Solo para usuarios con `app_role = 'superadmin'`. Next.js 16.4 (App Router, `cacheComponents`, `src/proxy.ts` en vez de middleware), React 19, Tailwind, shadcn v4 "base-nova" sobre Base UI (prop `render`, sin `asChild`), Recharts vía el `chart` de shadcn. Tests con vitest + jsdom + Testing Library.

Diseño: `docs/decisiones/0002-backoffice.md` §8 en el repo del backend.

## Cómo corre (BFF)

El browser nunca habla con el backend. Todo pasa por el servidor de Next:

- `src/lib/api.ts` (server-only) llama al backend con el token de la cookie httpOnly `rollo_admin_session` (`src/lib/session.ts`; el nombre vive en `session-constants.ts`).
- `requireSession()` (`src/lib/auth.ts`, cacheado por render) protege el layout `(panel)`.
- `src/proxy.ts` solo chequea que exista la cookie; la validación real es `requireSession()`.
- `/logout` revalida contra el backend antes de borrar la cookie.
- Login: `src/app/login/` (código por mail, mismo flujo que la app).

## Variables de entorno

Una sola: `BACKEND_URL` (server-only). Dev: `http://localhost:8787` en `.env.local` (`cp .env.example .env.local`). Producción: `https://rollo-api.juanifraga.com`.

## Correr en local

1. En el repo del backend: `npm run dev` (puerto 8787).
2. Hacé un primer login (así se crea el usuario) y promovelo:
   ```bash
   wrangler d1 execute rollo --local --command "UPDATE users SET app_role='superadmin' WHERE email='vos@mail.com'"
   ```
3. Acá: `npm install && npm run dev`, y logueate con el código que imprime la consola del backend.

Otros: `npm test` (vitest), `npm run build`, `npm run lint`.

## Estructura

- `src/app/globals.css`: tokens de tema (hex; dark por `prefers-color-scheme`; el `--primary` cobalto es solo para acciones).
- `src/components/shell/`: `AppShell`, `Sidebar`, `PageHeader`, `nav-items`.
- `src/components/data/`: `DataTable`, `Pagination`, `SearchBox`, `StatCard`, `UsageMeter`, `ChartCard`, `EmptyState`, `ErrorState`.
- `src/lib/page-params.ts` (params de URL), `src/lib/format.ts` (fechas, números).

## Agregar una sección

Página de lista = `PageHeader` + `DataTable` sobre un endpoint del backend que use el helper `paginate`. Params de URL: `page`, `pageSize` (25/50/100), `sort`, `order`, `q`. Sin colores ni tamaños fuera de los tokens. Copy de UI en español rioplatense; código y tests en inglés; commits en español.

## Deploy

Vercel: producción desde `main`, previews desde `develop` y PRs. `BACKEND_URL` configurada en Production y Preview. Ramas como el backend: `develop` es la default, features por PR, `main` = producción.

## Limitaciones conocidas

- La búsqueda es case-insensitive solo ASCII (`ANGELA` no matchea `Ángela`).
- `formatDate` usa UTC-3 fijo.
- Los días de métricas son UTC.
