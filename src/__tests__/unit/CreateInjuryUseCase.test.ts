import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { IInjuryRepository } from '../../domain/repositories/IInjuryRepository';
import { Injury } from '../../domain/entities/Injury';

// RF-18 — Crear lesión. Basado en el diagrama "RF-18 Back (CreateInjuryUseCase)"
// (Patrón B, V(G)=1, 1 camino básico: función lineal, sin decisiones).
describe('CreateInjuryUseCase', () => {
  let injuryRepository: IInjuryRepository;
  let useCase: CreateInjuryUseCase;

  beforeEach(() => {
    injuryRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new CreateInjuryUseCase(injuryRepository);
  });

  // Camino único: INICIO,1,2,3,FIN
  it('Camino 1: datos válidos → crea la lesión con estado activo asociada al usuario (201)', async () => {
    const created: Injury = {
      id: 'injury-1',
      bodyArea: 'Rodilla derecha',
      injuryName: 'Esguince',
      severity: 6,
      isActive: true,
      notes: null,
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(injuryRepository.create).mockResolvedValue(created);

    const result = await useCase.execute('user-1', {
      bodyArea: 'Rodilla derecha',
      injuryName: 'Esguince',
      severity: 6,
      isActive: true,
    });

    expect(injuryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', bodyArea: 'Rodilla derecha', notes: null }),
    );
    expect(result).toEqual(created);
  });

  it('cuando no se envían notas, las guarda como null (no undefined)', async () => {
    vi.mocked(injuryRepository.create).mockResolvedValue({} as Injury);

    await useCase.execute('user-1', {
      bodyArea: 'Hombro',
      injuryName: 'Tendinitis',
      severity: 4,
      isActive: true,
    });

    const callArg = vi.mocked(injuryRepository.create).mock.calls[0][0];
    expect(callArg.notes).toBeNull();
  });
});
