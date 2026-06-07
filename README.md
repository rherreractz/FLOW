# AgendaFlow — Monorepo

Sistema de automatización de agenda y atención por redes sociales.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 · React 19 · Tailwind CSS |
| Backend | Fastify 5 · TypeScript |
| ORM | Prisma 5 · PostgreSQL 16 |
| Queue | BullMQ · Redis 7 |
| Automatización | n8n self-hosted |
| Storage | MinIO |
| Monorepo | Turborepo 2.9 · pnpm workspaces |

## Estructura

```
agendaflow/
├── apps/
│   ├── web/          # Next.js — landings por tenant + dashboard
│   └── api/          # Fastify — REST API + workers BullMQ
├── packages/
│   ├── types/        # Tipos TypeScript compartidos
│   ├── ui/           # Componentes React compartidos
│   ├── database/     # Prisma client + schema
│   └── config/
│       └── typescript/  # tsconfig base / nextjs / fastify
└── infra/
    └── docker/       # docker-compose.yml para dev local
```

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar servicios (postgres, redis, minio, n8n)
cd infra/docker && cp .env.example .env && docker compose up -d

# 3. Variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Migrar base de datos
pnpm db:migrate

# 5. Desarrollo
pnpm dev
```

## Convenciones

- Todo el código en TypeScript estricto
- Tipos compartidos via `@agendaflow/types`
- Cada tenant tiene `slug` único → URL de la landing
- BullMQ procesa leads de forma asíncrona
- n8n maneja los flujos de automatización visual
