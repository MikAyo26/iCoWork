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
| Vite | 5+ | Bundler y servidor de desarrollo |
| TypeScript | 5+ | Tipado estático |
| Vue Router | 4 | Navegación entre vistas |
| Axios | — | Comunicación con la API |
| Tailwind CSS | 4 | Estilos y diseño responsive |
| PrimeVue | 4 | Componentes UI |
| PrimeIcons | — | Iconografía |

### Infraestructura

| Servicio | Uso |
|---|---|
| Railway | Hosting backend, frontend y base de datos |
| GitHub | Control de versiones |

---

## Estructura del proyecto
```
iCoWork/
├── db/
│   ├── icowork_schema.sql
│   └── icowork_datos.sql
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── clientes/
│   │   ├── correo/
│   │   ├── dashboard/
│   │   ├── espacios/
│   │   ├── events/
│   │   ├── lista-espera/
│   │   ├── notificaciones/
│   │   ├── oficinas/
│   │   ├── pagos/
│   │   ├── planes/
│   │   ├── reservas/
│   │   ├── suscripciones/
│   │   ├── usuarios/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── componentes/
│   │   ├── diseños/
│   │   ├── enrutador/
│   │   │   └── index.ts
│   │   ├── servicios/
│   │   │   ├── axios.ts
│   │   │   └── autenticacion.ts
│   │   ├── vistas/
│   │   │   ├── LoginVista.vue
│   │   │   └── DashboardVista.vue
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css
│   ├── public/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v20 o superior
- [npm](https://www.npmjs.com/) v10 o superior
- [MySQL](https://www.mysql.com/) v8 o superior
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
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
```
1. db/icowork_schema.sql
2. db/icowork_datos.sql
```

### 3. Configurar el Backend
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

### 4. Configurar el Frontend
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

## Endpoints disponibles

### Autenticación — `/api/auth`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión y obtener token JWT |
| GET | `/api/auth/perfil` | Obtener perfil del usuario autenticado |

### Clientes — `/api/clientes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes` | Listar todos los clientes |
| GET | `/api/clientes/:id` | Obtener un cliente por ID |
| POST | `/api/clientes` | Crear un nuevo cliente |
| PATCH | `/api/clientes/:id` | Actualizar un cliente |
| DELETE | `/api/clientes/:id` | Eliminar un cliente |

### Usuarios — `/api/usuarios`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Listar todos los usuarios |
| GET | `/api/usuarios/:id` | Obtener un usuario por ID |
| POST | `/api/usuarios` | Crear un nuevo usuario |
| PATCH | `/api/usuarios/:id` | Actualizar un usuario |
| DELETE | `/api/usuarios/:id` | Eliminar un usuario |

---

## Módulos backend implementados

- [x] auth — Autenticación JWT
- [x] clientes — Gestión de clientes
- [x] usuarios — Gestión de usuarios
- [x] oficinas — Gestión de oficinas
- [x] espacios — Gestión de espacios
- [x] reservas — Gestión de reservas con recurrencia
- [x] lista-espera — Lista de espera en tiempo real
- [x] notificaciones — Notificaciones automáticas
- [x] planes — Planes de suscripción
- [x] suscripciones — Suscripciones de clientes
- [x] pagos — Gestión de pagos
- [x] correo — Envío de emails automáticos
- [x] dashboard — Estadísticas y métricas
- [x] events — WebSockets en tiempo real

## Vistas frontend implementadas

- [x] LoginVista — Autenticación con JWT, validación de formulario y redirección
- [ ] DashboardVista — En construcción
- [ ] EspaciosVista — Pendiente
- [ ] ReservasVista — Pendiente
- [ ] NotificacionesVista — Pendiente
- [ ] PerfilVista — Pendiente

---

## Autores

- Juan José De Abreu Alvarez
- Ayoze Pestano De la Rosa

**Tutor:** José David Díaz Díaz  
**Centro:** C.I.F.P. Cesar Manrique — C.F.G.S. Desarrollo de Aplicaciones Web