import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeInjury, fakeSleep } from '../helpers/fixtures';
import { Gym } from '../../domain/entities/Gym';

/**
 * Pruebas de API (contrato HTTP) para las funcionalidades de backend de Juan
 * Pablo Berrío: RF-12 y RF-13 (editar/eliminar sueño), RF-14, RF-15 y RF-16
 * (crear/editar/eliminar lesiones) y RF-18 (buscar gimnasios por texto).
 *
 * Se verifican códigos HTTP (201, 200, 204, 400, 401, 404), la estructura de las
 * respuestas JSON y la validación de datos. Los repositorios se simulan con
 * vi.spyOn y se restauran antes de cada prueba (FIRST: independientes).
 */

const token = tokenFor('user-juan');

const gym: Gym = {
  placeId: 'place-1',
  name: 'Smart Fit Poblado',
  address: 'Cra 43A',
  lat: 6.21,
  lng: -75.57,
  rating: 4.5,
  userRatingsTotal: 200,
  openNow: true,
  types: ['gym'],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('[API] RF-14/15/16 — POST /api/v1/injuries', () => {
  it('201: registra una lesión válida y devuelve el recurso creado', async () => {
    vi.spyOn(container.injuryRepository, 'create').mockResolvedValue(fakeInjury());

    const response = await request(app)
      .post('/api/v1/injuries')
      .set('Authorization', bearer(token))
      .send({ bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 4 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({ bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 4 });
  });

  it.each([
    ['área vacía', { bodyArea: '', injuryName: 'Tendinitis', severity: 4 }],
    ['nombre con números', { bodyArea: 'Rodilla', injuryName: 'Tendinitis2', severity: 4 }],
    ['severidad 0', { bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 0 }],
    ['severidad 11', { bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 11 }],
    ['severidad decimal', { bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 5.5 }],
    ['notas de más de 1000 caracteres', { bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 4, notes: 'x'.repeat(1001) }],
  ])('400: rechaza datos inválidos (%s)', async (_caso, payload) => {
    const createSpy = vi.spyOn(container.injuryRepository, 'create');

    const response = await request(app).post('/api/v1/injuries').set('Authorization', bearer(token)).send(payload);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('401: sin token no se puede registrar una lesión', async () => {
    const response = await request(app)
      .post('/api/v1/injuries')
      .send({ bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 4 });

    expect(response.status).toBe(401);
  });
});

describe('[API] RF-14/15/16 — PUT /api/v1/injuries/:id', () => {
  it('200: actualiza la lesión existente', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockResolvedValue(fakeInjury());
    vi.spyOn(container.injuryRepository, 'update').mockResolvedValue(fakeInjury({ severity: 8 }));

    const response = await request(app)
      .put('/api/v1/injuries/injury-1')
      .set('Authorization', bearer(token))
      .send({ severity: 8 });

    expect(response.status).toBe(200);
    expect(response.body.data.severity).toBe(8);
  });

  it('404: la lesión no existe', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockResolvedValue(null);

    const response = await request(app)
      .put('/api/v1/injuries/no-existe')
      .set('Authorization', bearer(token))
      .send({ severity: 8 });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('400: un cuerpo vacío no es una actualización válida', async () => {
    const response = await request(app).put('/api/v1/injuries/injury-1').set('Authorization', bearer(token)).send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('[API] RF-14/15/16 — DELETE /api/v1/injuries/:id', () => {
  it('204: elimina la lesión y no devuelve contenido', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockResolvedValue(fakeInjury());
    vi.spyOn(container.injuryRepository, 'delete').mockResolvedValue(true);

    const response = await request(app).delete('/api/v1/injuries/injury-1').set('Authorization', bearer(token));

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
  });

  it('404: no se puede eliminar una lesión inexistente', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockResolvedValue(null);
    const deleteSpy = vi.spyOn(container.injuryRepository, 'delete');

    const response = await request(app).delete('/api/v1/injuries/no-existe').set('Authorization', bearer(token));

    expect(response.status).toBe(404);
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});

describe('[API] RF-12 / RF-13 — PUT y DELETE /api/v1/sleeps/:id', () => {
  it('200: actualiza un registro de sueño', async () => {
    vi.spyOn(container.sleepRepository, 'findById').mockResolvedValue(fakeSleep());
    vi.spyOn(container.sleepRepository, 'update').mockResolvedValue(fakeSleep({ hoursSlept: 9 }));

    const response = await request(app)
      .put('/api/v1/sleeps/sleep-1')
      .set('Authorization', bearer(token))
      .send({ hoursSlept: 9 });

    expect(response.status).toBe(200);
    expect(response.body.data.hoursSlept).toBe(9);
  });

  it('400: calidad de sueño fuera de rango (11)', async () => {
    const response = await request(app)
      .put('/api/v1/sleeps/sleep-1')
      .set('Authorization', bearer(token))
      .send({ sleepQuality: 11 });

    expect(response.status).toBe(400);
  });

  it('204: elimina un registro de sueño', async () => {
    vi.spyOn(container.sleepRepository, 'findById').mockResolvedValue(fakeSleep());
    vi.spyOn(container.sleepRepository, 'delete').mockResolvedValue(true);

    const response = await request(app).delete('/api/v1/sleeps/sleep-1').set('Authorization', bearer(token));

    expect(response.status).toBe(204);
  });

  it('404: eliminar un registro de sueño inexistente', async () => {
    vi.spyOn(container.sleepRepository, 'findById').mockResolvedValue(null);

    const response = await request(app).delete('/api/v1/sleeps/no-existe').set('Authorization', bearer(token));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

describe('[API] RF-18 — GET /api/v1/gyms/search', () => {
  it('200: devuelve la lista de gimnasios con la estructura esperada', async () => {
    const searchSpy = vi.spyOn(container.googleMapsService, 'searchGyms').mockResolvedValue([gym]);

    const response = await request(app).get('/api/v1/gyms/search?q=envigado').set('Authorization', bearer(token));

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({ placeId: 'place-1', name: 'Smart Fit Poblado', lat: 6.21, lng: -75.57 });
    expect(searchSpy).toHaveBeenCalledWith(expect.objectContaining({ query: 'envigado' }));
  });

  it('400: la búsqueda sin texto es inválida', async () => {
    const searchSpy = vi.spyOn(container.googleMapsService, 'searchGyms');

    const response = await request(app).get('/api/v1/gyms/search').set('Authorization', bearer(token));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it('401: sin token no se puede buscar gimnasios', async () => {
    const response = await request(app).get('/api/v1/gyms/search?q=envigado');

    expect(response.status).toBe(401);
  });
});
