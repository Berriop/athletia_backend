import { describe, it, expect, vi, afterEach } from 'vitest';
import { CreateInjurySchema } from '../../application/dto/injury.dto';
import { GetInjuriesUseCase } from '../../application/use-cases/injury/GetInjuriesUseCase';
import { buildPaginatedResult, resolvePagination } from '../../application/use-cases/pagination';
import { GoogleMapsGymService } from '../../infrastructure/services/GoogleMapsGymService';
import { IInjuryRepository } from '../../domain/repositories/IInjuryRepository';
import { elapsedMs, fakeInjury, medianMs } from '../helpers/fixtures';

/**
 * Pruebas de rendimiento para las funcionalidades de backend de Juan Pablo
 * Berrío: RF-12 a RF-16 (sueño y lesiones) y RF-18 (búsqueda de gimnasios).
 *
 * Los límites de tiempo son amplios a propósito para evitar falsos fallos en
 * equipos distintos (incluido Jenkins); no reemplazan pruebas de carga con
 * herramientas como k6 o JMeter.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('[Rendimiento] RF-14/15/16 — validación de lesiones', () => {
  it('valida 2.000 lesiones dentro del presupuesto y rechaza las inválidas', async () => {
    const valida = { body: { bodyArea: 'Rodilla derecha', injuryName: 'Tendinitis rotuliana', severity: 5 } };
    const invalida = { body: { bodyArea: 'Rodilla2', injuryName: 'Tendinitis', severity: 5 } };
    let aceptadas = 0;
    let rechazadas = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 0; i < 2000; i++) {
        if (CreateInjurySchema.safeParse(valida).success) aceptadas++;
        if (!CreateInjurySchema.safeParse(invalida).success) rechazadas++;
      }
    });

    expect(aceptadas).toBe(2000);
    expect(rechazadas).toBe(2000);
    expect(duracion, `4.000 validaciones tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(10_000);
  });
});

describe('[Rendimiento] RF-14/15/16 — listado paginado de lesiones', () => {
  it('pagina 100.000 consultas dentro del presupuesto', async () => {
    let totalPaginas = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 1; i <= 100_000; i++) {
        const { page, limit } = resolvePagination({ page: i, limit: 10 });
        totalPaginas += buildPaginatedResult([], page, limit, 1000).meta.totalPages;
      }
    });

    expect(totalPaginas).toBe(100_000 * 100);
    expect(duracion, `La paginación tardó ${duracion.toFixed(1)} ms`).toBeLessThan(8_000);
  });

  it('el caso de uso devuelve una página de 10.000 lesiones dentro del presupuesto', async () => {
    const lesiones = Array.from({ length: 10_000 }, (_, i) => fakeInjury({ id: `injury-${i}` }));
    const repository = {
      findAll: vi.fn().mockResolvedValue(lesiones),
      count: vi.fn().mockResolvedValue(10_000),
    } as unknown as IInjuryRepository;
    const useCase = new GetInjuriesUseCase(repository);

    const duracion = await elapsedMs(async () => {
      const resultado = await useCase.execute('user-1', { page: 1, limit: 10_000 });
      expect(resultado.data).toHaveLength(10_000);
      expect(resultado.meta.totalPages).toBe(1);
    });

    expect(duracion, `El listado tardó ${duracion.toFixed(1)} ms`).toBeLessThan(5_000);
  });
});

describe('[Rendimiento] RF-18 — transformación de resultados de Google Places', () => {
  const lugares = Array.from({ length: 5000 }, (_, i) => ({
    place_id: `place-${i}`,
    name: `Gimnasio ${i}`,
    vicinity: `Calle ${i}`,
    geometry: { location: { lat: 6.2 + i / 100_000, lng: -75.5 } },
  }));

  it('mapea 5.000 lugares dentro del presupuesto aplicando valores por defecto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'OK', results: lugares }) }),
    );
    let gimnasios: Awaited<ReturnType<GoogleMapsGymService['searchGyms']>> = [];

    const duracion = await elapsedMs(async () => {
      gimnasios = await new GoogleMapsGymService().searchGyms({ query: 'envigado' });
    });

    expect(gimnasios).toHaveLength(5000);
    expect(gimnasios[0]).toMatchObject({ placeId: 'place-0', rating: null, openNow: null, types: [] });
    expect(duracion, `El mapeo tardó ${duracion.toFixed(1)} ms`).toBeLessThan(5_000);
  });

  it('buscar con ubicación cuesta lo mismo que sin ella (mediana de 5 mediciones, margen amplio)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'OK', results: lugares }) }),
    );
    const servicio = new GoogleMapsGymService();

    const sinUbicacion = await medianMs(5, () => servicio.searchGyms({ query: 'envigado' }));
    const conUbicacion = await medianMs(5, () => servicio.searchGyms({ query: 'envigado', lat: 6.2, lng: -75.5 }));

    expect(conUbicacion).toBeLessThan(Math.max(sinUbicacion * 5, 50));
  });
});
