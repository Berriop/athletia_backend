import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { GoogleMapsGymService } from '../../infrastructure/services/GoogleMapsGymService';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { fakeInjury, fakeSleep } from '../helpers/fixtures';

/**
 * Pruebas de seguridad para las funcionalidades de backend de Juan Pablo
 * Berrío: RF-12 a RF-16 (sueño y lesiones) y RF-18 (búsqueda de gimnasios).
 *
 * Reglas de seguridad convertidas en pruebas de regresión: rechazo de
 * payloads de inyección/XSS, aislamiento entre usuarios (un usuario no puede
 * leer ni modificar los datos de otro), no confiar en el userId del cuerpo y
 * codificación de la consulta enviada a Google Places.
 */

const OWNER_ID = 'user-owner';
const owner = tokenFor(OWNER_ID);
const intruder = tokenFor('user-intruder');

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('[Seguridad] RF-14/15/16 — payloads de inyección y XSS en lesiones', () => {
  it.each([
    ['etiqueta script', '<script>alert(1)</script>'],
    ['imagen con onerror', '<img src=x onerror=alert(1)>'],
    ['inyección SQL', "'; DROP TABLE injuries; --"],
    ['cierre de atributo', 'Rodilla"><svg onload=1>'],
  ])('rechaza %s en el nombre de la lesión y no llega al repositorio', async (_caso, payload) => {
    const createSpy = vi.spyOn(container.injuryRepository, 'create');

    const response = await request(app)
      .post('/api/v1/injuries')
      .set('Authorization', bearer(owner))
      .send({ bodyArea: 'Rodilla', injuryName: payload, severity: 4 });

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('rechaza un payload XSS también en el área del cuerpo', async () => {
    const createSpy = vi.spyOn(container.injuryRepository, 'create');

    const response = await request(app)
      .post('/api/v1/injuries')
      .set('Authorization', bearer(owner))
      .send({ bodyArea: '<script>alert(1)</script>', injuryName: 'Tendinitis', severity: 4 });

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });
});

describe('[Seguridad] RF-14/15/16 — el servidor no confía en el userId del cliente', () => {
  it('ignora un userId enviado en el cuerpo y usa el del token', async () => {
    const createSpy = vi.spyOn(container.injuryRepository, 'create').mockResolvedValue(fakeInjury({ userId: OWNER_ID }));

    const response = await request(app)
      .post('/api/v1/injuries')
      .set('Authorization', bearer(owner))
      .send({ bodyArea: 'Rodilla', injuryName: 'Tendinitis', severity: 4, userId: 'victima-id' });

    expect(response.status).toBe(201);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ userId: OWNER_ID }));
    expect(createSpy).not.toHaveBeenCalledWith(expect.objectContaining({ userId: 'victima-id' }));
  });
});

describe('[Seguridad] RF-12/13/14/15/16 — aislamiento de datos entre usuarios', () => {
  function repositorioConDueno() {
    return (id: string, userId: string) => Promise.resolve(userId === OWNER_ID ? { ...fakeInjury({ id }), userId } : null);
  }

  it('un usuario ajeno no puede leer la lesión de otro (404)', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockImplementation(repositorioConDueno());

    const response = await request(app).get('/api/v1/injuries/injury-1').set('Authorization', bearer(intruder));

    expect(response.status).toBe(404);
  });

  it('un usuario ajeno no puede modificar la lesión de otro (404) y no se ejecuta la actualización', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockImplementation(repositorioConDueno());
    const updateSpy = vi.spyOn(container.injuryRepository, 'update');

    const response = await request(app)
      .put('/api/v1/injuries/injury-1')
      .set('Authorization', bearer(intruder))
      .send({ severity: 10 });

    expect(response.status).toBe(404);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('un usuario ajeno no puede eliminar la lesión de otro (404) y no se ejecuta el borrado', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockImplementation(repositorioConDueno());
    const deleteSpy = vi.spyOn(container.injuryRepository, 'delete');

    const response = await request(app).delete('/api/v1/injuries/injury-1').set('Authorization', bearer(intruder));

    expect(response.status).toBe(404);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('un usuario ajeno no puede eliminar el registro de sueño de otro (404)', async () => {
    vi.spyOn(container.sleepRepository, 'findById').mockImplementation((id, userId) =>
      Promise.resolve(userId === OWNER_ID ? fakeSleep({ id, userId }) : null),
    );
    const deleteSpy = vi.spyOn(container.sleepRepository, 'delete');

    const response = await request(app).delete('/api/v1/sleeps/sleep-1').set('Authorization', bearer(intruder));

    expect(response.status).toBe(404);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('el dueño sí puede acceder a su propia lesión (200)', async () => {
    vi.spyOn(container.injuryRepository, 'findById').mockImplementation(repositorioConDueno());

    const response = await request(app).get('/api/v1/injuries/injury-1').set('Authorization', bearer(owner));

    expect(response.status).toBe(200);
    expect(response.body.data.userId).toBe(OWNER_ID);
  });
});

describe('[Seguridad] autenticación obligatoria en lesiones, sueño y gimnasios', () => {
  it.each([
    ['GET', '/api/v1/injuries'],
    ['POST', '/api/v1/injuries'],
    ['PUT', '/api/v1/injuries/injury-1'],
    ['DELETE', '/api/v1/injuries/injury-1'],
    ['PUT', '/api/v1/sleeps/sleep-1'],
    ['DELETE', '/api/v1/sleeps/sleep-1'],
    ['GET', '/api/v1/gyms/search?q=envigado'],
    ['GET', '/api/v1/gyms/nearby?lat=6.2&lng=-75.5'],
  ])('%s %s responde 401 sin token', async (method, path) => {
    const response = await request(app)[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](path);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('[Seguridad] RF-18 — la consulta a Google Places se codifica', () => {
  it('un texto con &key= no puede sobrescribir la API key de la consulta', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await new GoogleMapsGymService().searchGyms({ query: 'envigado&key=CLAVE_DEL_ATACANTE&radius=1' });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('envigado%26key%3DCLAVE_DEL_ATACANTE%26radius%3D1');
    expect(url.match(/[?&]key=/g)).toHaveLength(1);
    expect(url).not.toContain('&key=CLAVE_DEL_ATACANTE');
    vi.unstubAllGlobals();
  });
});
