import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordSchema } from '../../application/dto/auth.dto';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeUser } from '../helpers/fixtures';

/**
 * Pruebas de seguridad para las funcionalidades de backend de Daniel Ortiz:
 * RF-09/10/11 (comidas y sueño), RF-27 (recuperar contraseña) y RF-30
 * (administrar usuarios).
 *
 * Reglas de seguridad convertidas en pruebas de regresión: no revelar si un
 * correo existe, tokens de recuperación aleatorios, de un solo uso y con
 * vencimiento, política de contraseñas al restablecer, y control de acceso
 * del panel de administración.
 */

const PASSWORD_HASH = '$2b$10$hashedpasswordhashedpasswordhashedpasswordhashedpass';
const STRONG_PASSWORD = 'NuevaClave@2026';
const userToken = tokenFor('user-daniel');
const adminToken = tokenFor('admin-1', 'ADMIN');

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('[Seguridad] RF-27 — forgot-password no revela qué correos existen', () => {
  it('correo registrado y correo desconocido reciben exactamente la misma respuesta', async () => {
    vi.spyOn(container.userRepository, 'update').mockResolvedValue(fakeUser());
    vi.spyOn(container.emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
    const findSpy = vi.spyOn(container.userRepository, 'findByEmail');

    findSpy.mockResolvedValueOnce(fakeUser());
    const registrado = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'user@example.com' });

    findSpy.mockResolvedValueOnce(null);
    const desconocido = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'fantasma@example.com' });

    expect(registrado.status).toBe(200);
    expect(desconocido.status).toBe(registrado.status);
    expect(desconocido.body).toEqual(registrado.body);
  });

  it('para un correo desconocido no se envía ningún correo ni se guarda ningún token', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(null);
    const updateSpy = vi.spyOn(container.userRepository, 'update');
    const emailSpy = vi.spyOn(container.emailService, 'sendPasswordResetEmail');

    await request(app).post('/api/v1/auth/forgot-password').send({ email: 'fantasma@example.com' });

    expect(updateSpy).not.toHaveBeenCalled();
    expect(emailSpy).not.toHaveBeenCalled();
  });
});

describe('[Seguridad] RF-27 — el token de recuperación es aleatorio y vence', () => {
  it('genera un token hexadecimal de 64 caracteres que vence en 15 minutos', async () => {
    const update = vi.fn().mockResolvedValue(fakeUser());
    const userRepository = { findByEmail: vi.fn().mockResolvedValue(fakeUser()), update } as unknown as IUserRepository;
    const emailService = { sendPasswordResetEmail: vi.fn(), sendVerificationEmail: vi.fn() };
    const antes = Date.now();

    await new ForgotPasswordUseCase(userRepository, emailService).execute('user@example.com');

    const guardado = update.mock.calls[0][1] as { resetPasswordToken: string; resetPasswordExpires: Date };
    const minutos = (guardado.resetPasswordExpires.getTime() - antes) / 60000;
    expect(guardado.resetPasswordToken).toMatch(/^[a-f0-9]{64}$/);
    expect(minutos).toBeGreaterThan(14.5);
    expect(minutos).toBeLessThan(15.5);
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith('user@example.com', guardado.resetPasswordToken);
  });

  it('dos solicitudes consecutivas generan tokens distintos', async () => {
    const update = vi.fn().mockResolvedValue(fakeUser());
    const userRepository = { findByEmail: vi.fn().mockResolvedValue(fakeUser()), update } as unknown as IUserRepository;
    const useCase = new ForgotPasswordUseCase(userRepository, { sendPasswordResetEmail: vi.fn(), sendVerificationEmail: vi.fn() });

    await useCase.execute('user@example.com');
    await useCase.execute('user@example.com');

    const primero = (update.mock.calls[0][1] as { resetPasswordToken: string }).resetPasswordToken;
    const segundo = (update.mock.calls[1][1] as { resetPasswordToken: string }).resetPasswordToken;
    expect(primero).not.toBe(segundo);
  });

  it('un token vencido es rechazado y no se cambia la contraseña', async () => {
    vi.spyOn(container.userRepository, 'findByResetToken').mockResolvedValue(
      fakeUser({ resetPasswordToken: 'viejo', resetPasswordExpires: new Date(Date.now() - 1000) }),
    );
    const updateSpy = vi.spyOn(container.userRepository, 'update');

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'viejo', newPassword: STRONG_PASSWORD });

    expect(response.status).toBe(400);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('el token es de un solo uso: tras restablecer se borra y la clave se guarda hasheada', async () => {
    vi.spyOn(container.userRepository, 'findByResetToken').mockResolvedValue(
      fakeUser({ id: 'u1', resetPasswordToken: 'un-solo-uso', resetPasswordExpires: new Date(Date.now() + 60_000) }),
    );
    vi.spyOn(container.hashService, 'hash').mockResolvedValue('hash-de-la-nueva-clave');
    const updateSpy = vi.spyOn(container.userRepository, 'update').mockResolvedValue(fakeUser());

    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'un-solo-uso', newPassword: STRONG_PASSWORD });

    expect(response.status).toBe(200);
    expect(updateSpy).toHaveBeenCalledWith('u1', {
      password: 'hash-de-la-nueva-clave',
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
    expect(JSON.stringify(updateSpy.mock.calls)).not.toContain(STRONG_PASSWORD);
  });
});

describe('[Seguridad] RF-27 — política de contraseñas al restablecer', () => {
  it('acepta una contraseña que cumple todas las reglas', () => {
    expect(ResetPasswordSchema.safeParse({ body: { token: 't', newPassword: STRONG_PASSWORD } }).success).toBe(true);
  });

  it.each([
    ['corta', 'Ab1!abcdefg'],
    ['sin mayúscula', 'segura123456!'],
    ['sin minúscula', 'SEGURA123456!'],
    ['sin dígito', 'SeguraSegura!!'],
    ['sin carácter especial', 'Segura1234567'],
  ])('rechaza una nueva contraseña %s', (_motivo, newPassword) => {
    expect(ResetPasswordSchema.safeParse({ body: { token: 't', newPassword } }).success).toBe(false);
  });
});

describe('[Seguridad] RF-30 — control de acceso del panel de administración', () => {
  it.each([
    ['GET', '/api/v1/admin/users'],
    ['PATCH', '/api/v1/admin/users/u2/toggle-block'],
    ['POST', '/api/v1/admin/users/u2/toggle-block'],
  ])('%s %s responde 401 sin token', async (method, path) => {
    const response = await request(app)[method.toLowerCase() as 'get' | 'patch' | 'post'](path);

    expect(response.status).toBe(401);
  });

  it.each([
    ['GET', '/api/v1/admin/users'],
    ['PATCH', '/api/v1/admin/users/u2/toggle-block'],
  ])('%s %s responde 403 a un usuario con rol USER y no ejecuta la acción', async (method, path) => {
    const updateSpy = vi.spyOn(container.userRepository, 'update');
    const findAllSpy = vi.spyOn(container.userRepository, 'findAll');

    const response = await request(app)[method.toLowerCase() as 'get' | 'patch'](path).set('Authorization', bearer(userToken));

    expect(response.status).toBe(403);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(findAllSpy).not.toHaveBeenCalled();
  });

  it('el listado y el bloqueo nunca exponen el hash de la contraseña', async () => {
    vi.spyOn(container.userRepository, 'findAll').mockResolvedValue([fakeUser({ password: PASSWORD_HASH })]);
    vi.spyOn(container.userRepository, 'findById').mockResolvedValue(fakeUser({ id: 'u2', password: PASSWORD_HASH }));
    vi.spyOn(container.userRepository, 'update').mockResolvedValue(fakeUser({ id: 'u2', password: PASSWORD_HASH, isBlocked: true }));

    const listado = await request(app).get('/api/v1/admin/users').set('Authorization', bearer(adminToken));
    const bloqueo = await request(app).patch('/api/v1/admin/users/u2/toggle-block').set('Authorization', bearer(adminToken));

    expect(JSON.stringify(listado.body)).not.toContain(PASSWORD_HASH);
    expect(JSON.stringify(bloqueo.body)).not.toContain(PASSWORD_HASH);
  });

  it('un administrador no puede bloquearse a sí mismo (evita perder el acceso al panel)', async () => {
    const updateSpy = vi.spyOn(container.userRepository, 'update');

    const response = await request(app)
      .patch('/api/v1/admin/users/admin-1/toggle-block')
      .set('Authorization', bearer(adminToken));

    expect(response.status).toBe(403);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
