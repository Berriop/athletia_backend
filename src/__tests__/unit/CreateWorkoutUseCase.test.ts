import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { IWorkoutRepository } from '../../domain/repositories/IWorkoutRepository';
import { Workout } from '../../domain/entities/Workout';

// RF-06 — Crear entrenamiento. Basado en el diagrama "RF-06 Back
// (CreateWorkoutUseCase)" (Patrón B, V(G)=1, 1 camino básico: función lineal).
describe('CreateWorkoutUseCase', () => {
  let workoutRepository: IWorkoutRepository;
  let useCase: CreateWorkoutUseCase;

  beforeEach(() => {
    workoutRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    useCase = new CreateWorkoutUseCase(workoutRepository);
  });

  // Camino único: INICIO,1,2,3,FIN
  it('Camino 1: datos válidos → crea el entrenamiento asociado al usuario autenticado (201)', async () => {
    const created: Workout = {
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
    };
    vi.mocked(workoutRepository.create).mockResolvedValue(created);

    const result = await useCase.execute('user-1', {
      title: 'Pierna',
      bodyPart: 'LEGS',
      durationMinutes: 45,
      energyLevel: 7,
      fatigueLevel: 6,
      painLevel: 2,
      date: new Date(),
    });

    expect(workoutRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', title: 'Pierna', description: null }),
    );
    expect(result).toEqual(created);
  });

  it('cuando no se envía descripción, la guarda como null (no undefined)', async () => {
    vi.mocked(workoutRepository.create).mockResolvedValue({} as Workout);

    await useCase.execute('user-1', {
      title: 'Pecho',
      bodyPart: 'CHEST',
      durationMinutes: 30,
      energyLevel: 5,
      fatigueLevel: 5,
      painLevel: 1,
      date: new Date(),
    });

    const callArg = vi.mocked(workoutRepository.create).mock.calls[0][0];
    expect(callArg.description).toBeNull();
  });
});
