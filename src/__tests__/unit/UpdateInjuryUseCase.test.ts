import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { IInjuryRepository } from '../../domain/repositories/IInjuryRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Injury } from '../../domain/entities/Injury';

// RF-20 — Modificar lesión. Basado en el diagrama "RF-20 Back
// (UpdateInjuryUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
function injury(overrides: Partial<Injury> = {}): Injury {
  return {
    id: 'injury-1',
    bodyArea: 'Rodilla derecha',
    injuryName: 'Esguince',
    severity: 6,
    isActive: true,
    notes: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('UpdateInjuryUseCase', () => {
  let injuryRepository: IInjuryRepository;
  let useCase: UpdateInjuryUseCase;

  beforeEach(() => {
    injuryRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new UpdateInjuryUseCase(injuryRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: lesión inexistente o de otro usuario → NotFoundError (404)', async () => {
    vi.mocked(injuryRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('injury-1', 'user-1', { severity: 3 })).rejects.toThrow(NotFoundError);
    expect(injuryRepository.update).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN
  it('Camino 2: existe y es propia, pero la actualización falla → NotFoundError (404)', async () => {
    vi.mocked(injuryRepository.findById).mockResolvedValue(injury());
    vi.mocked(injuryRepository.update).mockResolvedValue(null);

    await expect(useCase.execute('injury-1', 'user-1', { severity: 3 })).rejects.toThrow(NotFoundError);
  });

  // Camino 3: INICIO,1,2,4,5,7,FIN — incluye marcar la lesión como recuperada (isActive=false)
  it('Camino 3: existe y es propia → permite marcarla como inactiva (recuperada)', async () => {
    vi.mocked(injuryRepository.findById).mockResolvedValue(injury());
    vi.mocked(injuryRepository.update).mockResolvedValue(injury({ isActive: false }));

    const result = await useCase.execute('injury-1', 'user-1', { isActive: false });

    expect(injuryRepository.update).toHaveBeenCalledWith('injury-1', 'user-1', { isActive: false });
    expect(result.isActive).toBe(false);
  });
});
