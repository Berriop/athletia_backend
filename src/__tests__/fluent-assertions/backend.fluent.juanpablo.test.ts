import { describe, it, vi } from 'vitest';
import { expect as chaiExpect } from 'chai';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { NotFoundError } from '../../domain/errors/AppError';
import { SleepLog } from '../../domain/entities/SleepLog';
import { Injury } from '../../domain/entities/Injury';
import { Gym } from '../../domain/entities/Gym';
import { IGoogleMapsService } from '../../domain/services/IGoogleMapsService';

/**
 * Pruebas con Fluent Assertions (chai) para las funcionalidades de backend
 * asignadas a Juan Pablo Berrío: RF-12, RF-13, RF-14, RF-15, RF-16, RF-18.
 */

function genericRepo<T>() {
  return { create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}

function sleepLog(overrides: Partial<SleepLog> = {}): SleepLog {
  return {
    id: 'sleep-1', hoursSlept: 7, sleepQuality: 8, hadNightmares: false, stressLevel: 3,
    notes: null, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function injury(overrides: Partial<Injury> = {}): Injury {
  return {
    id: 'injury-1', bodyArea: 'Rodilla', injuryName: 'Esguince', severity: 5, isActive: true,
    notes: null, userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function gym(overrides: Partial<Gym> = {}): Gym {
  return {
    placeId: 'place-1', name: 'Smart Fit', address: 'Medellín', lat: 6.2, lng: -75.5,
    rating: 4.5, userRatingsTotal: 300, openNow: true, types: ['gym'],
    ...overrides,
  };
}

describe('RF-12 — UpdateSleepUseCase (Fluent Assertions)', () => {
  it('registro inexistente o de otro usuario → NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    const useCase = new UpdateSleepUseCase(repo);

    try {
      await useCase.execute('sleep-x', 'user-1', {});
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
    }
  });

  it('registro válido y propio → retorna el registro actualizado', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(sleepLog());
    vi.mocked(repo.update).mockResolvedValue(sleepLog({ hoursSlept: 6 }));
    const useCase = new UpdateSleepUseCase(repo);

    const result = await useCase.execute('sleep-1', 'user-1', { hoursSlept: 6 });

    chaiExpect(result).to.be.an('object').with.property('hoursSlept', 6);
  });
});

describe('RF-13 — DeleteSleepUseCase (Fluent Assertions)', () => {
  it('registro válido y propio → se elimina sin lanzar error', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(sleepLog());
    vi.mocked(repo.delete).mockResolvedValue(true);
    const useCase = new DeleteSleepUseCase(repo);

    await useCase.execute('sleep-1', 'user-1');

    chaiExpect(repo.delete.mock.calls[0]).to.deep.equal(['sleep-1', 'user-1']);
  });
});

describe('RF-14 — CreateInjuryUseCase (Fluent Assertions)', () => {
  it('datos válidos → crea la lesión y la retorna', async () => {
    const repo = genericRepo<any>();
    const created = injury();
    vi.mocked(repo.create).mockResolvedValue(created);
    const useCase = new CreateInjuryUseCase(repo);

    const result = await useCase.execute('user-1', { bodyArea: 'Rodilla', injuryName: 'Esguince', severity: 5 } as any);

    chaiExpect(result).to.equal(created);
    chaiExpect(repo.create.mock.calls[0][0]).to.include({ userId: 'user-1', notes: null });
  });
});

describe('RF-15 — UpdateInjuryUseCase (Fluent Assertions)', () => {
  it('lesión inexistente o de otro usuario → NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    const useCase = new UpdateInjuryUseCase(repo);

    try {
      await useCase.execute('injury-x', 'user-1', {});
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError).and.to.have.property('message', 'Injury not found');
    }
  });
});

describe('RF-16 — DeleteInjuryUseCase (Fluent Assertions)', () => {
  it('lesión válida y propia → se elimina correctamente', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(injury());
    vi.mocked(repo.delete).mockResolvedValue(true);
    const useCase = new DeleteInjuryUseCase(repo);

    await useCase.execute('injury-1', 'user-1');

    chaiExpect(repo.findById.mock.calls[0]).to.deep.equal(['injury-1', 'user-1']);
  });
});

describe('RF-18 — SearchGymsUseCase (Fluent Assertions)', () => {
  it('búsqueda por texto con coordenadas → delega al servicio y retorna los gimnasios', async () => {
    const service: IGoogleMapsService = { findNearbyGyms: vi.fn(), searchGyms: vi.fn() };
    vi.mocked(service.searchGyms).mockResolvedValue([gym(), gym({ placeId: 'place-2' })]);
    const useCase = new SearchGymsUseCase(service);

    const result = await useCase.execute({ q: 'crossfit', lat: 6.2, lng: -75.5 });

    chaiExpect(result).to.be.an('array').with.lengthOf(2);
    chaiExpect(result[0]).to.have.property('name').that.is.a('string');
  });
});
