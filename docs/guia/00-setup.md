# Lección 0 — Poner el ambiente a andar

Objetivo de hoy: que la API corra en tu máquina y entiendas cada archivo. Todavía no escribes código nuevo, salvo un calentamiento de 15 minutos al final.

## 1. Instala las herramientas

| Herramienta | Para qué | Cómo comprobar |
|---|---|---|
| **Node.js 22 LTS**: https://nodejs.org | Ejecutar JavaScript/TypeScript | `node -v` muestra `v22...` |
| **Docker Desktop** | Correr PostgreSQL sin instalarlo | `docker --version` |
| **Git** | Control de versiones | `git --version` |
| **VS Code** | Editor | — |

### Si usas Windows

- **Clona el proyecto fuera de OneDrive**, por ejemplo en `C:\dev\incidenthub`. OneDrive intenta sincronizar los miles de archivos de `node_modules`, y eso hace todo lento o bloquea archivos.
- **Error `npm.ps1 cannot be loaded because running scripts is disabled`**: PowerShell bloquea scripts por defecto. Arréglalo una vez con
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```
  Si tu computadora es de empresa y no te deja, usa la terminal **Command Prompt** o **Git Bash** en VS Code (flecha `˅` junto al `+` de la terminal). Otra opción es escribir `npm.cmd` en vez de `npm`.

## 2. Clona, instala y abre en VS Code

```bash
git clone https://github.com/jdrcastel/incidenthub.git
cd incidenthub
code .
```

En VS Code:

1. Abajo a la derecha aparece *"This workspace has extension recommendations"*. Pulsa **Install All**:
   - **Prisma**: colores y autocompletado en `schema.prisma`.
   - **Vitest**: un panel de tests con botones ▶.
   - **Prettier**: formatea el código al guardar.
   - **Container Tools**: para ver el contenedor de Postgres.
   - **REST Client**: probar la API desde `requests.http`, como un Postman dentro del editor.
2. Abre la terminal con `` Ctrl+` `` y ejecuta:

```bash
cp .env.example .env        # tu configuración local (en Windows PowerShell: copy .env.example .env)
npm install                 # descarga dependencias y genera el cliente de Prisma
docker compose up -d        # arranca PostgreSQL
npm run dev                 # arranca la API y la reinicia cada vez que guardas
```

Cuando veas `IncidentHub API listening on http://localhost:3000`, abre `requests.http` y pulsa **Send Request** sobre cada petición:

- `/api/ping` → `{"message":"pong", ...}`
- `/health` → `{"status":"UP","database":"UP"}`

Si `/health` dice `DOWN`, Postgres no está corriendo: revisa `docker compose ps`.

Para parar: `Ctrl+C` en la terminal de la API, y `docker compose down` para la base de datos. Los datos se conservan; `docker compose down -v` los borra.

### Atajos de VS Code que vas a usar todo el tiempo

| Atajo | Qué hace |
|---|---|
| `Ctrl+Shift+P` | Paleta de comandos (lo busca todo) |
| `` Ctrl+` `` | Abrir/cerrar terminal |
| `Ctrl+P` | Abrir archivo por nombre |
| `F12` | Ir a la definición |
| `Ctrl+.` | Arreglo rápido (importar algo que falta, etc.) |
| `Ctrl+Space` | Forzar autocompletado |

Si `npm run dev` falla con `Cannot find module '...src/generated/prisma/client.js'`, falta el cliente de Prisma. Créalo con:
```bash
npx prisma generate
```

## 3. Recorre el proyecto (en este orden)

1. **`package.json`**: el equivalente al Makefile más la lista de librerías.
   - `scripts`: comandos que corres con `npm run <nombre>` (`dev`, `test`, `typecheck`, `build`).
   - `dependencies`: lo que necesita la app en producción (express, zod, prisma client).
   - `devDependencies`: solo para desarrollar (typescript, vitest...).
2. **`src/server.ts`**: el `main()`. Crea la app y la pone a escuchar en un puerto.
3. **`src/app.ts`**: arma Express:
   - `express.json()`: convierte el cuerpo JSON de las peticiones en objetos.
   - `app.use("/api/ping", pingRouter)`: monta un router bajo una ruta.
   - Un manejador 404 y uno de errores 500, ambos responden JSON.
   - Está separado de `server.ts` para que los tests usen la app **sin** abrir un puerto real.
4. **`src/routes/ping.ts`**: el endpoint más simple. `(req, res) => { ... }` es una función flecha; `res.json(...)` responde con JSON.
5. **`src/routes/health.ts`**: un endpoint `async` que le pregunta algo a la base de datos con `await`.
6. **`src/config.ts`**: lee `.env` y lo valida con **Zod**. Si falta `DATABASE_URL`, la app falla al arrancar con un mensaje claro.
7. **`src/db/prisma.ts`**: el cliente de base de datos. **Prisma** es un ORM: escribes `prisma.ticket.create(...)` en vez de SQL a mano, con autocompletado y tipos.
8. **`prisma/schema.prisma`**: aquí describes tus tablas como `model`. En la Lección 1 añades `Ticket`.
9. **`compose.yaml`**: el contenedor de PostgreSQL.
10. **`test/ping.test.ts`**: un test con **Vitest** (`describe`/`it`/`expect`) y **Supertest** (simula peticiones HTTP). Ejecuta `npm test`.

## 4. JavaScript/TypeScript para alguien que viene de C++

Lo que se parece: `if`, `for`, `while`, `switch`, llaves, `return`, operadores. Lo que cambia:

```ts
// Variables: const (no se reasigna, úsalo casi siempre) y let. Nunca var.
const name = "Juan";            // el tipo string se infiere
let count: number = 0;          // o lo escribes tú. number = int y double a la vez

// Funciones
function add(a: number, b: number): number {
  return a + b;
}
const double = (x: number) => x * 2;    // función flecha, muy común

// Objetos: como un struct, pero sin declarar la clase primero
const ticket = { id: 1, title: "SSO down", priority: "CRITICAL" };
console.log(ticket.title);

// type: describe la forma de un objeto (parecido a un struct en un .h)
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";   // solo esos valores
type Ticket = { id: number; title: string; priority: Priority };

// Arrays (como std::vector) y sus métodos
const tickets: Ticket[] = [];
tickets.push({ id: 2, title: "Slow reports", priority: "LOW" });
const critical = tickets.filter((t) => t.priority === "CRITICAL");  // === siempre, nunca ==
const titles = tickets.map((t) => t.title);

// Desestructuración y spread
const { id, title } = ticket;
const updated = { ...ticket, title: "New title" };   // copia con un campo cambiado

// Strings con variables
console.log(`Ticket ${id}: ${title}`);

// null / undefined y el operador ?.
const first = tickets[0]?.title ?? "no tickets";

// async/await: la base de datos y la red no bloquean; esperas el resultado con await
async function load() {
  const t = await prisma.ticket.findUnique({ where: { id: 1 } });
  if (!t) throw new Error("not found");
  return t;
}

// Módulos: export en un archivo, import en otro (como #include, pero por nombre)
export function hello() {}
import { hello } from "./hello.js";   // ojo: se escribe .js aunque el archivo sea .ts
```

Diferencias que te van a morder:
- **No hay punteros ni memoria manual**: los objetos y arrays se pasan por referencia y el recolector de basura los libera.
- **`===` y no `==`.**
- **Olvidar `await`**: obtienes una `Promise` en vez del dato. Si ves `Promise<...>` donde esperabas un objeto, te falta un `await`.
- **Los tipos de TypeScript solo existen al compilar.** Para validar datos que llegan de fuera (el cuerpo de una petición) usamos Zod.

## 5. Calentamiento (15 min)

1. Haz que `/api/ping` devuelva también `app: "incidenthub"`.
2. Añade al test `expect(res.body.app).toBe("incidenthub")`.
3. `npm test` → verde. `npm run typecheck` → sin errores.
4. Súbelo en una rama y abre un Pull Request:
   ```bash
   git checkout -b warmup
   git add .
   git commit -m "Add app name to ping response"
   git push -u origin warmup
   ```
   Abre el PR en GitHub y pásame el enlace: lo reviso como en un equipo real.

Siguiente: [Lección 1 — Tu primer Ticket](01-primer-ticket.md)
