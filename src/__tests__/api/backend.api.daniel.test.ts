import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeMeal, fakeSleep, fakeUser } from '../helpers/fixtures';

/**
 * Pruebas de API (contrato HTTP) para las funcionalidades de backend de Daniel
 * Ortiz: RF-09 y RF-10 (editar/eliminar comidas), RF-11 (registrar sueño),
 * RF-27 (recuperar contraseña) y RF-30 (administrar usuarios).
 *
 * Se verifican códigos HTTP (200, 201, 204, 400, 401, 403, 404), la estructura
 * de las respuestas JSON y la validación de datos. Los repositorios se simulan
 * con vi.spyOn y se restauran antes de cada prueba (FIRST: independientes).
 *
 * Nota: /auth/forgot-password permite 5 peticiones por archivo de pruebas.
 */

const token = tokenFor('user-daniel');
const adminToken = tokenFor('admin-1', 'ADMIN');
const STRONG_PASSWORD = 'NuevaClave@2026';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('[API] RF-09/10 — PUT /api/v1/meals/:id', () => {
  it('200: actualiza una comida existente', async () => {
    vi.spyOn(container.mealRepository, 'findById').mockResolvedValue(fakeMeal());
    vi.spyOn(container.mealRepository, 'update').mockResolvedValue(fakeMeal({ calories: 750 }));

    const response = await request(app)
      .put('/api/v1/meals/meal-1')
      .set('Authorization', bearer(token))
      .send({ calories: 750 });

    expect(response.status).toBe(200);
    expect(response.body.data.calories).toBe(750);
  });

  it('404: la comida no existe', async () => {
    vi.spyOn(container.mealRepository, 'findById').mockResolvedValue(null);

    const response = await request(app)
      .put('/api/v1/meals/no-existe')
      .set('Authorization', bearer(token))
      .send({ calories: 750 });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it.each([
    ['cuerpo vacío', {}],
    ['tipo de comida inválido', { mealType: 'BRUNCH' }],
    ['calorías negativas', { calories: -5 }],
  ])('400: rechaza una actualización inválida (%s)', async (_caso, payload) => {
    const updateSpy = vi.spyOn(container.mealRepository, 'update');

    const response = await request(app).put('/api/v1/meals/meal-1').set('Authorization', bearer(token)).send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('[API] RF-09/10 — DELETE /api/v1/meals/:id', () => {
  it('204: elimina la comida y no devuelve contenido', async () => {
    vi.spyOn(container.mealRepository, 'findById').mockResolvedValue(fakeMeal());
    vi.spyOn(container.mealRepository, 'delete').mockResolvedValue(true);

    const response = await request(app).delete('/api/v1/meals/meal-1').set('Authorization', bearer(token));

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
  });

  it('404: no se puede eliminar una comida inexistente', async () => {
    vi.spyOn(container.mealRepository, 'findById').mockResolvedValue(null);

    const response = await request(app).delete('/api/v1/meals/no-existe').set('Authorization', bearer(token));

    expect(response.status).toBe(404);
  });
});

describe('[API] RF-11 — POST /api/v1/sleeps', () => {
  const valido = { hoursSlept: 7.5, sleepQuality: 8, stressLevel: 3, date: '2026-08-01T00:00:00.000Z' };

  it('201: registra el sueño y devuelve el recurso creado', async () => {
    vi.spyOn(container.sleepRepository, 'create').mockResolvedValue(fakeSleep({ hoursSlept: 7.5 }));

    const response = await request(app).post('/api/v1/sleeps').set('Authorization', bearer(token)).send(valido);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.hoursSlept).toBe(7.5);
  });

  it.each([
    ['horas en cero', { ...valido, hoursSlept: 0 }],
    ['calidad 11', { ...valido, sleepQuality: 11 }],
    ['estrés 0', { ...valido, stressLevel: 0 }],
    ['sin fecha', { hoursSlept: 7, sleepQuality: 8, stressLevel: 3 }],
  ])('400: rechaza datos inválidos (%s)', async (_caso, payload) => {
    const createSpy = vi.spyOn(container.sleepRepository, 'create');

    const response = await request(app).post('/api/v1/sleeps').set('Authorization', bearer(token)).send(payload);

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });
});

describe('[API] RF-27 — recuperar contraseña', () => {
  it('forgot-password 200: responde con un mensaje genérico', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(fakeUser());
    vi.spyOn(container.userRepository, 'update').mockResolvedValue(fakeUser());
    vi.spyOn(container.emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);

    const response = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'user@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe('If email exists, a reset link has been sent.');
  });

  it('forgot-password 400: el correo debe tener formato válido', async () => {
    const response = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'no-es-un-correo' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('reset-password 200: restablece la contraseña con un token vigente', async () => {
    vi.spyOn(container.userRepository, 'findByResetToken').mockResolvedValue(
      fakeUser({ resetPasswordToken: 'token-valido', resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000) }),
    );
    vi.spyOn(container.hashService, 'hash').mockResolvedValue('hash-nuevo');
    vi.spyOn(container.userRepository, 'update').mockResolvedValue(fakeUser());

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'token-valido', newPassword: STRONG_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe('Password has been reset successfully.');
  });

  it('reset-password 400: un token desconocido o vencido es rechazado', async () => {
    vi.spyOn(container.userRepository, 'findByResetToken').mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'token-falso', newPassword: STRONG_PASSWORD });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('reset-password 400: la nueva contraseña debe cumplir la política', async () => {
    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'token-valido', newPassword: 'corta' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('[API] RF-30 — administración de usuarios', () => {
  it('200: el administrador lista los usuarios sin contraseñas', async () => {
    vi.spyOn(container.userRepository, 'findAll').mockResolvedValue([fakeUser({ id: 'u1' }), fakeUser({ id: 'u2' })]);

    const response = await request(app).get('/api/v1/admin/users').set('Authorization', bearer(adminToken));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).not.toHaveProperty('password');
  });

  it('200: PATCH toggle-block bloquea a un usuario activo', async () => {
    vi.spyOn(container.userRepository, 'findById').mockResolvedValue(fakeUser({ id: 'u2', isBlocked: false }));
    vi.spyOn(container.userRepository, 'update').mockResolvedValue(fakeUser({ id: 'u2', isBlocked: true }));

    const response = await request(app)
      .patch('/api/v1/admin/users/u2/toggle-block')
      .set('Authorization', bearer(adminToken));

    expect(response.status).toBe(200);
    expect(response.body.data.isBlocked).toBe(true);
  });

  it('200: POST toggle-block también está disponible y desbloquea', async () => {
    vi.spyOn(container.userRepository, 'findById').mockResolvedValue(fakeUser({ id: 'u2', isBlocked: true }));
    vi.spyOn(container.userRepository, 'update').mockResolvedValue(fakeUser({ id: 'u2', isBlocked: false }));

    const response = await request(app)
      .post('/api/v1/admin/users/u2/toggle-block')
      .set('Authorization', bearer(adminToken));

    expect(response.status).toBe(200);
    expect(response.body.data.isBlocked).toBe(false);
  });

  it('403: un administrador no puede bloquear su propia cuenta', async () => {
    const updateSpy = vi.spyOn(container.userRepository, 'update');

    const response = await request(app)
      .patch('/api/v1/admin/users/admin-1/toggle-block')
      .set('Authorization', bearer(adminToken));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('404: bloquear un usuario que no existe', async () => {
    vi.spyOn(container.userRepository, 'findById').mockResolvedValue(null);

    const response = await request(app)
      .patch('/api/v1/admin/users/no-existe/toggle-block')
      .set('Authorization', bearer(adminToken));

    expect(response.status).toBe(404);
  });

  it('403: un usuario normal no puede bloquear a nadie', async () => {
    const response = await request(app)
      .patch('/api/v1/admin/users/u2/toggle-block')
      .set('Authorization', bearer(token));

    expect(response.status).toBe(403);
  });
});
