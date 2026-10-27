# Lección 0 — Poner el ambiente a andar (Java + Spring Boot)

Objetivo de hoy: que la API corra en tu máquina y entiendas cada archivo. Solo escribes código en el calentamiento del final (15 minutos).

## 1. Instala las herramientas

| Herramienta | Para qué | Cómo comprobar |
|---|---|---|
| **Java 21 (JDK)**: https://adoptium.net (Temurin 21, instalador `.msi`) | Compilar y ejecutar Java | `java -version` muestra `21` |
| **Docker Desktop** | Correr PostgreSQL sin instalarlo | `docker --version` |
| **Git** | Control de versiones | `git --version` |
| **VS Code** | Editor | — |

En el instalador de Temurin marca **"Set JAVA_HOME variable"** y **"Add to PATH"**. Después **cierra y vuelve a abrir VS Code** para que la terminal lo vea (el mismo problema que tuviste con Docker).

No instales Maven: el proyecto trae el **Maven Wrapper** (`mvnw` / `mvnw.cmd`), que descarga la versión correcta la primera vez.

### Si usas Windows

- Trabaja **fuera de OneDrive**, por ejemplo en `C:\dev\incidenthub`.
- En PowerShell los comandos del proyecto se escriben con `.\` delante: `.\mvnw spring-boot:run`.
- Si PowerShell dice *"running scripts is disabled"*: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## 2. Abre el proyecto en VS Code

1. **File → Open Folder… → `C:\dev\incidenthub`**.
2. Abajo a la derecha aparece *"This workspace has extension recommendations"*. Pulsa **Install All**:
   - **Extension Pack for Java**: autocompletado, errores en rojo, ejecutar y depurar.
   - **Spring Boot Extension Pack**: un panel *Spring Boot Dashboard* para arrancar y parar la app con un clic.
   - **Container Tools**: para ver el contenedor de Postgres.
   - **REST Client**: probar la API desde `requests.http`.
3. Espera a que termine *"Java: Importing projects"* en la barra de abajo. La primera vez tarda unos minutos.
4. Si VS Code no encuentra Java 21: `Ctrl+Shift+P` → **Java: Configure Java Runtime**.

## 3. Arranca

Con Docker Desktop abierto, en la terminal de VS Code (`` Ctrl+` ``):

```powershell
docker compose up -d          # arranca PostgreSQL
.\mvnw spring-boot:run        # arranca la API (en Mac/Linux: ./mvnw spring-boot:run)
```

La primera vez tarda porque descarga Maven y las dependencias. Cuando veas `Started IncidentHubApplication`, abre `requests.http` y pulsa **Send Request**:

- `/api/ping` → `{"message":"pong", ...}`
- `/actuator/health` → `"status":"UP"`, y dentro `"db":{"status":"UP"}`. Eso confirma que la app habla con Postgres.

También puedes arrancarla sin terminal: abre `IncidentHubApplication.java` y pulsa **Run** encima del método `main`, o usa el panel **Spring Boot Dashboard**.

Para parar: `Ctrl+C` en la terminal, y `docker compose down` para la base de datos.

### Atajos que vas a usar todo el tiempo

| Atajo | Qué hace |
|---|---|
| `Ctrl+Shift+P` | Paleta de comandos |
| `` Ctrl+` `` | Abrir/cerrar terminal |
| `Ctrl+P` | Abrir archivo por nombre |
| `F12` | Ir a la definición (úsalo para leer el código de Spring) |
| `Ctrl+.` | Arreglo rápido: importar clases, crear métodos… |
| `F5` | Depurar. Pon un punto rojo junto a una línea y la app se pausa ahí |

## 4. Recorre el proyecto (en este orden)

1. **`pom.xml`**: la receta del proyecto para Maven, como un Makefile más la lista de librerías. El `<parent>` de Spring Boot fija las versiones de todo. Cada *starter* trae un paquete de librerías:
   - `webmvc` → controladores REST, servidor Tomcat embebido y JSON
   - `validation` → anotaciones como `@NotBlank`
   - `data-jpa` → hablar con la base de datos usando objetos Java (Hibernate)
   - `flyway` → migraciones SQL versionadas
   - `actuator` → `/actuator/health`
2. **`IncidentHubApplication.java`**: el `main`. `@SpringBootApplication` le dice a Spring: "escanea este paquete y sus subpaquetes, encuentra mis clases anotadas y configura todo". **Por eso todas tus clases van bajo `com.jdrcastel.incidenthub`.**
3. **`ping/PingController.java`**: el endpoint más simple:
   - `@RestController` → esta clase atiende HTTP y lo que devuelve se convierte en JSON.
   - `@RequestMapping("/api/ping")` → la ruta base.
   - `@GetMapping` → este método atiende `GET`.
   - `record` → una clase de datos inmutable en una línea. La vas a usar mucho.
4. **`application.yml`**: la configuración. Con `ddl-auto: validate`, Hibernate **no** crea tablas; las crea Flyway.
5. **`db/migration/V1__init.sql`**: Flyway ejecuta cada `V<n>__nombre.sql` una sola vez, en orden. **Nunca edites una migración ya aplicada**: crea otra.
6. **`compose.yaml`**: el contenedor de PostgreSQL.
7. **`PingControllerTest.java`**: `@WebMvcTest` levanta solo la capa web, sin base de datos, y `MockMvc` simula peticiones HTTP. Ejecútalo con `.\mvnw test` o con el botón ▶ junto al test.

## 5. Java para alguien que viene de C++

Buena noticia: Java se parece mucho a C++. Mismos `if`, `for`, `while`, `switch`, llaves, `int`, `double`, `boolean`, clases, `public`/`private`, herencia… Lo que cambia:

```java
// Todo vive dentro de una clase. Un archivo = una clase pública con el mismo nombre.
public class Ticket {
    private final String title;      // final ≈ const: no cambia después del constructor
    private Priority priority;

    public Ticket(String title, Priority priority) {
        this.title = title;          // this es una referencia, no un puntero: se usa con punto
        this.priority = priority;
    }

    public String getTitle() { return title; }
}

// No hay punteros ni delete: todos los objetos se crean con new y el recolector de basura los libera.
Ticket t = new Ticket("SSO down", Priority.CRITICAL);
var t2 = new Ticket("Slow reports", Priority.LOW);   // var infiere el tipo, como auto

// Strings: se comparan con equals, NO con ==  (== compara si es el mismo objeto)
if (t.getTitle().equals("SSO down")) { }

// Enum: como enum class en C++
public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }

// Record: clase de datos con constructor, getters, equals y toString gratis
public record TicketSummary(Long id, String title) {}
var s = new TicketSummary(1L, "SSO down");
s.title();                           // el getter se llama igual que el campo

// List ≈ std::vector,  Map ≈ std::map
List<Ticket> tickets = new ArrayList<>();
tickets.add(t);
Map<Priority, Integer> slaHours = Map.of(Priority.CRITICAL, 4, Priority.HIGH, 8);

// Streams ≈ algoritmos de <algorithm> encadenados, con lambdas
List<String> critical = tickets.stream()
        .filter(x -> x.getPriority() == Priority.CRITICAL)   // los enums sí se comparan con ==
        .map(Ticket::getTitle)
        .toList();

// Optional: un valor que puede no estar (en vez de devolver null)
Optional<Ticket> maybe = repository.findById(1L);
Ticket found = maybe.orElseThrow(() -> new TicketNotFoundException(1L));

// Excepciones: como en C++, pero se usan mucho más
throw new IllegalArgumentException("title is required");

// Interfaces: como una clase abstracta pura de C++
public interface TicketRepository extends JpaRepository<Ticket, Long> {}
```

Lo nuevo de verdad son las **anotaciones** (`@Algo`). Son etiquetas que Spring lee para saber qué hacer con tu clase: `@RestController` la convierte en controlador, `@Entity` en una tabla, `@Service` en un servicio. Mucha de la "magia" de Spring sale de ahí.

## 6. Calentamiento (15 min)

1. Añade a `PingResponse` un campo `String app` que devuelva `"incidenthub"`.
2. Comprueba en el test que llega: `.andExpect(jsonPath("$.app").value("incidenthub"))`.
3. `.\mvnw test` → `BUILD SUCCESS`.
4. Súbelo en una rama y abre un Pull Request:
   ```powershell
   git checkout -b warmup
   git add .
   git commit -m "Add app name to ping response"
   git push -u origin warmup
   ```
   Abre el PR en GitHub y pásame el enlace: lo reviso como en un equipo real.

Siguiente: [Lección 1 — Tu primer Ticket](01-primer-ticket.md)
