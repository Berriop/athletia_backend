import { describe, it, expect, vi } from 'vitest';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { NotFoundError } from '../../domain/errors/AppError';
import { Workout } from '../../domain/entities/Workout';
import { Meal } from '../../domain/entities/Meal';

/**
 * Suite de REGRESIÓN para las funcionalidades de backend de Michael Pardo:
 * RF-05, RF-06, RF-07, RF-08.
 */

function genericRepo<T>() {
  return { create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}

function workout(overrides: Partial<Workout> = {}): Workout {
  return { id: 'workout-1', title: 'Pierna', description: null, bodyPart: 'LEGS', durationMinutes: 45, energyLevel: 7, fatigueLevel: 4, painLevel: 1, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function meal(overrides: Partial<Meal> = {}): Meal {
  return { id: 'meal-1', name: 'Ensalada', calories: 400, mealType: 'LUNCH', proteinG: 20, carbsG: 30, fatG: 10, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}

describe('[Regresión] RF-05/06/07 — Workout: el CRUD sigue validando propiedad del registro', () => {
  it('crear sigue asociando el entrenamiento al usuario', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(workout());
    await new CreateWorkoutUseCase(repo).execute('user-1', { title: 'x', bodyPart: 'LEGS', durationMinutes: 1 } as any);
    expect(repo.create.mock.calls[0][0]).toMatchObject({ userId: 'user-1' });
  });

  it('modificar un entrenamiento inexistente sigue lanzando NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(new UpdateWorkoutUseCase(repo).execute('x', 'user-1', {})).rejects.toThrow(NotFoundError);
  });

  it('eliminar un entrenamiento inexistente sigue lanzando NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(new DeleteWorkoutUseCase(repo).execute('x', 'user-1')).rejects.toThrow(NotFoundError);
  });
});

describe('[Regresión] RF-08 — CreateMealUseCase sigue asociando la comida al usuario', () => {
  it('sigue creando la comida con el userId correcto', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(meal());
    await new CreateMealUseCase(repo).execute('user-1', { name: 'x', calories: 1 } as any);
    expect(repo.create.mock.calls[0][0]).toMatchObject({ userId: 'user-1' });
  });
});
