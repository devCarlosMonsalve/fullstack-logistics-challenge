# Frontend de logística

SPA en Angular 21 para operar envíos y consultar su trazabilidad. Está
implementada con componentes standalone cargados de forma diferida, Angular
Material/CDK, formularios reactivos, signals, RxJS y `HttpClient`.

## Configuración

```bash
npm install
npm start
```

La aplicación queda disponible en <http://localhost:4200>. La API debe estar en
<http://localhost:3000> y permitir ese origen por CORS.

La URL está definida directamente en:

```ts
// src/app/core/services/api.config.ts
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
};
```

No hay archivos ni sustituciones de entorno configurados en `angular.json`.
Para apuntar a otra API se debe cambiar ese valor y volver a servir o compilar
la aplicación.

## Scripts disponibles

| Comando | Acción |
| --- | --- |
| `npm start` | Servidor de desarrollo (`ng serve`) |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run watch` | Compilación development en observación |
| `npm test` | Pruebas unitarias con el runner Angular/Vitest |
| `npm run ng -- <argumentos>` | Ejecuta Angular CLI |

No existen scripts de lint ni E2E en este proyecto.

## Rutas y acceso

| Ruta | Acceso | Pantalla |
| --- | --- | --- |
| `/login` | Público | Inicio de sesión |
| `/tracking/:trackingCode` | Público | Consulta de envío e historial |
| `/shipments` | Autenticado | Tabla, filtro, paginación y exportación CSV |
| `/shipments/create` | Autenticado | Alta de envío |
| `/shipments/:id` | Autenticado | Detalle, historial, estado y cancelación |
| `/dashboard` | Supervisor | Total y conteos por estado de la página consultada |
| `/shipments/vehicle-assignment` | Supervisor | Formulario y resultado FFD |
| `/register` | Supervisor | Alta de usuarios y selección de rol |

La ruta vacía y las desconocidas redirigen a `/login`. El guard de
autenticación conserva una `returnUrl` interna; el guard de supervisor redirige
operadores a `/shipments`.

## Autenticación y comunicación HTTP

Tras `POST /auth/login`, se guardan `access_token` y `current_user` en
`localStorage`. El usuario almacenado se valida antes de usarlo; cerrar sesión o
recibir un `401` elimina ambos valores. El interceptor de autenticación añade
`Authorization: Bearer <token>` solamente a:

- `/auth/register`
- `/shipments`
- cualquier subruta de `/shipments/`

No añade el token al login, al tracking público ni a hosts externos. Otro
interceptor muestra los errores HTTP mediante `MatSnackBar` y redirige al login
en `401`. Los guards del cliente mejoran la navegación, pero la autorización
efectiva también se aplica en la API.

## Funcionalidad implementada

### Login y usuarios

- Formulario reactivo de correo y contraseña.
- Persistencia local de token y usuario autenticado.
- Registro de `OPERATOR` o `SUPERVISOR`, visible solo para supervisores.
- La pantalla de registro exige nombre de 2 a 100 caracteres y contraseña de 8
  a 128; son validaciones adicionales del cliente.

### Envíos

- Creación con origen, destino, destinatario, teléfono opcional y peso
  no negativo.
- Listado paginado con tamaños 5, 10, 25 o 50 y filtro por todos los estados.
- Exportación CSV únicamente de la página cargada. Todas las celdas se citan y
  los prefijos interpretables como fórmula (`=`, `+`, `-`, `@`, tabulador o
  retorno) se neutralizan.
- Detalle con datos del envío y timeline cronológico.
- Cambio de estado limitado en la UI al mismo flujo de transiciones de la API,
  con ubicación y notas opcionales.
- Cancelación disponible en la UI salvo para `DELIVERED` y `CANCELLED`.

### Tracking público

La ruta acepta códigos con formato `ENV-YYYYMMDD-XXXX`, los normaliza a
mayúsculas y muestra datos del envío, estado actual e historial cronológico. No
requiere una sesión.

### Dashboard

Solicita la primera página con límite 50. Muestra el total informado por la API
y los conteos de estado de esos envíos cargados; la interfaz aclara que esos
conteos no representan páginas que no se hayan consultado.

### Asignación de vehículos

El supervisor introduce UUID v4 separados por comas o líneas y una capacidad
positiva. Los IDs repetidos se eliminan antes de llamar a
`POST /shipments/assign-vehicles`. La vista presenta vehículos usados, peso
global, carga y capacidad restante por vehículo. El cálculo lo realiza el
backend con First Fit Decreasing y no se persiste.

## Contratos consumidos

El frontend usa los siguientes endpoints:

| Método | Endpoint | Respuesta esperada |
| --- | --- | --- |
| `POST` | `/auth/login` | `{ accessToken, user }` |
| `POST` | `/auth/register` | sin cuerpo |
| `POST` | `/shipments` | `Shipment` |
| `GET` | `/shipments?page=&limit=&status=` | `{ data, total, page, limit }` |
| `GET` | `/shipments/:id` | `{ shipment, events }` |
| `PATCH` | `/shipments/:id/status` | `Shipment` |
| `DELETE` | `/shipments/:id` | `Shipment` cancelado |
| `POST` | `/shipments/assign-vehicles` | `{ vehicles, totalVehiclesUsed, totalWeight }` |
| `GET` | `/tracking/:trackingCode` | `{ shipment, events }` |

Los modelos completos están en `src/app/shared/models/`. La referencia del
servidor, validaciones y estados se encuentra en
[`../backend/README.md`](../backend/README.md).

## Organización

```text
src/app/
├── core/
│   ├── auth/          # sesión y peticiones de autenticación
│   ├── guards/        # autenticación y rol
│   ├── interceptors/  # Bearer y errores HTTP
│   └── services/      # API de envíos y tracking
├── features/          # pantallas de auth, dashboard, envíos y tracking
└── shared/
    ├── components/    # estado de contenido reutilizable
    └── models/        # contratos TypeScript
```

El shell autenticado usa toolbar y sidenav adaptables; el menú administrativo
solo aparece para supervisores. La aplicación utiliza el tema Material 3 claro.

## Pruebas

```bash
npm test
npm run build
```

Las pruebas existentes verifican creación de componentes, sesión válida y datos
locales malformados, registro sin crear sesión, guards, inclusión selectiva del
Bearer, query params y URLs codificadas del servicio de envíos, petición FFD,
peso cero/no negativo y validación UUID v4.

## Extras implementados

- Carga diferida de todas las pantallas.
- Navegación adaptable para escritorio y móvil.
- Dashboard de supervisor.
- Tracking público con timeline.
- Exportación CSV segura de la página actual.
- Estados de carga, vacío, error y reintento en los flujos principales.
