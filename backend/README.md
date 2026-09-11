# Backend de logística

API REST en NestJS 12 y TypeScript para autenticación, gestión de envíos,
trazabilidad y asignación de carga. Usa PostgreSQL mediante Prisma 7.

## Arquitectura implementada

```text
src/
├── common/filters/                  # Formato global de errores HTTP
├── infrastructure/prisma/          # Cliente y módulo Prisma
└── modules/
    ├── auth/                        # Login, registro, JWT y roles
    ├── users/                       # Entidad, repositorio y bcrypt
    └── shipments/
        ├── application/             # DTO y casos de uso
        ├── domain/                  # Entidades, estados, repositorios y FFD
        └── infrastructure/          # Repositorios y mappers Prisma
prisma/
├── migrations/
├── schema.prisma
└── seed.ts
```

Los repositorios del dominio se inyectan mediante símbolos y se implementan con
Prisma. Las contraseñas se almacenan con bcrypt. Los JWT incluyen `sub`,
`email` y `role`, y caducan en una hora.

## Requisitos y configuración

Instalar dependencias:

```bash
npm install
```

Crear `.env` en este directorio:

```dotenv
# Obligatoria para Prisma y la aplicación:
DATABASE_URL=postgresql://logistics:logistics_dev@localhost:5432/logistics_db?schema=public

# Obligatoria al iniciar la aplicación:
JWT_SECRET=cambie-este-valor-por-un-secreto-largo-y-aleatorio

# Opcionales:
PORT=3000
CORS_ORIGINS=http://localhost:4200

# Obligatorias solo al ejecutar el seed:
SUPERVISOR_NAME=Supervisor local
SUPERVISOR_EMAIL=supervisor@example.com
SUPERVISOR_PASSWORD=una-clave-de-al-menos-8-caracteres
```

`PORT` usa `3000` por defecto. `CORS_ORIGINS` acepta orígenes separados por
comas, elimina espacios y usa `http://localhost:4200` por defecto. El repositorio
raíz incluye un servicio PostgreSQL 16:

```bash
docker compose up -d postgres
```

Desde `backend`, preparar Prisma y el supervisor inicial:

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed:supervisor
```

El seed normaliza el correo a minúsculas, exige nombre no vacío, correo válido y
contraseña de al menos 8 caracteres. Si ya existe un supervisor con ese correo
no hace cambios; si existe un operador, falla sin promocionarlo.

## Scripts disponibles

| Comando | Acción |
| --- | --- |
| `npm run start` | Inicia Nest una vez |
| `npm run start:dev` | Desarrollo con recarga |
| `npm run start:debug` | Recarga con depurador |
| `npm run build` | Compila con Nest |
| `npm run start:prod` | Ejecuta `dist/main` ya compilado |
| `npm run lint` | Ejecuta Oxlint sobre `src/` y `test/` |
| `npm run format` | Formatea TypeScript con Prettier |
| `npm run test` | Pruebas unitarias Jest |
| `npm run test:watch` | Jest en modo observación |
| `npm run test:cov` | Jest con cobertura |
| `npm run test:e2e` | Prueba E2E configurada en `test/jest-e2e.json` |
| `npm run seed:supervisor` | Ejecuta el seed Prisma |

API local: <http://localhost:3000>. Swagger UI está realmente habilitado en
<http://localhost:3000/docs> y ofrece el esquema Bearer `access-token`.

## Convenciones HTTP

- Los endpoints protegidos requieren `Authorization: Bearer <token>`.
- El `ValidationPipe` transforma tipos, aplica una lista blanca de propiedades
  declaradas y rechaza cualquier propiedad adicional.
- Fechas de entidades y eventos se serializan como cadenas ISO 8601.
- Los pesos persistidos como `Decimal(10,2)` se devuelven como números.
- Los errores usan este contrato global:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descripción o lista de errores",
  "path": "/ruta",
  "timestamp": "2026-09-11T00:00:00.000Z"
}
```

## Endpoints y contratos

### Salud

#### `GET /`

Público. Devuelve texto plano:

```text
Hello World!
```

### Autenticación

#### `POST /auth/login`

Público.

```json
{
  "email": "supervisor@example.com",
  "password": "contraseña"
}
```

`email` debe ser válido y `password` una cadena no vacía. Respuesta:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "<uuid>",
    "name": "Supervisor local",
    "email": "supervisor@example.com",
    "role": "SUPERVISOR"
  }
}
```

Credenciales inexistentes o incorrectas producen `401`.

#### `POST /auth/register`

Requiere JWT y rol `SUPERVISOR`.

```json
{
  "name": "Operador uno",
  "email": "operador@example.com",
  "password": "contraseña",
  "role": "OPERATOR"
}
```

`name` y `password` deben ser cadenas no vacías, `email` debe ser válido y
`role` debe ser `OPERATOR` o `SUPERVISOR`. La API no aplica una longitud mínima
adicional a la contraseña de este endpoint. Responde `201` sin objeto de
respuesta; un correo duplicado produce `409`.

### Envíos

Todos los endpoints de esta sección requieren JWT.

#### `POST /shipments`

```json
{
  "origin": "Madrid",
  "destination": "Barcelona",
  "recipient": "Ana Pérez",
  "phone": "600123456",
  "weight": 5.5
}
```

`origin`, `destination` y `recipient` son cadenas no vacías; `phone` es una
cadena opcional y `weight` es un número mayor o igual a cero. Crea el envío en
`CREATED`, genera un código `ENV-YYYYMMDD-XXXX`, registra su primer evento y
devuelve el envío (`201`):

```json
{
  "id": "<uuid>",
  "trackingCode": "ENV-20260911-A1B2",
  "origin": "Madrid",
  "destination": "Barcelona",
  "recipient": "Ana Pérez",
  "phone": "600123456",
  "weight": 5.5,
  "status": "CREATED",
  "deliveredAt": null,
  "createdById": "<uuid>",
  "createdAt": "<fecha ISO>",
  "updatedAt": "<fecha ISO>"
}
```

#### `GET /shipments`

Parámetros query opcionales:

| Parámetro | Regla | Predeterminado |
| --- | --- | --- |
| `page` | entero `>= 1` | `1` |
| `limit` | entero `>= 1` | `10` |
| `status` | uno de los estados admitidos | sin filtro |

Se ordena por creación descendente:

```json
{
  "data": ["<envío>"],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### `GET /shipments/:id`

Devuelve el envío y sus eventos en orden cronológico:

```json
{
  "shipment": "<envío>",
  "events": [
    {
      "id": "<uuid>",
      "shipmentId": "<uuid>",
      "status": "CREATED",
      "timestamp": "<fecha ISO>",
      "userId": "<uuid>",
      "location": null,
      "notes": null
    }
  ]
}
```

Un ID no encontrado produce `404`.

#### `PATCH /shipments/:id/status`

```json
{
  "status": "IN_TRANSIT",
  "location": "Centro Madrid",
  "notes": "Carga verificada"
}
```

`status` es obligatorio; `location` y `notes` son cadenas opcionales. Actualiza
el envío, registra un evento y, al llegar a `DELIVERED`, asigna `deliveredAt`.

| Estado actual | Siguientes estados admitidos |
| --- | --- |
| `CREATED` | `IN_WAREHOUSE`, `CANCELLED` |
| `IN_WAREHOUSE` | `IN_TRANSIT`, `CANCELLED` |
| `IN_TRANSIT` | `OUT_FOR_DELIVERY`, `RETURNED`, `CANCELLED` |
| `OUT_FOR_DELIVERY` | `DELIVERED`, `RETURNED`, `CANCELLED` |
| `DELIVERED` | ninguno |
| `RETURNED` | ninguno |
| `CANCELLED` | ninguno |

Una transición no admitida produce `400`; un envío inexistente, `404`.

#### `DELETE /shipments/:id`

Cambia el estado a `CANCELLED`, actualiza el envío y registra un evento.
Devuelve el envío actualizado. La implementación rechaza con `400` únicamente
si el estado actual es `DELIVERED`; un ID inexistente produce `404`.

#### `POST /shipments/assign-vehicles`

Requiere además rol `SUPERVISOR`.

```json
{
  "shipmentIds": [
    "5cc70dd4-0018-45b1-8d89-31982b075508",
    "c0895640-85f8-460e-9bcb-d1db595264ec"
  ],
  "vehicleCapacity": 10
}
```

`shipmentIds` debe ser un arreglo de UUID v4 y `vehicleCapacity` un número
`>= 0.01`. Cada envío debe existir, estar en `IN_WAREHOUSE` y no exceder la
capacidad. La respuesta es:

```json
{
  "vehicles": [
    {
      "vehicleNumber": 1,
      "shipments": [
        {
          "shipmentId": "<uuid>",
          "trackingCode": "ENV-20260911-A1B2",
          "weight": 7
        }
      ],
      "totalWeight": 7,
      "remainingCapacity": 3
    }
  ],
  "totalVehiclesUsed": 1,
  "totalWeight": 7
}
```

El cálculo no persiste vehículos ni asignaciones.

### Tracking público

#### `GET /tracking/:trackingCode`

No requiere JWT. Busca el código exactamente como se recibe y devuelve el mismo
contrato `{ shipment, events }` del detalle autenticado. Un código inexistente
produce `404`.

## First Fit Decreasing

`FirstFitDecreasingService` copia y ordena los envíos por peso descendente.
Después recorre cada envío y lo añade al primer vehículo abierto con capacidad
restante suficiente; si no encuentra uno, abre el siguiente vehículo. En cada
paso actualiza `totalWeight` y `remainingCapacity`.

Con capacidad `10` y pesos `7`, `5.5`, `3.5`, el resultado es `[7]` y
`[5.5, 3.5]`. La ordenación cuesta `O(n log n)`; el recorrido de vehículos puede
elevar el coste total a `O(n²)`, y se conserva `O(n)` de salida. Es una
heurística de *bin packing*, por lo que no garantiza una solución óptima global.

## Persistencia

El esquema contiene:

- `User`: correo único, hash, rol y marcas de tiempo.
- `Shipment`: código único, datos de ruta/destinatario, peso, estado,
  `deliveredAt` y creador.
- `ShipmentEvent`: estado, fecha, usuario, ubicación y notas.
- `Vehicle`: capacidad y fecha de creación; el flujo FFD actual no lo utiliza.

Los estados son `CREATED`, `IN_WAREHOUSE`, `IN_TRANSIT`,
`OUT_FOR_DELIVERY`, `DELIVERED`, `RETURNED` y `CANCELLED`.

## Pruebas

```bash
npm run lint
npm run test
npm run test:cov
npm run test:e2e
npm run build
```

Las pruebas unitarias existentes cubren autenticación fallida, correo duplicado,
entidad de envío, transición y evento, cancelación, FFD y protección del
endpoint de asignación. La prueba E2E comprueba `GET /`; como carga
`AppModule`, necesita `DATABASE_URL`, `JWT_SECRET` y PostgreSQL disponible.

## Extras implementados

- Swagger/OpenAPI en `/docs`.
- CORS multi-origen configurable.
- Seed idempotente de supervisor.
- Filtro global con respuesta de error uniforme.
- Tracking público con historial.
- FFD con validación de estado, existencia, peso y rol.
