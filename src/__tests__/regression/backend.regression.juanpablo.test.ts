import { describe, it, expect, vi } from 'vitest';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { NotFoundError } from '../../domain/errors/AppError';
import { SleepLog } from '../../domain/entities/SleepLog';
import { Injury } from '../../domain/entities/Injury';
import { IGoogleMapsService } from '../../domain/services/IGoogleMapsService';

/**
 * Suite de REGRESIÓN para las funcionalidades de backend de Juan Pablo
 * Berrío: RF-12, RF-13, RF-14, RF-15, RF-16, RF-18.
 * Ver backend.regression.luisa.test.ts para cómo demostrar en vivo que esta
 * suite detecta una regresión.
 */

function genericRepo<T>() {
  return { create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}

function sleepLog(overrides: Partial<SleepLog> = {}): SleepLog {
  return { id: 'sleep-1', hoursSlept: 7, sleepQuality: 8, hadNightmares: false, stressLevel: 3, notes: null, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function injury(overrides: Partial<Injury> = {}): Injury {
  return { id: 'injury-1', bodyArea: 'Rodilla', injuryName: 'Esguince', severity: 5, isActive: true, notes: null, userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}

describe('[Regresión] RF-12/13 — Sleep: seguir exigiendo un registro existente para modificar/eliminar', () => {
  it('modificar un registro inexistente sigue lanzando NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(new UpdateSleepUseCase(repo).execute('x', 'user-1', {})).rejects.toThrow(NotFoundError);
  });

  it('eliminar un registro existente y propio sigue funcionando sin error', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(sleepLog());
    vi.mocked(repo.delete).mockResolvedValue(true);
    await expect(new DeleteSleepUseCase(repo).execute('sleep-1', 'user-1')).resolves.toBeUndefined();
  });
});

describe('[Regresión] RF-14/15/16 — Injury: crear sigue sin exigir decisiones, modificar/eliminar siguen validando propiedad', () => {
  it('crear con datos válidos sigue retornando la lesión creada', async () => {
    const repo = genericRepo<any>();
    const created = injury();
    vi.mocked(repo.create).mockResolvedValue(created);
    const result = await new CreateInjuryUseCase(repo).execute('user-1', { bodyArea: 'a', injuryName: 'b', severity: 1 } as any);
    expect(result).toBe(created);
  });

  it('modificar una lesión de otro usuario sigue bloqueado con NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(new UpdateInjuryUseCase(repo).execute('x', 'user-1', {})).rejects.toThrow(NotFoundError);
  });

  it('eliminar una lesión existente sigue funcionando sin error', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(injury());
    vi.mocked(repo.delete).mockResolvedValue(true);
    await expect(new DeleteInjuryUseCase(repo).execute('injury-1', 'user-1')).resolves.toBeUndefined();
  });
});

describe('[Regresión] RF-18 — SearchGymsUseCase sigue delegando la búsqueda al servicio externo', () => {
  it('sigue llamando a searchGyms con los parámetros correctos', async () => {
    const service: IGoogleMapsService = { findNearbyGyms: vi.fn(), searchGyms: vi.fn() };
    vi.mocked(service.searchGyms).mockResolvedValue([]);
    await new SearchGymsUseCase(service).execute({ q: 'gym', lat: 1, lng: 2 });
    expect(service.searchGyms).toHaveBeenCalledWith({ query: 'gym', lat: 1, lng: 2 });
  });
});
