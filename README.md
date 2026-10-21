# IncidentHub

A REST API for support incidents with SLA tracking, built with Node.js and TypeScript.

I work in production support for enterprise SaaS, where every ticket has an SLA and a breach is what the customer remembers. IncidentHub is the tool I would want: it knows each ticket's SLA and flags breaches before customers notice. I'm building it one phase at a time, and each phase adds a skill.

## Stack

Node.js 22 · TypeScript · Express 5 · PostgreSQL · Prisma · Zod · Vitest · Docker

## Roadmap

| Phase | What | Status |
|---|---|---|
| 0 | Setup: TypeScript, Express, PostgreSQL in Docker, Prisma, first endpoint and tests, CI | ✅ Done |
| 1 | Core API: ticket CRUD, validation, error handling | 🚧 In progress |
| 2 | Business rules: SLA per priority, breach detection, status workflow | Planned |
| 3 | Security: JWT auth and roles (agent, admin) | Planned |
| 4 | Tests: unit and integration tests against a real database | Planned |
| 5 | Delivery: Dockerfile, GitHub Actions CI/CD, OpenAPI docs | Planned |
| 6 | AWS: deploy to ECS or EC2 with RDS PostgreSQL | Planned |
| 7 | React front end: dashboard for agents | Planned |

## Run it locally

You need Node.js 22 and Docker.

```bash
cp .env.example .env
npm install
docker compose up -d     # PostgreSQL on localhost:5432
npm run dev              # API on localhost:3000, restarts on save
```

```bash
curl localhost:3000/api/ping   # {"message":"pong","time":"..."}
curl localhost:3000/health     # {"status":"UP","database":"UP"}
npm test                       # tests (no database needed yet)
```

## Project layout

```
src/
  server.ts        starts the HTTP server
  app.ts           builds the Express app (routes, 404, error handler)
  config.ts        validated environment variables
  db/prisma.ts     database client
  routes/          one router per resource
test/              Vitest + Supertest
prisma/            schema.prisma and SQL migrations
compose.yaml       local PostgreSQL
requests.http      sample requests (VS Code REST Client)
docs/guia/         my learning notes (Spanish)
```
