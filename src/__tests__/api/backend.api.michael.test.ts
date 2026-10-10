import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeMeal, fakeWorkout } from '../helpers/fixtures';

/**
 * Pruebas de API (contrato HTTP) para las funcionalidades de backend de Michael
 * Pardo: RF-05, RF-06 y RF-07 (crear, consultar, editar y eliminar rutinas de
 * entrenamiento) y RF-08 (registrar comidas).
 *
 * Se verifican códigos HTTP (200, 201, 204, 400, 404), la estructura de las
 * respuestas JSON, la paginación y la validación de datos. Los repositorios se
 * simulan con vi.spyOn y se restauran antes de cada prueba (FIRST: independientes).
 */

const token = tokenFor('user-michael');

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

describe('[API] RF-05/06/07 — POST /api/v1/workouts', () => {
  it('201: crea la rutina y devuelve el recurso con su id', async () => {
    vi.spyOn(container.workoutRepository, 'create').mockResolvedValue(fakeWorkout({ id: 'workout-9' }));

    const response = await request(app).post('/api/v1/workouts').set('Authorization', bearer(token)).send(workoutValido);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({ id: 'workout-9', title: 'Pierna', bodyPart: 'LEGS' });
  });

  it.each([
    ['título vacío', { ...workoutValido, title: '' }],
    ['parte del cuerpo inexistente', { ...workoutValido, bodyPart: 'ARMS' }],
    ['duración en cero', { ...workoutValido, durationMinutes: 0 }],
    ['energía 11', { ...workoutValido, energyLevel: 11 }],
    ['fatiga 0', { ...workoutValido, fatigueLevel: 0 }],
    ['dolor 11', { ...workoutValido, painLevel: 11 }],
    ['sin fecha', { title: 'Pierna', bodyPart: 'LEGS', durationMinutes: 45, energyLevel: 7, fatigueLevel: 4, painLevel: 1 }],
  ])('400: rechaza datos inválidos (%s)', async (_caso, payload) => {
    const createSpy = vi.spyOn(container.workoutRepository, 'create');

    const response = await request(app).post('/api/v1/workouts').set('Authorization', bearer(token)).send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(createSpy).not.toHaveBeenCalled();
  });
});

describe('[API] RF-05/06/07 — GET /api/v1/workouts y /api/v1/workouts/:id', () => {
  it('200: lista con metadatos de paginación', async () => {
    vi.spyOn(container.workoutRepository, 'findAll').mockResolvedValue([fakeWorkout(), fakeWorkout({ id: 'workout-2' })]);
    vi.spyOn(container.workoutRepository, 'count').mockResolvedValue(25);

    const response = await request(app).get('/api/v1/workouts?page=2&limit=10').set('Authorization', bearer(token));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
  });

  it('200: filtra por parte del cuerpo y delega el filtro al repositorio', async () => {
    const findAllSpy = vi.spyOn(container.workoutRepository, 'findAll').mockResolvedValue([]);
    vi.spyOn(container.workoutRepository, 'count').mockResolvedValue(0);

    const response = await request(app).get('/api/v1/workouts?bodyPart=CHEST').set('Authorization', bearer(token));

    expect(response.status).toBe(200);
    expect(findAllSpy).toHaveBeenCalledWith('user-michael', 0, 10, { bodyPart: 'CHEST' });
  });

  it('400: una parte del cuerpo inexistente en el filtro es inválida', async () => {
    const response = await request(app).get('/api/v1/workouts?bodyPart=ARMS').set('Authorization', bearer(token));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('200: consulta una rutina por id', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockResolvedValue(fakeWorkout({ id: 'workout-1' }));

    const response = await request(app).get('/api/v1/workouts/workout-1').set('Authorization', bearer(token));

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe('workout-1');
  });

  it('404: la rutina no existe', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockResolvedValue(null);

    const response = await request(app).get('/api/v1/workouts/no-existe').set('Authorization', bearer(token));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

describe('[API] RF-05/06/07 — PUT /api/v1/workouts/:id', () => {
  it('200: actualiza una rutina existente', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockResolvedValue(fakeWorkout());
    vi.spyOn(container.workoutRepository, 'update').mockResolvedValue(fakeWorkout({ title: 'Pecho y tríceps' }));

    const response = await request(app)
      .put('/api/v1/workouts/workout-1')
      .set('Authorization', bearer(token))
      .send({ title: 'Pecho y tríceps' });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Pecho y tríceps');
  });

  it('404: la rutina no existe', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockResolvedValue(null);

    const response = await request(app)
      .put('/api/v1/workouts/no-existe')
      .set('Authorization', bearer(token))
      .send({ title: 'Nueva' });

    expect(response.status).toBe(404);
  });

  it('400: un cuerpo vacío no es una actualización válida', async () => {
    const response = await request(app).put('/api/v1/workouts/workout-1').set('Authorization', bearer(token)).send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('[API] RF-05/06/07 — DELETE /api/v1/workouts/:id', () => {
  it('204: elimina la rutina y no devuelve contenido', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockResolvedValue(fakeWorkout());
    vi.spyOn(container.workoutRepository, 'delete').mockResolvedValue(true);

    const response = await request(app).delete('/api/v1/workouts/workout-1').set('Authorization', bearer(token));

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
  });

  it('404: no se puede eliminar una rutina inexistente', async () => {
    vi.spyOn(container.workoutRepository, 'findById').mockResolvedValue(null);
    const deleteSpy = vi.spyOn(container.workoutRepository, 'delete');

    const response = await request(app).delete('/api/v1/workouts/no-existe').set('Authorization', bearer(token));

    expect(response.status).toBe(404);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});

describe('[API] RF-08 — POST /api/v1/meals (registrar comidas)', () => {
  const comidaValida = {
    name: 'Pollo con arroz',
    calories: 600,
    mealType: 'LUNCH',
    proteinG: 40,
    carbsG: 60,
    fatG: 15,
    date: '2026-08-01T12:00:00.000Z',
  };

  it('201: registra la comida y devuelve el recurso', async () => {
    vi.spyOn(container.mealRepository, 'create').mockResolvedValue(fakeMeal());

    const response = await request(app).post('/api/v1/meals').set('Authorization', bearer(token)).send(comidaValida);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ name: 'Pollo con arroz', calories: 600, mealType: 'LUNCH' });
  });

  it.each([
    ['calorías negativas', { ...comidaValida, calories: -1 }],
    ['calorías decimales', { ...comidaValida, calories: 10.5 }],
    ['tipo de comida inválido', { ...comidaValida, mealType: 'BRUNCH' }],
    ['proteína negativa', { ...comidaValida, proteinG: -3 }],
    ['nombre vacío', { ...comidaValida, name: '' }],
  ])('400: rechaza datos inválidos (%s)', async (_caso, payload) => {
    const createSpy = vi.spyOn(container.mealRepository, 'create');

    const response = await request(app).post('/api/v1/meals').set('Authorization', bearer(token)).send(payload);

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });
});
