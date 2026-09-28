import { describe, it, vi } from 'vitest';
import { expect as chaiExpect } from 'chai';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { NotFoundError } from '../../domain/errors/AppError';
import { Workout } from '../../domain/entities/Workout';
import { Meal } from '../../domain/entities/Meal';

/**
 * Pruebas con Fluent Assertions (chai) para las funcionalidades de backend
 * asignadas a Michael Pardo: RF-05, RF-06, RF-07, RF-08.
 * (RF-20 y RF-25 no tienen backend propio — ver los archivos de frontend.)
 */

function genericRepo<T>() {
  return { create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}

function workout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'workout-1', title: 'Pierna', description: null, bodyPart: 'LEGS', durationMinutes: 45,
    energyLevel: 7, fatigueLevel: 4, painLevel: 1, date: new Date(), userId: 'user-1',
    createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

function meal(overrides: Partial<Meal> = {}): Meal {
  return {
    id: 'meal-1', name: 'Ensalada', calories: 400, mealType: 'LUNCH', proteinG: 20, carbsG: 30,
    fatG: 10, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

describe('RF-05 — CreateWorkoutUseCase (Fluent Assertions)', () => {
  it('datos válidos → crea el entrenamiento', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(workout());
    const useCase = new CreateWorkoutUseCase(repo);

    const result = await useCase.execute('user-1', { title: 'Pierna', bodyPart: 'LEGS', durationMinutes: 45 } as any);

    chaiExpect(result).to.include({ title: 'Pierna', bodyPart: 'LEGS' });
  });
});

describe('RF-06 — UpdateWorkoutUseCase (Fluent Assertions)', () => {
  it('actualización falla (no encontrado tras existir) → NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(workout());
    vi.mocked(repo.update).mockResolvedValue(null);
    const useCase = new UpdateWorkoutUseCase(repo);

    try {
      await useCase.execute('workout-1', 'user-1', { title: 'Nuevo' } as any);
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
    }
  });
});

describe('RF-07 — DeleteWorkoutUseCase (Fluent Assertions)', () => {
  it('entrenamiento inexistente → NotFoundError sin llamar a delete', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    const useCase = new DeleteWorkoutUseCase(repo);

    try {
      await useCase.execute('workout-x', 'user-1');
      throw new Error('no debía llegar aquí');
    } catch (err) {
      chaiExpect(err).to.be.instanceOf(NotFoundError);
      chaiExpect(repo.delete.mock.calls).to.have.lengthOf(0);
    }
  });
});

describe('RF-08 — CreateMealUseCase (Fluent Assertions)', () => {
  it('datos válidos → crea la comida asociada al usuario', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(meal());
    const useCase = new CreateMealUseCase(repo);

    const result = await useCase.execute('user-1', { name: 'Ensalada', calories: 400 } as any);

    chaiExpect(result.userId).to.equal('user-1');
    chaiExpect(repo.create.mock.calls[0][0]).to.include({ userId: 'user-1' });
  });
});
