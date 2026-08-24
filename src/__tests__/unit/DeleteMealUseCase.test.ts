import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
import { IMealRepository } from '../../domain/repositories/IMealRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Meal } from '../../domain/entities/Meal';

// RF-13 — Eliminar comida. Basado en el diagrama "RF-13 Back
// (DeleteMealUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
function meal(overrides: Partial<Meal> = {}): Meal {
  return {
    id: 'meal-1',
    name: 'Pollo con arroz',
    calories: 600,
    mealType: 'LUNCH',
    proteinG: 40,
    carbsG: 60,
    fatG: 15,
    date: new Date(),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('DeleteMealUseCase', () => {
  let mealRepository: IMealRepository;
  let useCase: DeleteMealUseCase;

  beforeEach(() => {
    mealRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new DeleteMealUseCase(mealRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: comida inexistente o de otro usuario → NotFoundError (404)', async () => {
    vi.mocked(mealRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('meal-1', 'user-1')).rejects.toThrow(NotFoundError);
    expect(mealRepository.delete).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN
  it('Camino 2: existe y es propia, pero la eliminación falla → NotFoundError (404)', async () => {
    vi.mocked(mealRepository.findById).mockResolvedValue(meal());
    vi.mocked(mealRepository.delete).mockResolvedValue(false);

    await expect(useCase.execute('meal-1', 'user-1')).rejects.toThrow(NotFoundError);
  });

  // Camino 3: INICIO,1,2,4,5,7,FIN
  it('Camino 3: existe y es propia → elimina la comida (204 No Content)', async () => {
    vi.mocked(mealRepository.findById).mockResolvedValue(meal());
    vi.mocked(mealRepository.delete).mockResolvedValue(true);

    await expect(useCase.execute('meal-1', 'user-1')).resolves.toBeUndefined();
    expect(mealRepository.delete).toHaveBeenCalledWith('meal-1', 'user-1');
  });
});
