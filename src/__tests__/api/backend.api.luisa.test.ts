import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeUser } from '../helpers/fixtures';

/**
 * Pruebas de API (contrato HTTP) para las funcionalidades de backend de Luisa
 * Espinal: RF-01 (registro), RF-02 (login), RF-04 (perfil), RF-22 (acceso solo
 * para administradores) y RF-29 (exportar historial de datos).
 *
 * Se verifican códigos HTTP, estructura del JSON y validación de datos. Los
 * repositorios se simulan con vi.spyOn y se restauran antes de cada prueba
 * (principio FIRST: pruebas independientes y repetibles).
 *
 * Nota: el servidor limita /auth/register a 3 y /auth/login a 5 peticiones por
 * archivo de pruebas (rate limiter en memoria), por eso hay pocas peticiones.
 */

const USER_ID = 'user-luisa';
const userToken = tokenFor(USER_ID);
const adminToken = tokenFor('admin-1', 'ADMIN');
const STRONG_PASSWORD = 'StrongP@ss1234';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('[API] RF-01 — POST /api/v1/auth/register', () => {
  it('201: crea la cuenta y responde con token sin exponer la contraseña', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(container.userRepository, 'create').mockResolvedValue(
      fakeUser({ id: USER_ID, email: 'nueva@example.com' }),
    );
    vi.spyOn(container.emailService, 'sendVerificationEmail').mockResolvedValue(undefined);

    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'nueva@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
      name: 'Luisa',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.token).toBe('string');
    expect(response.body.data.user.email).toBe('nueva@example.com');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('409: rechaza un correo que ya está registrado', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(fakeUser());

    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('400: las contraseñas que no coinciden devuelven el detalle del campo', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'otra@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: 'OtraClave@1234',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    const campos = response.body.error.details.map((d: { field: string }) => d.field);
    expect(campos.some((campo: string) => campo.includes('confirmPassword'))).toBe(true);
  });
});

describe('[API] RF-02 — POST /api/v1/auth/login', () => {
  it('200: credenciales correctas devuelven token y el usuario sin contraseña', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(fakeUser({ id: USER_ID }));
    vi.spyOn(container.hashService, 'compare').mockResolvedValue(true);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: STRONG_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.token).toBe('string');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('401: contraseña incorrecta devuelve UNAUTHORIZED', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(fakeUser());
    vi.spyOn(container.hashService, 'compare').mockResolvedValue(false);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'incorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(response.body.error.message).toBe('Invalid credentials');
  });

  it('403: una cuenta bloqueada no puede iniciar sesión', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(fakeUser({ isBlocked: true }));

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: STRONG_PASSWORD });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});

describe('[API] RF-04 — PUT /api/v1/auth/profile', () => {
  it('200: actualiza el perfil y devuelve el usuario sin contraseña', async () => {
    vi.spyOn(container.userRepository, 'findById').mockResolvedValue(fakeUser({ id: USER_ID }));
    vi.spyOn(container.userRepository, 'update').mockResolvedValue(
      fakeUser({ id: USER_ID, name: 'Luisa Espinal', heightCm: 165 }),
    );

    const response = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', bearer(userToken))
      .send({ name: 'Luisa Espinal', heightCm: 165 });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Luisa Espinal');
    expect(response.body.data.heightCm).toBe(165);
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('404: el usuario del token ya no existe', async () => {
    vi.spyOn(container.userRepository, 'findById').mockResolvedValue(null);

    const response = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', bearer(userToken))
      .send({ name: 'Nadie' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('401: sin token no se puede modificar el perfil', async () => {
    const response = await request(app).put('/api/v1/auth/profile').send({ name: 'Anónimo' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('[API] RF-29 — GET /api/v1/user/export', () => {
  it('200: entrega un CSV descargable', async () => {
    vi.spyOn(container.exportUserDataUseCase, 'execute').mockResolvedValue(
      'TYPE,DATE,DETAIL_1,DETAIL_2,DETAIL_3\nWORKOUT,2026-08-01,"Pierna","LEGS","45 min"',
    );

    const response = await request(app).get('/api/v1/user/export').set('Authorization', bearer(userToken));

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['content-disposition']).toContain('athletia_export.csv');
    expect(response.text.split('\n')[0]).toBe('TYPE,DATE,DETAIL_1,DETAIL_2,DETAIL_3');
  });

  it('401: sin token no se exportan datos', async () => {
    const response = await request(app).get('/api/v1/user/export');

    expect(response.status).toBe(401);
    expect(response.headers['content-type']).not.toContain('text/csv');
  });
});

describe('[API] RF-22 — acceso restringido a administradores', () => {
  it('200: un administrador lista usuarios sin contraseñas', async () => {
    vi.spyOn(container.userRepository, 'findAll').mockResolvedValue([fakeUser({ id: 'u1' }), fakeUser({ id: 'u2' })]);

    const response = await request(app).get('/api/v1/admin/users').set('Authorization', bearer(adminToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).not.toHaveProperty('password');
  });

  it('403: un usuario normal no puede listar usuarios', async () => {
    const response = await request(app).get('/api/v1/admin/users').set('Authorization', bearer(userToken));

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('401: sin token no hay acceso al panel de administración', async () => {
    const response = await request(app).get('/api/v1/admin/users');

    expect(response.status).toBe(401);
  });
});
