# iCoWork (iCW)

Aplicación web para la gestión de espacios de coworking. Permite a empresas y autónomos reservar puestos de trabajo, salas de juntas y otros espacios, con disponibilidad en tiempo real, lista de espera, notificaciones automáticas y gestión de pagos.

---

## Tecnologías utilizadas

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20+ | Entorno de ejecución |
| NestJS | 11 | Framework principal |
| TypeORM | 0.3+ | ORM para base de datos |
| MySQL | 8 | Base de datos relacional |
| JWT | — | Autenticación stateless |
| Passport | — | Estrategias de autenticación |
| bcrypt | — | Hash de contraseñas |
| Socket.io | — | Comunicación en tiempo real |
| class-validator | — | Validación de DTOs |

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| Vue.js | 3 | Framework principal |
| Vite | 7+ | Bundler y servidor de desarrollo |
| TypeScript | 5+ | Tipado estático |
| Vue Router | 5 | Navegación entre vistas |
| Axios | — | Comunicación con la API |
| Tailwind CSS | 4 | Estilos y diseño responsive |
| PrimeVue | 4 | Componentes UI |
| PrimeIcons | — | Iconografía |
| Chart.js | — | Gráficas y estadísticas |
| Socket.io Client | — | Eventos en tiempo real |

### Infraestructura

| Servicio | Uso |
|---|---|
| Railway | Hosting backend, frontend y base de datos |
| GitHub | Control de versiones |

---

## Estructura del proyecto

```
iCoWork/
├── database/
│   ├── icowork_schema.sql
│   └── icowork_datos.sql
├── backend/
│   └── src/
│       ├── auth/
│       ├── clientes/
│       ├── correo/
│       ├── dashboard/
│       ├── espacios/
│       ├── events/
│       ├── lista-espera/
│       ├── notificaciones/
│       ├── oficinas/
│       ├── pagos/
│       ├── planes/
│       ├── reservas/
│       ├── suscripciones/
│       └── usuarios/
└── frontend/
    └── src/
        ├── componentes/
        ├── composiciones/
        ├── diseños/
        ├── enrutador/
        ├── servicios/
        └── vistas/
```

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v20 o superior
- [npm](https://www.npmjs.com/) v10 o superior
- [MySQL](https://www.mysql.com/) v8 o superior
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
- [@nestjs/cli](https://docs.nestjs.com/cli/overview) instalado globalmente
- [Git](https://git-scm.com/)

---

## Instalación local

### 1. Clonar el repositorio
```bash
git clone https://github.com/MikAyo26/iCoWork.git
cd iCoWork
```

### 2. Configurar la base de datos

Abre MySQL Workbench y ejecuta los scripts en este orden:
database/icowork_schema.sql
database/icowork_datos.sql

> **Nota:** Si la tabla `planes` da error al arrancar el backend, ejecuta:
> ```sql
> ALTER TABLE planes ADD COLUMN creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
> ```

### 3. Instalar el CLI de NestJS
```bash
npm install -g @nestjs/cli
```

### 4. Configurar el Backend
```bash
cd backend
npm install --legacy-peer-deps
cp .env.example .env
```

Edita el archivo `.env` con tus valores y arranca el servidor:
```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3000/api`

### 5. Configurar el Frontend
```bash
cd ../frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## Variables de entorno

### Backend

Crea el archivo `.env` en la carpeta `backend/` a partir de `.env.example`. Nunca subas el `.env` real al repositorio.
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_NAME=icowork

# JWT
# Genera el secreto con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRETO=tu_secreto_generado
JWT_EXPIRA_EN=8h

# App
PUERTO=3000
```

### Frontend

Crea el archivo `.env` en la carpeta `frontend/` a partir de `.env.example`.
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Credenciales de prueba

Todos los usuarios tienen la contraseña: `Password1!`

> **Nota:** En una instalación nueva hay que regenerar los hashes:
> ```bash
> node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Password1!', 10).then(h => console.log(h))"
> ```
> Y actualizar en MySQL:
> ```sql
> UPDATE usuarios SET contrasena_hash = 'HASH_GENERADO' WHERE id IN (1,2,3,4,5,6,7,8,9,10,11,12,13);
> ```

| Correo | Rol | Descripción |
|---|---|---|
| admin@icowork.com | superadmin | Acceso total al sistema |
| laura.hernandez@tecatlantico.es | admin | Admin de Tec Atlántico |
| ayoze.pestano@icowork.com | admin | Admin interno iCoWork |
| pedro.gonzalez@tecatlantico.es | empleado | Empleado de Tec Atlántico |
| alitago@alitago.com | admin | Autónomo Ángel Luis Litago |

---

## Endpoints disponibles

### Autenticación — `/api/auth`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Iniciar sesión y obtener token JWT |
| GET | `/api/auth/perfil` | Todos | Obtener perfil del usuario autenticado |

### Clientes — `/api/clientes`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/clientes` | superadmin | Listar todos los clientes |
| GET | `/api/clientes/:id` | superadmin | Obtener un cliente por ID |
| POST | `/api/clientes` | superadmin | Crear un nuevo cliente |
| PATCH | `/api/clientes/:id` | superadmin | Actualizar un cliente |
| DELETE | `/api/clientes/:id` | superadmin | Eliminar un cliente |

### Usuarios — `/api/usuarios`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/usuarios` | superadmin, admin | Listar usuarios (admin: solo su cliente) |
| GET | `/api/usuarios/:id` | superadmin, admin | Obtener un usuario por ID |
| POST | `/api/usuarios` | superadmin | Crear un nuevo usuario |
| PATCH | `/api/usuarios/:id` | superadmin | Actualizar un usuario |
| DELETE | `/api/usuarios/:id` | superadmin | Eliminar un usuario |

### Oficinas — `/api/oficinas`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/oficinas` | Todos | Listar todas las oficinas |
| GET | `/api/oficinas/activas` | Todos | Listar oficinas activas |
| GET | `/api/oficinas/:id` | Todos | Obtener una oficina por ID |
| POST | `/api/oficinas` | superadmin | Crear una nueva oficina |
| PATCH | `/api/oficinas/:id` | superadmin | Actualizar una oficina |
| DELETE | `/api/oficinas/:id` | superadmin | Desactivar una oficina (soft-delete) |

### Espacios — `/api/espacios`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/espacios` | Todos | Listar todos los espacios |
| GET | `/api/espacios/disponibilidad` | Todos | Consultar disponibilidad |
| GET | `/api/espacios/oficina/:id` | Todos | Espacios de una oficina |
| GET | `/api/espacios/:id` | Todos | Obtener un espacio por ID |
| POST | `/api/espacios` | superadmin | Crear un nuevo espacio |
| PATCH | `/api/espacios/:id` | superadmin | Actualizar un espacio |
| DELETE | `/api/espacios/:id` | superadmin | Eliminar un espacio |

### Reservas — `/api/reservas`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/reservas` | Todos | Crear una reserva (admite recurrencia) |
| GET | `/api/reservas/mis-reservas` | Todos | Reservas del usuario autenticado |
| GET | `/api/reservas/espacio/:id` | Todos | Reservas de un espacio |
| GET | `/api/reservas/cliente/:id` | superadmin, admin | Reservas de un cliente |
| PATCH | `/api/reservas/:id/cancelar` | Todos | Cancelar una reserva |
| PATCH | `/api/reservas/:id/cancelar-serie` | Todos | Cancelar toda la serie de reservas |

### Lista de espera — `/api/lista-espera`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/lista-espera` | Todos | Unirse a la lista de espera |
| GET | `/api/lista-espera/mia` | Todos | Lista de espera del usuario autenticado |
| DELETE | `/api/lista-espera/:id` | Todos | Salir de la lista de espera |

### Notificaciones — `/api/notificaciones`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/notificaciones` | Todos | Notificaciones del usuario autenticado |
| PATCH | `/api/notificaciones/:id/leer` | Todos | Marcar notificación como leída |
| PATCH | `/api/notificaciones/leer-todas` | Todos | Marcar todas como leídas |

### Planes — `/api/planes`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/planes` | Público | Listar planes activos |
| GET | `/api/planes/todos` | superadmin | Listar todos los planes (incluye inactivos) |
| POST | `/api/planes` | superadmin | Crear un nuevo plan |
| PATCH | `/api/planes/:id` | superadmin | Actualizar un plan |
| DELETE | `/api/planes/:id` | superadmin | Desactivar un plan |

### Suscripciones — `/api/suscripciones`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/suscripciones` | superadmin | Listar todas las suscripciones |
| GET | `/api/suscripciones/cliente/:id` | superadmin, admin | Suscripciones de un cliente |
| POST | `/api/suscripciones` | superadmin | Crear una suscripción |
| PATCH | `/api/suscripciones/:id/cancelar` | superadmin | Cancelar una suscripción |

### Pagos — `/api/pagos`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| POST | `/api/pagos` | superadmin, admin | Registrar un pago |
| PATCH | `/api/pagos/:id/confirmar` | superadmin | Confirmar un pago |
| GET | `/api/pagos/mis-pagos` | Todos | Pagos del usuario autenticado |
| GET | `/api/pagos/cliente/:id/estadisticas` | superadmin, admin | Estadísticas de pagos |

### Dashboard — `/api/dashboard`

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| GET | `/api/dashboard/cliente/:id` | superadmin, admin | Resumen de espacios del cliente |
| GET | `/api/dashboard/global` | superadmin | Ocupación global por cliente |
| GET | `/api/dashboard/horas-pico` | superadmin | Franjas horarias más solicitadas |
| GET | `/api/dashboard/cliente/:id/asistencia` | superadmin, admin | Asistencia de empleados |
| GET | `/api/dashboard/cliente/:id/exportar` | superadmin, admin | Exportar datos en CSV |

---

## Módulos backend implementados

- [x] auth — Autenticación JWT + Passport
- [x] clientes — Gestión de clientes
- [x] usuarios — Gestión de usuarios con roles
- [x] oficinas — Gestión de oficinas (soft-delete)
- [x] espacios — Gestión de espacios por oficina
- [x] reservas — Reservas con recurrencia diaria/semanal/mensual
- [x] lista-espera — Lista de espera con notificación automática
- [x] notificaciones — Notificaciones automáticas en BD
- [x] planes — Planes de suscripción
- [x] suscripciones — Suscripciones de clientes con límite de usuarios
- [x] pagos — Gestión de pagos con email de confirmación
- [x] correo — Envío de emails automáticos
- [x] dashboard — Estadísticas y métricas de ocupación
- [x] events — WebSockets en tiempo real (Socket.io)

---

## Vistas frontend implementadas

| Vista | Ruta | Roles | Descripción |
|---|---|---|---|
| LoginVista | `/login` | Público | Autenticación con JWT |
| DashboardVista | `/dashboard` | Todos | Resumen y métricas principales |
| PerfilVista | `/perfil` | Todos | Datos de la cuenta y cierre de sesión |
| ReservasVista | `/reservas` | Todos | Listado y gestión de reservas propias |
| EspaciosVista | `/espacios` | Todos | Disponibilidad de espacios en tiempo real |
| ListaEsperaVista | `/lista-espera` | Todos | Lista de espera por espacio y fecha |
| NotificacionesVista | `/notificaciones` | Todos | Notificaciones con filtros y tiempo real |
| UsuariosVista | `/usuarios` | superadmin, admin | Gestión de usuarios del sistema |
| PagosVista | `/pagos` | superadmin, admin | Historial de pagos y estadísticas |
| EstadisticasVista | `/estadisticas` | superadmin, admin | Gráficas de ocupación y asistencia |
| ClientesVista | `/clientes` | superadmin | Gestión de clientes |
| OficinasVista | `/oficinas` | superadmin | Gestión de oficinas |
| PlanesVista | `/planes` | superadmin | Gestión de planes y suscripciones |

---

## WebSockets

El servidor expone un namespace `/ws` autenticado con JWT. Eventos disponibles:

| Evento | Dirección | Descripción |
|---|---|---|
| `espacio:suscribir` | Cliente → Servidor | Suscribirse a actualizaciones de un espacio |
| `disponibilidad:cambio` | Servidor → Cliente | Notifica cambio de disponibilidad de un espacio |
| `espera:disponible` | Servidor → Cliente | Notifica al usuario que un espacio de su lista de espera está libre |

---

## Roles y permisos

| Rol | Acceso |
|---|---|
| `superadmin` | Acceso total al sistema |
| `admin` | Gestión de su cliente: usuarios, pagos, estadísticas |
| `empleado` | Reservas, espacios, lista de espera y notificaciones propias |

---

## Autores

- Juan José De Abreu Alvarez
- Ayoze Pestano De la Rosa

**Tutor:** José David Díaz Díaz  
**Centro:** C.I.F.P. Cesar Manrique — C.F.G.S. Desarrollo de Aplicaciones Web