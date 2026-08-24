import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { ISleepRepository } from '../../domain/repositories/ISleepRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { SleepLog } from '../../domain/entities/SleepLog';

// RF-17 — Eliminar registro de sueño. Basado en el diagrama "RF-17 Back
// (DeleteSleepUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
function sleepLog(overrides: Partial<SleepLog> = {}): SleepLog {
  return {
    id: 'sleep-1',
    hoursSlept: 7,
    sleepQuality: 8,
    hadNightmares: false,
    stressLevel: 4,
    notes: null,
    date: new Date(),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('DeleteSleepUseCase', () => {
  let sleepRepository: ISleepRepository;
  let useCase: DeleteSleepUseCase;

  beforeEach(() => {
    sleepRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new DeleteSleepUseCase(sleepRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: registro inexistente o de otro usuario → NotFoundError (404)', async () => {
    vi.mocked(sleepRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('sleep-1', 'user-1')).rejects.toThrow(NotFoundError);
    expect(sleepRepository.delete).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN
  it('Camino 2: existe y es propio, pero la eliminación falla → NotFoundError (404)', async () => {
    vi.mocked(sleepRepository.findById).mockResolvedValue(sleepLog());
    vi.mocked(sleepRepository.delete).mockResolvedValue(false);

    await expect(useCase.execute('sleep-1', 'user-1')).rejects.toThrow(NotFoundError);
  });

  // Camino 3: INICIO,1,2,4,5,7,FIN
  it('Camino 3: existe y es propio → elimina el registro (204 No Content)', async () => {
    vi.mocked(sleepRepository.findById).mockResolvedValue(sleepLog());
    vi.mocked(sleepRepository.delete).mockResolvedValue(true);

    await expect(useCase.execute('sleep-1', 'user-1')).resolves.toBeUndefined();
    expect(sleepRepository.delete).toHaveBeenCalledWith('sleep-1', 'user-1');
  });
});
