import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
import { IInjuryRepository } from '../../domain/repositories/IInjuryRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Injury } from '../../domain/entities/Injury';

// RF-21 — Eliminar lesión. Basado en el diagrama "RF-21 Back
// (DeleteInjuryUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
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

describe('DeleteInjuryUseCase', () => {
  let injuryRepository: IInjuryRepository;
  let useCase: DeleteInjuryUseCase;

  beforeEach(() => {
    injuryRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new DeleteInjuryUseCase(injuryRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: lesión inexistente o de otro usuario → NotFoundError (404)', async () => {
    vi.mocked(injuryRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('injury-1', 'user-1')).rejects.toThrow(NotFoundError);
    expect(injuryRepository.delete).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN
  it('Camino 2: existe y es propia, pero la eliminación falla → NotFoundError (404)', async () => {
    vi.mocked(injuryRepository.findById).mockResolvedValue(injury());
    vi.mocked(injuryRepository.delete).mockResolvedValue(false);

    await expect(useCase.execute('injury-1', 'user-1')).rejects.toThrow(NotFoundError);
  });

  // Camino 3: INICIO,1,2,4,5,7,FIN
  it('Camino 3: existe y es propia → elimina la lesión (204 No Content)', async () => {
    vi.mocked(injuryRepository.findById).mockResolvedValue(injury());
    vi.mocked(injuryRepository.delete).mockResolvedValue(true);

    await expect(useCase.execute('injury-1', 'user-1')).resolves.toBeUndefined();
    expect(injuryRepository.delete).toHaveBeenCalledWith('injury-1', 'user-1');
  });
});
