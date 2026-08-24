import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { IWorkoutRepository } from '../../domain/repositories/IWorkoutRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Workout } from '../../domain/entities/Workout';

// RF-09 — Eliminar entrenamiento. Basado en el diagrama "RF-09 Back
// (DeleteWorkoutUseCase)" (Patrón A, V(G)=3, 3 caminos básicos).
function workout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'workout-1',
    title: 'Pierna',
    description: null,
    bodyPart: 'LEGS',
    durationMinutes: 45,
    energyLevel: 7,
    fatigueLevel: 6,
    painLevel: 2,
    date: new Date(),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('DeleteWorkoutUseCase', () => {
  let workoutRepository: IWorkoutRepository;
  let useCase: DeleteWorkoutUseCase;

  beforeEach(() => {
    workoutRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new DeleteWorkoutUseCase(workoutRepository);
  });

  // Camino 1: INICIO,1,2,3,FIN
  it('Camino 1: entrenamiento inexistente o de otro usuario → NotFoundError (404)', async () => {
    vi.mocked(workoutRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('workout-1', 'user-1')).rejects.toThrow(NotFoundError);
    expect(workoutRepository.delete).not.toHaveBeenCalled();
  });

  // Camino 2: INICIO,1,2,4,5,6,FIN
  it('Camino 2: existe y es propio, pero la eliminación falla → NotFoundError (404)', async () => {
    vi.mocked(workoutRepository.findById).mockResolvedValue(workout());
    vi.mocked(workoutRepository.delete).mockResolvedValue(false);

    await expect(useCase.execute('workout-1', 'user-1')).rejects.toThrow(NotFoundError);
  });

  // Camino 3: INICIO,1,2,4,5,7,FIN
  it('Camino 3: existe y es propio → elimina el entrenamiento (204 No Content)', async () => {
    vi.mocked(workoutRepository.findById).mockResolvedValue(workout());
    vi.mocked(workoutRepository.delete).mockResolvedValue(true);

    await expect(useCase.execute('workout-1', 'user-1')).resolves.toBeUndefined();
    expect(workoutRepository.delete).toHaveBeenCalledWith('workout-1', 'user-1');
  });
});
