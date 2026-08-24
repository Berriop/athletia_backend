import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { ISleepRepository } from '../../domain/repositories/ISleepRepository';
import { SleepLog } from '../../domain/entities/SleepLog';

// RF-14 — Crear registro de sueño. Basado en el diagrama "RF-14 Back
// (CreateSleepUseCase)" (Patrón B, V(G)=1, 1 camino básico: función lineal).
describe('CreateSleepUseCase', () => {
  let sleepRepository: ISleepRepository;
  let useCase: CreateSleepUseCase;

  beforeEach(() => {
    sleepRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new CreateSleepUseCase(sleepRepository);
  });

  // Camino único: INICIO,1,2,3,FIN
  it('Camino 1: datos válidos → crea el registro asociado al usuario autenticado (201)', async () => {
    const created: SleepLog = {
      id: 'sleep-1',
      hoursSlept: 8,
      sleepQuality: 9,
      hadNightmares: false,
      stressLevel: 3,
      notes: null,
      date: new Date('2026-08-20'),
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(sleepRepository.create).mockResolvedValue(created);

    const result = await useCase.execute('user-1', {
      hoursSlept: 8,
      sleepQuality: 9,
      hadNightmares: false,
      stressLevel: 3,
      date: new Date('2026-08-20'),
    });

    expect(sleepRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', hoursSlept: 8, notes: null }),
    );
    expect(result).toEqual(created);
  });

  it('cuando no se envían notas, las guarda como null (no undefined)', async () => {
    vi.mocked(sleepRepository.create).mockResolvedValue({} as SleepLog);

    await useCase.execute('user-1', {
      hoursSlept: 6,
      sleepQuality: 5,
      hadNightmares: true,
      stressLevel: 7,
      date: new Date(),
    });

    const callArg = vi.mocked(sleepRepository.create).mock.calls[0][0];
    expect(callArg.notes).toBeNull();
  });
});
