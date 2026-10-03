import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeWorkout } from '../helpers/fixtures';

/**
 * Pruebas de seguridad para las funcionalidades de backend de Michael Pardo:
 * RF-05, RF-06 y RF-07 (rutinas de entrenamiento) y RF-08 (comidas).
 *
 * Reglas de seguridad convertidas en pruebas de regresión: autenticación
 * obligatoria, aislamiento entre usuarios, no confiar en el userId del
 * cliente, límites de longitud/rango y rechazo de entradas de inyección en
 * parámetros de consulta.
 */

const OWNER_ID = 'user-owner';
const owner = tokenFor(OWNER_ID);
const intruder = tokenFor('user-intruder');

const workoutValido = {
  title: 'Pierna',
  bodyPart: 'LEGS',
  durationMinutes: 45,
  energyLevel: 7,
  fatigueLevel: 4,
  painLevel: 1,
  date: '2026-08-01T10:00:00.000Z',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('[Seguridad] autenticación obligatoria en rutinas y comidas', () => {
  it.each([
    ['GET', '/api/v1/workouts'],
    ['POST', '/api/v1/workouts'],
    ['GET', '/api/v1/workouts/workout-1'],
    ['PUT', '/api/v1/workouts/workout-1'],
    ['DELETE', '/api/v1/workouts/workout-1'],
    ['POST', '/api/v1/meals'],
  ])('%s %s responde 401 sin token', async (method, path) => {
    const response = await request(app)[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](path);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it.each([
    ['esquema distinto de Bearer', 'Basic dXNlcjpwYXNz'],
    ['Bearer sin token', 'Bearer'],
    ['token basura', 'Bearer abc.def.ghi'],
  ])('rechaza un encabezado Authorization inválido (%s)', async (_caso, header) => {
    const response = await request(app).get('/api/v1/workouts').set('Authorization', header);

    expect(response.status).toBe(401);
  });
});

describe('[Seguridad] RF-05/06/07 — aislamiento de rutinas entre usuarios', () => {
  function repositorioConDueno() {
    return (id: string, userId: string) => Promise.resolve(userId === OWNER_ID ? fakeWorkout({ id, userId }) : null);
  }

  it('un usuario ajeno no puede leer la rutina de otro (404)', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockImplementation(repositorioConDueno());

    const response = await request(app).get('/api/v1/workouts/workout-1').set('Authorization', bearer(intruder));

    expect(response.status).toBe(404);
  });

  it('un usuario ajeno no puede editar la rutina de otro (404) y no se ejecuta la actualización', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockImplementation(repositorioConDueno());
    const updateSpy = vi.spyOn(container.workoutRepository, 'update');

    const response = await request(app)
      .put('/api/v1/workouts/workout-1')
      .set('Authorization', bearer(intruder))
      .send({ title: 'Hackeada' });

    expect(response.status).toBe(404);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('un usuario ajeno no puede eliminar la rutina de otro (404) y no se ejecuta el borrado', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockImplementation(repositorioConDueno());
    const deleteSpy = vi.spyOn(container.workoutRepository, 'delete');

    const response = await request(app).delete('/api/v1/workouts/workout-1').set('Authorization', bearer(intruder));

    expect(response.status).toBe(404);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('el listado solo consulta las rutinas del usuario autenticado', async () => {
    const findAllSpy = vi.spyOn(container.workoutRepository, 'findAll').mockResolvedValue([]);
    vi.spyOn(container.workoutRepository, 'count').mockResolvedValue(0);

    await request(app).get('/api/v1/workouts').set('Authorization', bearer(intruder));

    expect(findAllSpy.mock.calls[0][0]).toBe('user-intruder');
  });
});

describe('[Seguridad] RF-05/06/07 — el servidor no confía en el userId del cliente', () => {
  it('ignora un userId enviado en el cuerpo de la rutina y usa el del token', async () => {
    const createSpy = vi.spyOn(container.workoutRepository, 'create').mockResolvedValue(fakeWorkout({ userId: OWNER_ID }));

    const response = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', bearer(owner))
      .send({ ...workoutValido, userId: 'victima-id' });

    expect(response.status).toBe(201);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ userId: OWNER_ID }));
    expect(createSpy).not.toHaveBeenCalledWith(expect.objectContaining({ userId: 'victima-id' }));
  });
});

describe('[Seguridad] RF-05/06/07 — límites de longitud y de rango', () => {
  it.each([
    ['título de 256 caracteres', { ...workoutValido, title: 'x'.repeat(256) }],
    ['descripción de 1001 caracteres', { ...workoutValido, description: 'x'.repeat(1001) }],
    ['energía fuera de rango (11)', { ...workoutValido, energyLevel: 11 }],
    ['duración negativa', { ...workoutValido, durationMinutes: -30 }],
  ])('rechaza %s', async (_caso, payload) => {
    const createSpy = vi.spyOn(container.workoutRepository, 'create');

    const response = await request(app).post('/api/v1/workouts').set('Authorization', bearer(owner)).send(payload);

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('acepta el valor límite exacto (título de 255 caracteres)', async () => {
    vi.spyOn(container.workoutRepository, 'create').mockResolvedValue(fakeWorkout());

    const response = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', bearer(owner))
      .send({ ...workoutValido, title: 'x'.repeat(255) });

    expect(response.status).toBe(201);
  });
});

describe('[Seguridad] RF-05/06/07 — parámetros de consulta con entradas maliciosas', () => {
  it.each([
    ['inyección SQL en bodyPart', "bodyPart=' OR 1=1 --"],
    ['script en bodyPart', 'bodyPart=<script>alert(1)</script>'],
    ['limit negativo', 'limit=-5'],
    ['page en cero', 'page=0'],
  ])('rechaza %s y no consulta el repositorio', async (_caso, query) => {
    const findAllSpy = vi.spyOn(container.workoutRepository, 'findAll');

    const response = await request(app).get(`/api/v1/workouts?${query}`).set('Authorization', bearer(owner));

    expect(response.status).toBe(400);
    expect(findAllSpy).not.toHaveBeenCalled();
  });
});
