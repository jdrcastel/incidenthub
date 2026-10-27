# IncidentHub

A REST API for support incidents with SLA tracking, built with Java and Spring Boot.

I work in production support for enterprise SaaS, where every ticket has an SLA and a breach is what the customer remembers. IncidentHub is the tool I would want: it knows each ticket's SLA and flags breaches before customers notice. I'm using it to learn Java and Spring Boot one phase at a time.

## Stack

Java 21 · Spring Boot 4 · Spring Data JPA · PostgreSQL · Flyway · JUnit 5 · Docker

## Roadmap

| Phase | What | Status |
|---|---|---|
| 0 | Setup: Spring Boot, PostgreSQL in Docker, Flyway, first endpoint and test, CI | ✅ Done |
| 1 | Core API: ticket CRUD, validation, error handling | 🚧 In progress |
| 2 | Business rules: SLA per priority, breach detection, status workflow | Planned |
| 3 | Security: Spring Security with JWT and roles (agent, admin) | Planned |
| 4 | Tests: JUnit 5, Mockito, Testcontainers | Planned |
| 5 | Delivery: Dockerfile, GitHub Actions CI/CD, OpenAPI docs | Planned |
| 6 | AWS: deploy to ECS or EC2 with RDS PostgreSQL | Planned |
| 7 | AI triage with Spring AI: summarize each ticket and suggest its priority | Planned |

## Run it locally

You need Java 21 and Docker.

```bash
docker compose up -d        # PostgreSQL on localhost:5432
./mvnw spring-boot:run      # API on localhost:8080  (Windows PowerShell: .\mvnw spring-boot:run)
```

```bash
curl localhost:8080/api/ping           # {"message":"pong","time":"..."}
curl localhost:8080/actuator/health    # {"status":"UP", ... "db":{"status":"UP"} ...}
./mvnw test                            # tests (no database needed yet)
```

## Project layout

```
src/main/java/com/jdrcastel/incidenthub/
  IncidentHubApplication.java    entry point
  ping/                          smoke-test endpoint
src/main/resources/
  application.yml                configuration
  db/migration/                  Flyway SQL migrations (V1__, V2__, ...)
src/test/java/...                tests
compose.yaml                     local PostgreSQL
requests.http                    sample requests (VS Code REST Client)
docs/guia/                       my learning notes (Spanish)
```
