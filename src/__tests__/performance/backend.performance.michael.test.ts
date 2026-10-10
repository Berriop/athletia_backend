import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../server';
import { container } from '../../infrastructure/container';
import { CreateWorkoutSchema, UpdateWorkoutSchema } from '../../application/dto/workout.dto';
import { GetWorkoutsUseCase } from '../../application/use-cases/workout/GetWorkoutsUseCase';
import { IWorkoutRepository } from '../../domain/repositories/IWorkoutRepository';
import { tokenFor, bearer } from '../helpers/auth.helper';
import { elapsedMs, fakeWorkout, medianMs } from '../helpers/fixtures';

/**
 * Pruebas de rendimiento para las funcionalidades de backend de Michael Pardo:
 * RF-05, RF-06 y RF-07 (rutinas de entrenamiento).
 *
 * Son pruebas no funcionales: además de comprobar que el resultado es correcto,
 * verifican un presupuesto de tiempo. Los límites son amplios a propósito para
 * evitar falsos fallos en equipos distintos (incluido Jenkins).
 *
 * Nota: el servidor permite 100 peticiones /api por archivo de pruebas (rate
 * limiter en memoria), por eso la medición del endpoint usa pocas repeticiones.
 */

const workoutValido = {
  body: {
    title: 'Pierna',
    bodyPart: 'LEGS',
    durationMinutes: 45,
    energyLevel: 7,
    fatigueLevel: 4,
    painLevel: 1,
    date: '2026-08-01T10:00:00.000Z',
  },
};

describe('[Rendimiento] RF-05/06/07 — validación de rutinas', () => {
  it('valida 2.000 rutinas dentro del presupuesto', async () => {
    let validas = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 0; i < 2000; i++) {
        if (CreateWorkoutSchema.safeParse(workoutValido).success) validas++;
      }
    });

    expect(validas).toBe(2000);
    expect(duracion, `2.000 validaciones tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(10_000);
  });

  it('valida 2.000 actualizaciones parciales dentro del presupuesto', async () => {
    let validas = 0;

    const duracion = await elapsedMs(() => {
      for (let i = 0; i < 2000; i++) {
        if (UpdateWorkoutSchema.safeParse({ body: { title: `Rutina ${i}` } }).success) validas++;
      }
    });

    expect(validas).toBe(2000);
    expect(duracion, `2.000 actualizaciones tardaron ${duracion.toFixed(1)} ms`).toBeLessThan(10_000);
  });
});

describe('[Rendimiento] RF-05/06/07 — listado de rutinas', () => {
  it('el caso de uso devuelve 10.000 rutinas dentro del presupuesto', async () => {
    const rutinas = Array.from({ length: 10_000 }, (_, i) => fakeWorkout({ id: `workout-${i}` }));
    const repository = {
      findAll: vi.fn().mockResolvedValue(rutinas),
      count: vi.fn().mockResolvedValue(10_000),
    } as unknown as IWorkoutRepository;

    const duracion = await elapsedMs(async () => {
      const resultado = await new GetWorkoutsUseCase(repository).execute('user-1', { page: 1, limit: 10_000 });
      expect(resultado.data).toHaveLength(10_000);
    });

    expect(duracion, `El listado tardó ${duracion.toFixed(1)} ms`).toBeLessThan(5_000);
  });

  describe('endpoint GET /api/v1/workouts', () => {
    const token = tokenFor('user-michael');

    beforeAll(() => {
      vi.spyOn(container.workoutRepository, 'findAll').mockResolvedValue(
        Array.from({ length: 50 }, (_, i) => fakeWorkout({ id: `workout-${i}` })),
      );
      vi.spyOn(container.workoutRepository, 'count').mockResolvedValue(50);
    });

    it('responde con una latencia mediana razonable (30 peticiones, margen amplio)', async () => {
      const mediana = await medianMs(30, async () => {
        const response = await request(app).get('/api/v1/workouts?page=1&limit=50').set('Authorization', bearer(token));
        expect(response.status).toBe(200);
      });

      expect(mediana, `La mediana fue ${mediana.toFixed(1)} ms`).toBeLessThan(2_000);
    });
  });
});
