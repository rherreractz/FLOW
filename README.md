# Flow

Sistema de automatización de agenda y atención al cliente por redes sociales. Cada negocio cliente tiene su propia landing personalizada que captura leads, los clasifica automáticamente y dispara flujos de respuesta en WhatsApp e Instagram.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 · React 19 · Tailwind CSS v4 |
| Backend | Fastify 5 · TypeScript 5.5 |
| ORM | Prisma 5 · PostgreSQL 16 |
| Queue | BullMQ · Redis 7 |
| Automatización | n8n self-hosted |
| Storage | MinIO |
| Monorepo | Turborepo 2.9 · pnpm workspaces |

## Requisitos previos

- Node.js >= 20
- pnpm >= 9 — `npm install -g pnpm`
- Docker Desktop corriendo

## Setup inicial (primera vez)

```bash
# 1. Clonar e instalar dependencias
git clone <repo-url>
cd flow
pnpm install

# 2. Levantar servicios con Docker (PostgreSQL, Redis, MinIO, n8n)
cd infra/docker
cp .env.example .env
docker compose up -d
cd ../..

# 3. Copiar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Generar cliente de Prisma
pnpm --filter @flow/database db:generate

# 5. Correr migraciones
pnpm --filter @flow/database db:migrate

# 6. Cargar datos de prueba (tenant demo + 20 leads)
pnpm --filter @flow/database db:seed

# 7. Arrancar en desarrollo
pnpm dev
```

## Desarrollo diario

```bash
# Levantar Docker si no está corriendo
cd infra/docker && docker compose up -d && cd ../..

# Arrancar web + api en paralelo
pnpm dev
```

## URLs en desarrollo

| Servicio | URL |
|----------|-----|
| Landing demo | http://localhost:3000/demo-clinica |
| API (Fastify) | http://localhost:4000 |
| Prisma Studio | http://localhost:5555 |
| n8n | http://localhost:5678 |
| MinIO console | http://localhost:9001 |

## Estructura

```
flow/
├── apps/
│   ├── web/               # Next.js — landings por tenant + dashboard
│   └── api/               # Fastify — REST API + workers BullMQ
├── packages/
│   ├── types/             # Tipos TypeScript compartidos
│   ├── ui/                # Componentes React compartidos
│   ├── database/          # Prisma client + schema + seed
│   └── config/
│       └── typescript/    # tsconfig base / nextjs / fastify
└── infra/
    └── docker/            # docker-compose.yml
```

## Scripts disponibles

```bash
pnpm dev                                          # Arranca web + api
pnpm build                                        # Build de producción
pnpm --filter @flow/database db:generate    # Genera cliente Prisma
pnpm --filter @flow/database db:migrate     # Corre migraciones
pnpm --filter @flow/database db:seed        # Carga datos de prueba
pnpm --filter @flow/database db:studio      # Abre Prisma Studio
```

## Convenciones

- Todo el código en TypeScript estricto
- Tipos compartidos via `@flow/types` — nunca duplicar interfaces entre apps
- Cada tenant tiene `slug` único → URL de su landing (`/nombre-del-negocio`)
- Los leads siempre se procesan de forma asíncrona via BullMQ, nunca en el request
- n8n maneja los flujos de automatización visuales (WhatsApp, Instagram)

## Agregar un nuevo tenant de prueba

Edita `packages/database/prisma/seed.ts` o inserta directamente en Prisma Studio:

```
http://localhost:5555 → Tenant → Add record
slug: nombre-del-negocio
name: Nombre del Negocio
plan: PRO
```

Luego crea su `TenantConfig` con los colores y tipografía. La landing aparece automáticamente en `http://localhost:3000/nombre-del-negocio`.

## Notas importantes

- **Tailwind v4** — este proyecto usa `@tailwindcss/postcss` en lugar del plugin v3. No uses la sintaxis de configuración de Tailwind v3.
- **Next.js 15** — los `params` de rutas dinámicas son `Promise`. Siempre usar `await params` antes de acceder a sus propiedades.
- **pnpm workspaces** — no corras `npm install` ni `yarn`. Solo `pnpm install` desde la raíz.
- **Cliente Prisma** — se genera localmente y no va en git. Si ves errores de `@prisma/client not found`, corre `db:generate`.