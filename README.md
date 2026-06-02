# Athletia Backend

API RESTful para la plataforma Athletia, desarrollada con Node.js, Express, TypeScript y PostgreSQL.
Sigue una Clean Architecture estricta dividida en 4 capas (Domain, Application, Infrastructure, Interface).

## 🚀 Tecnologías

* Node.js + Express
* TypeScript
* Prisma ORM + PostgreSQL
* Zod (Validaciones)
* JWT + bcrypt (Autenticación)

## 📁 Estructura del Proyecto (Clean Architecture)

* `src/domain/` → Entidades e interfaces (sin dependencias externas).
* `src/application/` → Casos de uso y DTOs.
* `src/infrastructure/` → Implementaciones (Prisma, JwtService).
* `src/interface/` → Controladores, Middlewares y Rutas Express.

## 🛠️ Instalación y Setup

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Aplicar migraciones de Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```

El servidor estará corriendo en `http://localhost:3000`.

## 📌 Endpoints Principales

Todos los endpoints (excepto login/registro) requieren el header `Authorization: Bearer <token>`.

* **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
* **Workouts**: `GET /api/v1/workouts`, `POST /api/v1/workouts`, `PUT`, `DELETE`
* **Meals**: `GET /api/v1/meals`, `POST /api/v1/meals`, `PUT`, `DELETE`
* **Sleeps**: `GET /api/v1/sleeps`, `POST /api/v1/sleeps`, `PUT`, `DELETE`
* **Injuries**: `GET /api/v1/injuries`, `POST /api/v1/injuries`, `PUT`, `DELETE`
* **Admin**: `GET /api/v1/admin/dashboard` (Requiere rol `ADMIN`)
