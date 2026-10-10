import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { env } from '../../config/env';
import { RegisterSchema } from '../../application/dto/auth.dto';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeUser } from '../helpers/fixtures';

/**
 * Pruebas de seguridad para las funcionalidades de backend de Luisa Espinal:
 * RF-01 (registro), RF-02 (login), RF-04 (perfil), RF-22 (acceso solo para
 * administradores) y RF-29 (exportar historial de datos).
 *
 * Reglas de seguridad convertidas en pruebas de regresión: política de
 * contraseñas, no filtrar el hash, no revelar si un correo existe, validación
 * estricta del JWT y bloqueo de escalada de privilegios.
 */

const STRONG_PASSWORD = 'StrongP@ss1234';
const PASSWORD_HASH = '$2b$10$hashedpasswordhashedpasswordhashedpasswordhashedpass';
const userToken = tokenFor('user-luisa');

function registerPayload(password: string) {
  return { body: { email: 'seguridad@example.com', password, confirmPassword: password } };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('[Seguridad] RF-01 — política de contraseñas del registro', () => {
  it('acepta una contraseña que cumple todas las reglas', () => {
    const result = RegisterSchema.safeParse(registerPayload(STRONG_PASSWORD));

    expect(result.success).toBe(true);
  });

  it.each([
    ['corta (menos de 12 caracteres)', 'Ab1!abcdefg'],
    ['sin mayúscula', 'segura123456!'],
    ['sin minúscula', 'SEGURA123456!'],
    ['sin dígito', 'SeguraSegura!!'],
    ['sin carácter especial', 'Segura1234567'],
  ])('rechaza una contraseña %s', (_motivo, password) => {
    const result = RegisterSchema.safeParse(registerPayload(password));

    expect(result.success).toBe(false);
  });

  it('ignora el campo role enviado por el cliente (no se puede registrar como ADMIN)', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(null);
    const createSpy = vi.spyOn(container.userRepository, 'create').mockResolvedValue(fakeUser());
    vi.spyOn(container.emailService, 'sendVerificationEmail').mockResolvedValue(undefined);

    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'escalada@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
      role: 'ADMIN',
    });

    expect(response.status).toBe(201);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ role: 'USER' }));
  });
});

describe('[Seguridad] RF-02 — el login no filtra información sensible', () => {
  it('la respuesta del login nunca incluye la contraseña ni su hash', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(fakeUser({ password: PASSWORD_HASH }));
    vi.spyOn(container.hashService, 'compare').mockResolvedValue(true);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: STRONG_PASSWORD });

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain(PASSWORD_HASH);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  it('correo inexistente y contraseña incorrecta responden exactamente igual (sin enumeración de usuarios)', async () => {
    const compareSpy = vi.spyOn(container.hashService, 'compare').mockResolvedValue(false);
    const findSpy = vi.spyOn(container.userRepository, 'findByEmail');

    findSpy.mockResolvedValueOnce(null);
    const correoInexistente = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'fantasma@example.com', password: STRONG_PASSWORD });

    findSpy.mockResolvedValueOnce(fakeUser());
    const claveIncorrecta = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'incorrecta' });

    expect(compareSpy).toHaveBeenCalledTimes(1);
    expect(correoInexistente.status).toBe(claveIncorrecta.status);
    expect(correoInexistente.body).toEqual(claveIncorrecta.body);
  });

  it('un usuario bloqueado recibe 403 y no se emite ningún token', async () => {
    vi.spyOn(container.userRepository, 'findByEmail').mockResolvedValue(fakeUser({ isBlocked: true }));
    const compareSpy = vi.spyOn(container.hashService, 'compare');

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: STRONG_PASSWORD });

    expect(response.status).toBe(403);
    expect(response.body).not.toHaveProperty('data');
    expect(compareSpy).not.toHaveBeenCalled();
  });
});

describe('[Seguridad] RF-04 / RF-29 — validación estricta del token JWT', () => {
  it('rechaza un token firmado con otro secreto', async () => {
    const forged = jwt.sign({ id: 'user-luisa', email: 'x@example.com', role: 'USER' }, 'otro-secreto');

    const response = await request(app).get('/api/v1/user/export').set('Authorization', bearer(forged));

    expect(response.status).toBe(401);
  });

  it('rechaza un token expirado sin exponer detalles internos del error', async () => {
    const expired = jwt.sign({ id: 'user-luisa', email: 'x@example.com', role: 'USER' }, env.JWT_SECRET, {
      expiresIn: -10,
    });

    const response = await request(app).get('/api/v1/auth/me').set('Authorization', bearer(expired));

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(JSON.stringify(response.body)).not.toMatch(/jwt|TokenExpiredError|stack/i);
  });

  it('rechaza un token con el payload alterado (cambiar USER por ADMIN invalida la firma)', async () => {
    const [header, payload, signature] = userToken.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    decoded.role = 'ADMIN';
    const tampered = [header, Buffer.from(JSON.stringify(decoded)).toString('base64url'), signature].join('.');

    const response = await request(app).get('/api/v1/admin/users').set('Authorization', bearer(tampered));

    expect(response.status).toBe(401);
  });

  it('rechaza un token sin firma (algoritmo "none")', async () => {
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const unsigned = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ id: 'x', email: 'x@example.com', role: 'ADMIN' })}.`;

    const response = await request(app).get('/api/v1/admin/users').set('Authorization', bearer(unsigned));

    expect(response.status).toBe(401);
  });
});

describe('[Seguridad] RF-22 — el rol ADMIN no se puede obtener por la fuerza', () => {
  it('un usuario con rol USER recibe 403 en el panel de administración', async () => {
    const response = await request(app).get('/api/v1/admin/users').set('Authorization', bearer(userToken));

    expect(response.status).toBe(403);
    expect(response.body).not.toHaveProperty('data');
  });

  it('el listado de administración no expone hashes de contraseña', async () => {
    vi.spyOn(container.userRepository, 'findAll').mockResolvedValue([fakeUser({ password: PASSWORD_HASH })]);

    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', bearer(tokenFor('admin-1', 'ADMIN')));

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain(PASSWORD_HASH);
  });
});
