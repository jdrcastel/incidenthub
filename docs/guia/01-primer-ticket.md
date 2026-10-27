# Lección 1 — Tu primer Ticket (Fase 1, parte 1)

Objetivo: **crear** un ticket con `POST /api/tickets` y **leerlo** con `GET /api/tickets/{id}`, guardado en PostgreSQL.

Esta la escribes tú. Abajo tienes los conceptos, los pasos y pistas. Si te atascas, pégame el error completo.

## Conceptos: las capas

```
HTTP → Controller → Service → Repository → PostgreSQL
       (rutas, DTO)  (reglas)   (consultas)
```

- **Entity** (`@Entity`): una clase Java que representa una fila de una tabla.
- **Repository**: una interfaz que extiende `JpaRepository<Ticket, Long>`. Spring escribe la implementación por ti, así que ya tienes `save`, `findById`, `findAll` y `deleteById` sin escribir SQL.
- **Service** (`@Service`): la lógica de negocio. Aquí vivirá el cálculo de SLA en la Fase 2.
- **Controller** (`@RestController`): traduce HTTP ↔ Java. Sin lógica de negocio.
- **DTO** (records): lo que entra y sale por la API. **No expongas la entidad directamente**; así puedes cambiar la base de datos sin romper la API.
- **Inyección de dependencias**: no escribes `new TicketService()`. Lo pides en el constructor y Spring te lo pasa:
  ```java
  public TicketController(TicketService service) { this.service = service; }
  ```

## Paso a paso

Crea el paquete `com.jdrcastel.incidenthub.ticket`. En VS Code: clic derecho sobre `incidenthub` → **New Java Package**. Dentro van todas las clases de abajo.

### 1. Migración `src/main/resources/db/migration/V2__create_tickets.sql`

```sql
CREATE TABLE tickets (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    priority    VARCHAR(20)  NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL
);
```

### 2. Enums `Priority` y `TicketStatus`

- `Priority`: `LOW, MEDIUM, HIGH, CRITICAL`
- `TicketStatus`: `OPEN, IN_PROGRESS, RESOLVED`

### 3. Entidad `Ticket`

Pistas:
- `@Entity` y `@Table(name = "tickets")`.
- `@Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;`
- `@Enumerated(EnumType.STRING)` en `priority` y `status`. Sin esto JPA guarda números, y eso es frágil.
- `private Instant createdAt;` → Hibernate lo mapea solo a `created_at`.
- JPA exige un constructor sin argumentos: `protected Ticket() {}`. Añade otro constructor que reciba `title`, `description` y `priority`, y que ponga `status = OPEN` y `createdAt = Instant.now()`.
- Getters para todos los campos. Truco en VS Code: clic derecho → **Source Action… → Generate Getters**.

### 4. `TicketRepository`

```java
public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
```
Sí, eso es todo.

### 5. DTOs

```java
public record CreateTicketRequest(
        @NotBlank @Size(max = 200) String title,
        String description,
        @NotNull Priority priority) {}

public record TicketResponse(Long id, String title, String description,
                             Priority priority, TicketStatus status, Instant createdAt) {
    // pista: añade un método estático from(Ticket t) que construya la respuesta
}
```

### 6. `TicketService`

Dos métodos: `create(CreateTicketRequest)` y `get(Long id)`. Si el ticket no existe, lanza tu propia excepción `TicketNotFoundException`. Por ahora dará un 500; en la próxima lección la convertimos en 404.

### 7. `TicketController`

- `@PostMapping` con `@Valid @RequestBody CreateTicketRequest` → responde `201 Created`. Pista: `@ResponseStatus(HttpStatus.CREATED)`.
- `@GetMapping("/{id}")` con `@PathVariable Long id`.

## Pruébalo

Añade esto a `requests.http`:

```http
###
POST http://localhost:8080/api/tickets
Content-Type: application/json

{ "title": "SSO login fails for tenant ACME", "priority": "CRITICAL" }

###
GET http://localhost:8080/api/tickets/1

###
POST http://localhost:8080/api/tickets
Content-Type: application/json

{ "title": "", "priority": "CRITICAL" }
```

La última petición debe responder `400`.

Mira la tabla en Postgres:
```powershell
docker compose exec postgres psql -U incidenthub -c "select * from tickets;"
```

## Test

Crea `TicketControllerTest` con `@WebMvcTest(TicketController.class)`, siguiendo el patrón de `PingControllerTest`.
- Simula el servicio con `@MockitoBean TicketService service;`. En tutoriales viejos (Spring Boot 3) verás `@MockBean`; en Spring Boot 4 se llama `@MockitoBean`.
- Caso 1: `POST` con título vacío → `status().isBadRequest()`.
- Caso 2: `GET /api/tickets/1` cuando el servicio devuelve un ticket → `200` y `$.title` correcto. Pista: `when(service.get(1L)).thenReturn(...)`.

## Hecho cuando…

- [ ] La app arranca y Flyway aplica `V2` (búscalo en el log: `Migrating schema "public" to version "2 - create tickets"`).
- [ ] `POST` crea el ticket y responde `201` con el JSON.
- [ ] `GET /api/tickets/1` lo devuelve.
- [ ] Un título vacío → `400`.
- [ ] `.\mvnw test` → `BUILD SUCCESS`.
- [ ] Commit en una rama + Pull Request, y me pasas el enlace.

Siguiente lección: listar con paginación, actualizar el estado, borrar, y un manejo global de errores con `@RestControllerAdvice` (un 404 limpio en vez de un 500).
