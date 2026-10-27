# Athletia API: PRD para pruebas de TestSprite (Juan Pablo Berrío)

## Propósito
Athletia es una API REST (Node.js, Express, TypeScript, Prisma) para el seguimiento de deportistas.
Este documento limita las pruebas a las funcionalidades de Juan Pablo: **RF-12, RF-13, RF-14, RF-15, RF-16 y RF-18**.
No se deben probar los demás módulos (entrenamientos, comidas, administración, exportación).

- URL base: `http://localhost:4010/api/v1`
- Formato: JSON
- Autenticación: JWT Bearer (`Authorization: Bearer <token>`)

## Preparación (autenticación)
Cada prueba debe crear su propio usuario para no depender de datos previos:

1. `POST /auth/register` con
   `{ "email": "<único>@test.com", "password": "Athletia#2026x", "confirmPassword": "Athletia#2026x", "name": "Tester" }`
   (la contraseña requiere 12 caracteres o más, con mayúscula, minúscula, número y carácter especial).
2. `POST /auth/login` con `{ "email", "password" }` → la respuesta incluye `token`.
3. Usar ese token en todas las peticiones siguientes. Sin token, los endpoints responden **401**.

No hace falta verificar el correo para iniciar sesión.

## Registros de sueño (`/sleeps`)
Campos: `hoursSlept` (número > 0 y ≤ 24), `sleepQuality` (entero de 1 a 10), `stressLevel` (entero de 1 a 10),
`hadNightmares` (booleano, opcional), `notes` (opcional), `date` (fecha de hoy o pasada; las fechas futuras se rechazan).

Para RF-12 y RF-13, primero se crea un registro con `POST /sleeps`.

### RF-12: Editar registro de sueño
- `PUT /sleeps/:id` con uno o más campos válidos → éxito; `GET /sleeps/:id` devuelve los valores nuevos.
- Cuerpo vacío `{}` → 400 (debe enviarse al menos un campo).
- Valores fuera de rango (`sleepQuality: 11`, `hoursSlept: 30`, `stressLevel: 0`) o fecha futura → 400.
- Id inexistente → 404.
- Registro de otro usuario → no se permite modificarlo (403 o 404).
- Sin token → 401.

### RF-13: Eliminar registro de sueño
- `DELETE /sleeps/:id` → éxito; después, `GET /sleeps/:id` → 404 y el registro ya no aparece en `GET /sleeps`.
- Id inexistente → 404.
- Registro de otro usuario → no se permite eliminarlo (403 o 404).
- Sin token → 401.

## Lesiones (`/injuries`)
Campos: `bodyArea` y `injuryName` (obligatorios, 1 a 250 caracteres, **solo letras y espacios**, con tildes y ñ),
`severity` (entero de 1 a 10), `isActive` (booleano, por defecto `true`), `notes` (opcional).

### RF-14: Reportar lesión
- `POST /injuries` con `{ "bodyArea": "Rodilla derecha", "injuryName": "Esguince", "severity": 5 }` → 201, con `isActive: true`.
- Falta `bodyArea` o `injuryName` → 400.
- `bodyArea` o `injuryName` con números o símbolos (por ejemplo "Rodilla2" o "Rodilla!") → 400.
- `severity` fuera de 1 a 10 o con decimales → 400.
- Sin token → 401.

### RF-15: Editar lesión
- Crear una lesión y luego `PUT /injuries/:id` con cambios válidos (por ejemplo `severity: 3`, `isActive: false`) → éxito; `GET /injuries/:id` refleja los cambios.
- Cuerpo vacío `{}` → 400.
- Valores inválidos (las mismas reglas de RF-14) → 400.
- Id inexistente → 404. Lesión de otro usuario → 403 o 404. Sin token → 401.

### RF-16: Eliminar lesión
- `DELETE /injuries/:id` → éxito; después, `GET /injuries/:id` → 404.
- Id inexistente → 404. Lesión de otro usuario → 403 o 404. Sin token → 401.

## RF-18: Buscar gimnasios (`/gyms`)
- `GET /gyms/search?q=<texto>&lat=<opcional>&lng=<opcional>`: el parámetro `q` es obligatorio; si falta o está vacío → 400.
- `GET /gyms/nearby?lat=<n>&lng=<n>&radius=<opcional, máximo 50000>`: si faltan `lat`/`lng` o `radius > 50000` → 400.
- Sin token → 401.
- **Nota:** los resultados vienen de Google Places, que no tiene la facturación activada en este entorno.
  Con parámetros válidos, la API puede responder con un error controlado del proveedor externo, en formato JSON y sin que el servidor se caiga.
  Las pruebas deben validar la autenticación, la validación de parámetros y ese manejo de errores, no el contenido de los resultados.
