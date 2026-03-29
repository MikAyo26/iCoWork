iCoWork (iCW)
Aplicación web para la gestión de espacios de coworking. Permite a empresas y autónomos reservar puestos de trabajo, salas de juntas y otros espacios, con disponibilidad en tiempo real, lista de espera, notificaciones automáticas y gestión de pagos.

Tecnologías utilizadas
Backend
TecnologíaVersiónUsoNode.js20+Entorno de ejecuciónNestJS11Framework principalTypeORM0.3+ORM para base de datosMySQL8Base de datos relacionalJWT—Autenticación statelessPassport—Estrategias de autenticaciónbcrypt—Hash de contraseñasSocket.io—Comunicación en tiempo realclass-validator—Validación de DTOs
Frontend
TecnologíaUsoVue.jsFramework principalViteBundler y servidor de desarrolloTypeScriptTipado estáticoAxiosComunicación con la API
Infraestructura
ServicioUsoRailwayHosting backend, frontend y base de datosGitHubControl de versiones

Estructura del proyecto
iCoWork/
├── database/
│   ├── icowork_schema.sql        ← Estructura de las 10 tablas
│   └── icowork_datos.sql         ← Datos de prueba
│
├── backend/
│   ├── src/
│   │   ├── clientes/
│   │   │   ├── dto/
│   │   │   │   ├── crear-cliente.dto.ts
│   │   │   │   └── actualizar-cliente.dto.ts
│   │   │   ├── entidades/
│   │   │   │   └── cliente.entidad.ts
│   │   │   ├── clientes.controller.ts
│   │   │   ├── clientes.service.ts
│   │   │   └── clientes.module.ts
│   │   ├── usuarios/
│   │   │   ├── dto/
│   │   │   │   ├── crear-usuario.dto.ts
│   │   │   │   └── actualizar-usuario.dto.ts
│   │   │   ├── entidades/
│   │   │   │   └── usuario.entidad.ts
│   │   │   ├── usuarios.controller.ts
│   │   │   ├── usuarios.service.ts
│   │   │   └── usuarios.module.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test/
│   ├── .env.example
│   ├── .gitignore
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   ├── env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitattributes
├── .gitignore
└── README.md

Requisitos previos
Antes de instalar el proyecto asegúrate de tener instalado:

Node.js v20 o superior
npm v10 o superior
MySQL v8 o superior
MySQL Workbench (recomendado para gestionar la BD)
Git


Instalación local
1. Clonar el repositorio
bashgit clone https://github.com/MikAyo/iCoWork.git
cd icowork
2. Configurar la base de datos
Abre MySQL Workbench y ejecuta los scripts en este orden:
1. database/icowork_schema.sql   ← crea la base de datos y las tablas
2. database/icowork_datos.sql    ← inserta los datos de prueba
O desde la terminal:
bashmysql -u root -p < database/icowork_schema.sql
mysql -u root -p < database/icowork_datos.sql
3. Configurar el Backend
bashcd backend
npm install --legacy-peer-deps
Crea el archivo .env a partir del ejemplo:
bashcp .env.example .env
Edita .env con tus valores (ver sección de variables de entorno).
Arranca el servidor en modo desarrollo:
bashnpm run start:dev
El backend estará disponible en http://localhost:3000/api
4. Configurar el Frontend
bashcd ../frontend
npm install
npm run dev
El frontend estará disponible en http://localhost:5173 <- EN DESARROLLO!

Variables de entorno
El archivo .env debe crearse en la carpeta backend/ a partir de .env.example. Nunca subas el .env real al repositorio.
env# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu usuario
DB_PASSWORD=tu password
DB_NAME=icowork

# JWT — genera un secreto seguro con el siguiente comando:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRETO=tu_secreto_generado
JWT_EXPIRA_EN=8h

# App
PUERTO=3000

Endpoints disponibles
Clientes — /api/clientes
MétodoRutaDescripciónGET/api/clientesListar todos los clientesGET/api/clientes/:idObtener un cliente por IDPOST/api/clientesCrear un nuevo clientePATCH/api/clientes/:idActualizar un clienteDELETE/api/clientes/:idEliminar un cliente
Usuarios — /api/usuarios
MétodoRutaDescripciónGET/api/usuariosListar todos los usuariosGET/api/usuarios/:idObtener un usuario por IDPOST/api/usuariosCrear un nuevo usuarioPATCH/api/usuarios/:idActualizar un usuarioDELETE/api/usuarios/:idEliminar un usuario

Módulos implementados

 auth — Autenticación JWT
 clientes — Gestión de clientes
 usuarios — Gestión de usuarios
 oficinas — Gestión de oficinas
 espacios — Gestión de espacios
 reservas — Gestión de reservas con recurrencia
 lista-espera — Lista de espera en tiempo real
 notificaciones — Notificaciones automáticas
 planes — Planes de suscripción
 suscripciones — Suscripciones de clientes
 pagos — Gestión de pagos
 correo — Envío de emails automáticos
 dashboard — Estadísticas y métricas
 events — WebSockets en tiempo real


Autores

Juan José De Abreu Alvarez
Ayoze Pestano De la Rosa

Tutor: José David Díaz Díaz
Centro: C.I.F.P. Cesar Manrique — C.F.G.S. Desarrollo de Aplicaciones Web