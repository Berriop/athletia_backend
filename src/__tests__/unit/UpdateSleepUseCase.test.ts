import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { ISleepRepository } from '../../domain/repositories/ISleepRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { SleepLog } from '../../domain/entities/SleepLog';

// RF-16 — Modificar registro de sueño. Basado en el diagrama "RF-16 Back
// (UpdateSleepUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
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

describe('UpdateSleepUseCase', () => {
  let sleepRepository: ISleepRepository;
  let useCase: UpdateSleepUseCase;

  beforeEach(() => {
    sleepRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new UpdateSleepUseCase(sleepRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: registro inexistente o de otro usuario → NotFoundError (404)', async () => {
    vi.mocked(sleepRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('sleep-1', 'user-1', { hoursSlept: 8 })).rejects.toThrow(NotFoundError);
    expect(sleepRepository.update).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN
  it('Camino 2: existe y es propio, pero la actualización falla → NotFoundError (404)', async () => {
    vi.mocked(sleepRepository.findById).mockResolvedValue(sleepLog());
    vi.mocked(sleepRepository.update).mockResolvedValue(null);

    await expect(useCase.execute('sleep-1', 'user-1', { hoursSlept: 8 })).rejects.toThrow(NotFoundError);
  });

  // Camino 3: INICIO,1,2,4,5,7,FIN
  it('Camino 3: existe y es propio, datos correctos → retorna el registro actualizado', async () => {
    vi.mocked(sleepRepository.findById).mockResolvedValue(sleepLog());
    vi.mocked(sleepRepository.update).mockResolvedValue(sleepLog({ hoursSlept: 8 }));

    const result = await useCase.execute('sleep-1', 'user-1', { hoursSlept: 8 });

    expect(sleepRepository.findById).toHaveBeenCalledWith('sleep-1', 'user-1');
    expect(sleepRepository.update).toHaveBeenCalledWith('sleep-1', 'user-1', { hoursSlept: 8 });
    expect(result.hoursSlept).toBe(8);
  });
});
