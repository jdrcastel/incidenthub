# Lección 1 — Tu primer Ticket (Fase 1, parte 1)

Objetivo: **crear** un ticket con `POST /api/tickets` y **leerlo** con `GET /api/tickets/:id`, guardado en PostgreSQL.

Esta la escribes tú. Abajo tienes los conceptos, los pasos y pistas. Si te atascas, pégame el error completo.

## Conceptos: las capas

```
HTTP → router (rutas + validación) → service (reglas de negocio) → Prisma → PostgreSQL
```

- **Router**: traduce HTTP ↔ código. Valida la entrada y decide el código de estado. Sin lógica de negocio.
- **Service**: la lógica. Aquí vivirá el cálculo de SLA en la Fase 2. No sabe nada de HTTP (no toca `req` ni `res`).
- **Prisma**: hace las consultas.
- **Zod schema**: describe qué entrada es válida. Los tipos de TypeScript desaparecen al ejecutar; Zod valida de verdad lo que manda el cliente.

## Paso a paso

Crea la carpeta `src/tickets/`.

### 1. El modelo en `prisma/schema.prisma`

```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}

model Ticket {
  id          Int          @id @default(autoincrement())
  title       String       @db.VarChar(200)
  description String?
  priority    Priority
  status      TicketStatus @default(OPEN)
  createdAt   DateTime     @default(now()) @map("created_at")

  @@map("tickets")
}
```

`String?` significa opcional (puede ser `null`). `@map`/`@@map` fijan los nombres en la base de datos al estilo SQL (`snake_case`, plural).

### 2. Crea la migración y regenera el cliente

```bash
npx prisma migrate dev --name create_tickets
npx prisma generate
```

- `migrate dev` compara tu schema con la base de datos y escribe el SQL en `prisma/migrations/.../migration.sql`. **Ábrelo y léelo**: es el `CREATE TABLE` que habrías escrito a mano.
- `generate` actualiza el cliente con tipos: ahora `prisma.ticket` existe y tiene autocompletado. En Prisma 7, **`migrate` ya no lo hace solo**. Si ves `Cannot read properties of undefined (reading 'create')`, te faltó este paso.
- Las migraciones se suben al repo. **Nunca edites una que ya se aplicó**: crea otra.

Mira la tabla: `npx prisma studio` abre una interfaz web, o desde la terminal:
```bash
docker compose exec postgres psql -U incidenthub -c "\d tickets"
```

### 3. `src/tickets/ticket.schemas.ts`: validación con Zod

```ts
import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;  // tipo TS gratis
```

### 4. `src/tickets/ticket.service.ts`

Dos funciones `async`:
- `createTicket(input: CreateTicketInput)` → `prisma.ticket.create({ data: input })`
- `getTicket(id: number)` → `prisma.ticket.findUnique({ where: { id } })`. Devuelve `null` si no existe.

### 5. `src/tickets/ticket.routes.ts`

```ts
export const ticketsRouter = Router();
```

- `POST /`: valida con `createTicketSchema.safeParse(req.body)`.
  - Si `!result.success` → `res.status(400).json({ error: "Validation failed", issues: result.error.issues })`.
  - Si es válido → llama al service y responde `res.status(201).json(ticket)`.
- `GET /:id`: `Number(req.params.id)`. Si no es un número válido → 400. Si el service devuelve `null` → 404. Si no, responde el ticket.

Pista: los handlers que usan `await` se declaran `async (req, res) => { ... }`. En Express 5, si un handler async lanza un error, llega solo al manejador de errores de `app.ts`.

### 6. Móntalo en `src/app.ts`

```ts
app.use("/api/tickets", ticketsRouter);
```

Ponlo **antes** del manejador 404.

## Pruébalo

Añade esto a `requests.http`:

```http
###
POST http://localhost:3000/api/tickets
Content-Type: application/json

{ "title": "SSO login fails for tenant ACME", "priority": "CRITICAL" }

###
GET http://localhost:3000/api/tickets/1

###
POST http://localhost:3000/api/tickets
Content-Type: application/json

{ "title": "", "priority": "URGENT" }
```

La última petición debe responder `400` con dos problemas: el título vacío y una prioridad inválida.

## Test

Crea `test/tickets.test.ts` con al menos estos casos:
- `POST` con título vacío → `400`. Este test no toca la base de datos porque Zod lo rechaza antes. Fíjate en `test/ping.test.ts` para el patrón.
- `GET /api/tickets/abc` → `400`.

Los tests que sí usan la base de datos los montaremos bien en la Fase 4.

## Hecho cuando…

- [ ] La migración está creada y subida al repo.
- [ ] `POST` crea el ticket y responde `201` con el JSON.
- [ ] `GET /api/tickets/1` lo devuelve; `GET /api/tickets/999` → `404`.
- [ ] Una entrada inválida → `400`.
- [ ] `npm test` y `npm run typecheck` en verde.
- [ ] Commit en una rama + Pull Request, y me pasas el enlace.

Siguiente lección: listar con filtros y paginación, actualizar el estado, borrar y un manejo de errores más ordenado.
