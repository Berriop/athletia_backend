import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { IMealRepository } from '../../domain/repositories/IMealRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Meal } from '../../domain/entities/Meal';

// RF-12 — Modificar comida. Basado en el diagrama "RF-12 Back
// (UpdateMealUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
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

describe('UpdateMealUseCase', () => {
  let mealRepository: IMealRepository;
  let useCase: UpdateMealUseCase;

  beforeEach(() => {
    mealRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new UpdateMealUseCase(mealRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: comida inexistente o de otro usuario → NotFoundError (404)', async () => {
    vi.mocked(mealRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('meal-1', 'user-1', { calories: 500 })).rejects.toThrow(NotFoundError);
    expect(mealRepository.update).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN
  it('Camino 2: existe y es propia, pero la actualización falla → NotFoundError (404)', async () => {
    vi.mocked(mealRepository.findById).mockResolvedValue(meal());
    vi.mocked(mealRepository.update).mockResolvedValue(null);

    await expect(useCase.execute('meal-1', 'user-1', { calories: 500 })).rejects.toThrow(NotFoundError);
  });

  // Camino 3: INICIO,1,2,4,5,7,FIN
  it('Camino 3: existe y es propia, datos correctos → retorna la comida actualizada', async () => {
    vi.mocked(mealRepository.findById).mockResolvedValue(meal());
    vi.mocked(mealRepository.update).mockResolvedValue(meal({ calories: 700 }));

    const result = await useCase.execute('meal-1', 'user-1', { calories: 700 });

    expect(mealRepository.update).toHaveBeenCalledWith('meal-1', 'user-1', { calories: 700 });
    expect(result.calories).toBe(700);
  });
});
