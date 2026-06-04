# 🏋️‍♂️ Athletia Backend API

**Athletia** es una plataforma integral para atletas que permite el seguimiento de entrenamientos, nutrición, calidad del sueño y prevención de lesiones. Este repositorio contiene el código fuente del **Backend**, construido bajo los principios de **Clean Architecture** para garantizar escalabilidad, mantenibilidad e independencia de frameworks.

---

## 🛠️ Tecnologías Utilizadas

- **Entorno:** Node.js
- **Lenguaje:** TypeScript
- **Framework Web:** Express.js
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma
- **Seguridad:** JWT (JSON Web Tokens), Bcrypt para hash de contraseñas
- **Validaciones:** Zod

---

## 🏗️ Arquitectura (Clean Architecture)

El proyecto está rigurosamente dividido en 4 capas principales para separar la lógica de negocio de los detalles de infraestructura:

1. **Domain (`src/domain/`)**: Entidades centrales (`User`, `Workout`, etc.) e interfaces de los repositorios. No tiene dependencias externas.
2. **Application (`src/application/`)**: Casos de uso (Use Cases) y DTOs (Data Transfer Objects). Orquesta la lógica del negocio.
3. **Infrastructure (`src/infrastructure/`)**: Implementación de repositorios (Prisma), servicios externos (Bcrypt, JWT) y conexión a la base de datos.
4. **Interface (`src/interface/`)**: Controladores de Express, Rutas y Middlewares (Validación, Autenticación).

---

## 🚀 Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone <tu-url-del-repo-backend>
cd athletia_backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de Entorno
Renombra o copia el archivo `.env.example` a `.env` y configura tus credenciales reales:
```bash
cp .env.example .env
```
Asegúrate de configurar correctamente `DATABASE_URL` y `JWT_SECRET`.

### 4. Configurar la Base de Datos (Prisma)
Genera el cliente de Prisma y corre las migraciones para crear las tablas en tu base de datos PostgreSQL:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Ejecutar el servidor
Para entorno de desarrollo (con recarga automática):
```bash
npm run start:dev
```
Para entorno de producción:
```bash
npm run build
npm run start
```
El servidor iniciará por defecto en `http://localhost:3000`.

---

## 📚 Endpoints Principales (API REST)

Todas las rutas están bajo el prefijo `/api/v1`.
La API responde en formato estructurado: `{ success, message, data, meta? }`.

- **Autenticación:**
  - `POST /auth/register`: Registrar nuevo usuario.
  - `POST /auth/login`: Iniciar sesión (retorna JWT).
  - `GET /auth/me`: Obtener perfil actual (Protegido).
  - `PUT /auth/profile`: Actualizar datos del perfil (Protegido).

- **Entrenamientos (Workouts):** (Rutas Protegidas)
  - `GET /workouts`: Listar entrenamientos (soporta paginación `page`, `limit`).
  - `POST /workouts`: Crear entrenamiento.
  - `PUT /workouts/:id`: Actualizar entrenamiento.
  - `DELETE /workouts/:id`: Eliminar entrenamiento.

- *(Las mismas operaciones CRUD aplican para `/meals`, `/sleep` e `/injuries`)*.

---

## 🔐 Seguridad y Validaciones

- **Protección de Rutas:** Endpoints protegidos mediante un Middleware de validación de JWT (`Authorization: Bearer <token>`).
- **Validación de Datos:** Uso de schemas de **Zod** inyectados como middleware en Express para interceptar peticiones mal formadas y devolver un error `400 Bad Request` claro y detallado antes de tocar los controladores.

