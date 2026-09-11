# Plataforma de logística

Aplicación full stack para gestionar envíos, registrar su trazabilidad y proponer
una distribución por vehículos. El repositorio contiene una API REST en NestJS,
una SPA en Angular y PostgreSQL para la persistencia.

## Funcionalidad implementada

- Inicio de sesión con JWT y roles `OPERATOR` y `SUPERVISOR`.
- Alta de usuarios, restringida a supervisores.
- Alta, listado paginado, filtro por estado, detalle, cambio de estado y
  cancelación de envíos.
- Historial de eventos por envío, con ubicación y notas opcionales.
- Consulta pública mediante códigos `ENV-YYYYMMDD-XXXX`.
- Asignación no persistente de envíos a vehículos mediante First Fit Decreasing
  (FFD), restringida a supervisores.
- Dashboard de supervisor, exportación CSV de la página visible y una interfaz
  adaptable construida con Angular Material.
- Documentación OpenAPI interactiva generada con Swagger.

## Tecnologías

| Capa | Implementación |
| --- | --- |
| API | NestJS 12, TypeScript, class-validator, JWT y bcryptjs |
| Datos | PostgreSQL 16, Prisma 7 y adaptador `@prisma/adapter-pg` |
| Web | Angular 21, Angular Material/CDK, RxJS y formularios reactivos |
| Pruebas | Jest/Supertest en backend y Vitest mediante Angular CLI en frontend |
| Entorno local | Docker Compose para PostgreSQL |

## Estructura

```text
.
├── backend/            # API, dominio, Prisma, migraciones y pruebas
├── frontend/           # SPA Angular y pruebas
└── docker-compose.yml  # PostgreSQL 16
```

La API separa controladores, casos de uso, entidades y contratos de repositorio;
las implementaciones de persistencia están en `infrastructure`. El frontend
organiza autenticación y servicios en `core`, modelos compartidos en `shared` y
pantallas cargadas de forma diferida en `features`.

## Puesta en marcha

### Requisitos

- Node.js y npm compatibles con las dependencias bloqueadas de cada proyecto.
- Docker con Docker Compose, o una instancia PostgreSQL accesible.

### 1. Base de datos

Desde la raíz:

```bash
docker compose up -d postgres
```

El Compose publicado expone PostgreSQL en `localhost:5432`, con usuario
`logistics`, contraseña `logistics_dev` y base `logistics_db`.

### 2. Backend

```bash
cd backend
npm install
```

Crear `backend/.env`:

```dotenv
DATABASE_URL=postgresql://logistics:logistics_dev@localhost:5432/logistics_db?schema=public
JWT_SECRET=cambie-este-valor-por-un-secreto-largo-y-aleatorio

# Opcionales:
PORT=3000
CORS_ORIGINS=http://localhost:4200

# Requeridas únicamente por npm run seed:supervisor:
SUPERVISOR_NAME=Supervisor local
SUPERVISOR_EMAIL=supervisor@example.com
SUPERVISOR_PASSWORD=una-clave-de-al-menos-8-caracteres
```

`CORS_ORIGINS` admite una lista separada por comas. Si se omite, la API permite
`http://localhost:4200`. A continuación se generan los artefactos Prisma, se
aplican las migraciones incluidas y se crea el primer supervisor:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed:supervisor
npm run start:dev
```

El seed es idempotente por correo: no modifica un supervisor existente y falla
si ese correo pertenece a un operador.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

- Aplicación: <http://localhost:4200>
- API: <http://localhost:3000>
- Swagger UI: <http://localhost:3000/docs>

La URL de la API del frontend está implementada como
`http://localhost:3000` en
`frontend/src/app/core/services/api.config.ts`; no existe una variable de
entorno de frontend.

## Roles y flujo de estados

Ambos roles pueden crear, listar, consultar, actualizar y cancelar envíos. Solo
`SUPERVISOR` puede registrar usuarios, abrir el dashboard y solicitar la
asignación de vehículos. El tracking por código no requiere autenticación.

Las transiciones aceptadas por `PATCH /shipments/:id/status` son:

```text
CREATED ───────────────► IN_WAREHOUSE ─► IN_TRANSIT ─► OUT_FOR_DELIVERY ─► DELIVERED
   └─► CANCELLED              └─► CANCELLED    ├─► RETURNED       ├─► RETURNED
                                                └─► CANCELLED      └─► CANCELLED
```

`DELIVERED`, `RETURNED` y `CANCELLED` no tienen transiciones posteriores por
ese endpoint. La operación dedicada `DELETE /shipments/:id` rechaza únicamente
envíos entregados y registra un evento `CANCELLED`.

## First Fit Decreasing (FFD)

La asignación recibe IDs de envíos que estén en `IN_WAREHOUSE` y una capacidad
común por vehículo. Su funcionamiento real es:

1. Copia y ordena los envíos de mayor a menor peso.
2. Para cada envío, recorre los vehículos ya abiertos en su orden de creación.
3. Lo coloca en el primer vehículo cuya capacidad restante sea suficiente.
4. Si ninguno sirve, abre un vehículo nuevo y coloca allí el envío.
5. Devuelve cada carga, su peso total, capacidad restante, número total de
   vehículos y peso global.

Por ejemplo, para pesos `7`, `5.5` y `3.5` con capacidad `10`, crea un vehículo
con `7` y otro con `5.5 + 3.5`. La ordenación cuesta `O(n log n)` y la búsqueda
lineal de hueco puede llevar el total a `O(n²)` en el peor caso. FFD es una
heurística de *bin packing*: produce rápidamente una asignación válida, pero no
garantiza el mínimo global de vehículos. El resultado actual es una propuesta;
no crea ni actualiza registros `Vehicle`.

## API

Resumen (los endpoints marcados con JWT esperan
`Authorization: Bearer <token>`):

| Método | Ruta | Acceso | Uso |
| --- | --- | --- | --- |
| `GET` | `/` | Público | Comprobación simple: `Hello World!` |
| `POST` | `/auth/login` | Público | Autenticación y token válido durante 1 hora |
| `POST` | `/auth/register` | Supervisor | Alta de operador o supervisor |
| `POST` | `/shipments` | JWT | Crear envío y primer evento |
| `GET` | `/shipments` | JWT | Listar por `page`, `limit` y `status` |
| `GET` | `/shipments/:id` | JWT | Obtener envío e historial |
| `PATCH` | `/shipments/:id/status` | JWT | Cambiar estado y añadir evento |
| `DELETE` | `/shipments/:id` | JWT | Cancelar y añadir evento |
| `POST` | `/shipments/assign-vehicles` | Supervisor | Calcular asignación FFD |
| `GET` | `/tracking/:trackingCode` | Público | Tracking e historial |

Los cuerpos, respuestas y validaciones se detallan en
[`backend/README.md`](backend/README.md).

## Pruebas y calidad

```bash
cd backend
npm run lint
npm run test
npm run test:e2e
npm run test:cov
npm run build

cd ../frontend
npm test
npm run build
```

El E2E del backend arranca `AppModule`, por lo que requiere `DATABASE_URL` y
`JWT_SECRET`, además de PostgreSQL disponible. No hay un script E2E separado en
el frontend.

## Extras implementados

- Swagger UI con autenticación Bearer.
- CORS configurable para uno o varios orígenes.
- Seed seguro e idempotente del primer supervisor.
- Historial público y privado de estados.
- Dashboard por estados para la página consultada.
- Exportación CSV de la página actual con mitigación de fórmulas de hoja de
  cálculo.
- Guards de autenticación/rol, interceptor JWT y manejo global de errores.
- Diseño adaptable con navegación específica para supervisores.

Consulte [`backend/README.md`](backend/README.md) y
[`frontend/README.md`](frontend/README.md) para la referencia de cada proyecto.
