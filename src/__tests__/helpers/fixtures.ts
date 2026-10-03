import { performance } from 'node:perf_hooks';
import { User } from '../../domain/entities/User';
import { Workout } from '../../domain/entities/Workout';
import { Meal } from '../../domain/entities/Meal';
import { SleepLog } from '../../domain/entities/SleepLog';
import { Injury } from '../../domain/entities/Injury';

/**
 * Fábricas de datos de prueba y utilidades de medición compartidas por las
 * suites de API, seguridad y rendimiento. No contienen pruebas.
 */

export function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    password: '$2b$10$hashedpasswordhashedpasswordhashedpasswordhashedpass',
    name: 'Usuario de prueba',
    birthDate: null,
    gender: null,
    heightCm: null,
    weightKg: null,
    experienceLevel: null,
    role: 'USER',
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'workout-1',
    title: 'Pierna',
    description: null,
    bodyPart: 'LEGS',
    durationMinutes: 45,
    energyLevel: 7,
    fatigueLevel: 4,
    painLevel: 1,
    date: new Date(),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeMeal(overrides: Partial<Meal> = {}): Meal {
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

export function fakeSleep(overrides: Partial<SleepLog> = {}): SleepLog {
  return {
    id: 'sleep-1',
    hoursSlept: 7,
    sleepQuality: 8,
    hadNightmares: false,
    stressLevel: 3,
    notes: null,
    date: new Date(),
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function fakeInjury(overrides: Partial<Injury> = {}): Injury {
  return {
    id: 'injury-1',
    bodyArea: 'Rodilla',
    injuryName: 'Tendinitis',
    severity: 4,
    isActive: true,
    notes: null,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/** Mide cuántos milisegundos tarda una operación (síncrona o asíncrona). */
export async function elapsedMs(operation: () => unknown): Promise<number> {
  const start = performance.now();
  await operation();
  return performance.now() - start;
}

/** Mediana de varias mediciones: más estable que una sola ejecución. */
export async function medianMs(runs: number, operation: () => unknown): Promise<number> {
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    samples.push(await elapsedMs(operation));
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}
