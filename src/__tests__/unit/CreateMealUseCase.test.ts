import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { IMealRepository } from '../../domain/repositories/IMealRepository';
import { Meal } from '../../domain/entities/Meal';

// RF-10 — Crear comida. Basado en el diagrama "RF-10 Back (CreateMealUseCase)"
// (Patrón B, V(G)=1, 1 camino básico: función lineal).
describe('CreateMealUseCase', () => {
  let mealRepository: IMealRepository;
  let useCase: CreateMealUseCase;

  beforeEach(() => {
    mealRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new CreateMealUseCase(mealRepository);
  });

  // Camino único: INICIO,1,2,3,FIN
  it('Camino 1: datos válidos → crea la comida asociada al usuario autenticado (201)', async () => {
    const created: Meal = {
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
    };
    vi.mocked(mealRepository.create).mockResolvedValue(created);

    const result = await useCase.execute('user-1', {
      name: 'Pollo con arroz',
      calories: 600,
      mealType: 'LUNCH',
      proteinG: 40,
      carbsG: 60,
      fatG: 15,
      date: new Date(),
    });

    expect(mealRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', calories: 600 }));
    expect(result).toEqual(created);
  });
});
