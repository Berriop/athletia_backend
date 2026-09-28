import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateSleepUseCase } from '../../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../../application/use-cases/sleep/DeleteSleepUseCase';
import { CreateSleepUseCase } from '../../application/use-cases/sleep/CreateSleepUseCase';
import { CreateInjuryUseCase } from '../../application/use-cases/injury/CreateInjuryUseCase';
import { UpdateInjuryUseCase } from '../../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../../application/use-cases/injury/DeleteInjuryUseCase';
import { SearchGymsUseCase } from '../../application/use-cases/gym/SearchGymsUseCase';
import { CreateWorkoutUseCase } from '../../application/use-cases/workout/CreateWorkoutUseCase';
import { UpdateWorkoutUseCase } from '../../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../../application/use-cases/workout/DeleteWorkoutUseCase';
import { CreateMealUseCase } from '../../application/use-cases/meal/CreateMealUseCase';
import { UpdateMealUseCase } from '../../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../../application/use-cases/meal/DeleteMealUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { GetAllUsersUseCase } from '../../application/use-cases/admin/GetAllUsersUseCase';
import { ToggleUserBlockUseCase } from '../../application/use-cases/admin/ToggleUserBlockUseCase';
import { NotFoundError, ForbiddenError } from '../../domain/errors/AppError';
import { SleepLog } from '../../domain/entities/SleepLog';
import { Injury } from '../../domain/entities/Injury';
import { Workout } from '../../domain/entities/Workout';
import { Meal } from '../../domain/entities/Meal';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHashService } from '../../domain/services/IHashService';
import { IGoogleMapsService } from '../../domain/services/IGoogleMapsService';

/**
 * Suite de REGRESIÓN para las 18 funcionalidades de backend de Juan Pablo
 * Berrío, Michael Pardo y Daniel Ortiz (RF-05 a RF-16, RF-18, RF-27, RF-30).
 * Ver backend.regression.test.ts (Luisa Espinal) para la explicación de cómo
 * demostrar en vivo que esta suite detecta una regresión.
 */

function genericRepo<T>() {
  return { create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } as any as T & Record<string, ReturnType<typeof vi.fn>>;
}

function sleepLog(overrides: Partial<SleepLog> = {}): SleepLog {
  return { id: 'sleep-1', hoursSlept: 7, sleepQuality: 8, hadNightmares: false, stressLevel: 3, notes: null, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function injury(overrides: Partial<Injury> = {}): Injury {
  return { id: 'injury-1', bodyArea: 'Rodilla', injuryName: 'Esguince', severity: 5, isActive: true, notes: null, userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function workout(overrides: Partial<Workout> = {}): Workout {
  return { id: 'workout-1', title: 'Pierna', description: null, bodyPart: 'LEGS', durationMinutes: 45, energyLevel: 7, fatigueLevel: 4, painLevel: 1, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function meal(overrides: Partial<Meal> = {}): Meal {
  return { id: 'meal-1', name: 'Ensalada', calories: 400, mealType: 'LUNCH', proteinG: 20, carbsG: 30, fatG: 10, date: new Date(), userId: 'user-1', createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function user(overrides: Partial<User> = {}): User {
  return { id: 'user-1', email: 'user@test.com', password: 'hashed', name: 'Jane', birthDate: null, gender: null, heightCm: null, weightKg: null, experienceLevel: null, role: 'USER', isEmailVerified: false, emailVerificationToken: null, resetPasswordToken: 'reset-token', resetPasswordExpires: new Date(Date.now() + 15 * 60_000), isBlocked: false, createdAt: new Date(), updatedAt: new Date(), ...overrides };
}
function makeUserRepository(): IUserRepository {
  return { findByEmail: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(), findByResetToken: vi.fn(), findByEmailVerificationToken: vi.fn(), findAll: vi.fn() };
}

describe('[Regresión] RF-12/13 — Sleep: seguir exigiendo un registro existente para modificar/eliminar', () => {
  it('modificar un registro inexistente sigue lanzando NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(new UpdateSleepUseCase(repo).execute('x', 'user-1', {})).rejects.toThrow(NotFoundError);
  });

  it('eliminar un registro existente y propio sigue funcionando sin error', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(sleepLog());
    vi.mocked(repo.delete).mockResolvedValue(true);
    await expect(new DeleteSleepUseCase(repo).execute('sleep-1', 'user-1')).resolves.toBeUndefined();
  });
});

describe('[Regresión] RF-14/15/16 — Injury: crear sigue sin exigir decisiones, modificar/eliminar siguen validando propiedad', () => {
  it('crear con datos válidos sigue retornando la lesión creada', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(injury());
    const result = await new CreateInjuryUseCase(repo).execute('user-1', { bodyArea: 'a', injuryName: 'b', severity: 1 } as any);
    expect(result).toEqual(injury());
  });

  it('modificar una lesión de otro usuario sigue bloqueado con NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(null);
    await expect(new UpdateInjuryUseCase(repo).execute('x', 'user-1', {})).rejects.toThrow(NotFoundError);
  });

  it('eliminar una lesión existente sigue funcionando sin error', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(injury());
    vi.mocked(repo.delete).mockResolvedValue(true);
    await expect(new DeleteInjuryUseCase(repo).execute('injury-1', 'user-1')).resolves.toBeUndefined();
  });
});

describe('[Regresión] RF-18 — SearchGymsUseCase sigue delegando la búsqueda al servicio externo', () => {
  it('sigue llamando a searchGyms con los parámetros correctos', async () => {
    const service: IGoogleMapsService = { findNearbyGyms: vi.fn(), searchGyms: vi.fn() };
    vi.mocked(service.searchGyms).mockResolvedValue([]);
    await new SearchGymsUseCase(service).execute({ q: 'gym', lat: 1, lng: 2 });
    expect(service.searchGyms).toHaveBeenCalledWith({ query: 'gym', lat: 1, lng: 2 });
  });
});

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

describe('[Regresión] RF-08/09/10 — Meal: el CRUD sigue validando propiedad del registro', () => {
  it('crear sigue asociando la comida al usuario', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(meal());
    await new CreateMealUseCase(repo).execute('user-1', { name: 'x', calories: 1 } as any);
    expect(repo.create.mock.calls[0][0]).toMatchObject({ userId: 'user-1' });
  });

  it('modificar una comida válida y propia sigue retornando la comida actualizada', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(meal());
    vi.mocked(repo.update).mockResolvedValue(meal({ calories: 999 }));
    const result = await new UpdateMealUseCase(repo).execute('meal-1', 'user-1', { calories: 999 } as any);
    expect(result.calories).toBe(999);
  });

  it('eliminar una comida cuya eliminación falla sigue lanzando NotFoundError', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.findById).mockResolvedValue(meal());
    vi.mocked(repo.delete).mockResolvedValue(false);
    await expect(new DeleteMealUseCase(repo).execute('meal-1', 'user-1')).rejects.toThrow(NotFoundError);
  });
});

describe('[Regresión] RF-11 — CreateSleepUseCase sigue asociando el registro al usuario', () => {
  it('sigue normalizando notes a null cuando no se envía', async () => {
    const repo = genericRepo<any>();
    vi.mocked(repo.create).mockResolvedValue(sleepLog());
    await new CreateSleepUseCase(repo).execute('user-1', { hoursSlept: 7, sleepQuality: 8, stressLevel: 3 } as any);
    expect(repo.create.mock.calls[0][0]).toMatchObject({ userId: 'user-1', notes: null });
  });
});

describe('[Regresión] RF-27 — Recuperar contraseña sigue sin revelar si el correo existe', () => {
  it('correo no registrado sigue sin lanzar error ni actualizar nada', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    await expect(new ForgotPasswordUseCase(userRepository, {} as any).execute('nadie@test.com')).resolves.toBeUndefined();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('token vencido o inválido sigue rechazando el restablecimiento', async () => {
    const userRepository = makeUserRepository();
    const hashService: IHashService = { hash: vi.fn(), compare: vi.fn() };
    vi.mocked(userRepository.findByResetToken).mockResolvedValue(null);
    await expect(new ResetPasswordUseCase(userRepository, hashService).execute('token-x', 'nueva')).rejects.toThrow();
  });
});

describe('[Regresión] RF-30 — Gestión de usuarios sigue protegiendo al admin de auto-bloquearse', () => {
  beforeEach(() => vi.clearAllMocks());

  it('un admin sigue sin poder bloquear su propia cuenta', async () => {
    const userRepository = makeUserRepository();
    await expect(new ToggleUserBlockUseCase(userRepository).execute('admin-1', 'admin-1')).rejects.toThrow(ForbiddenError);
  });

  it('listar usuarios sigue ocultando la contraseña de cada uno', async () => {
    const userRepository = makeUserRepository();
    vi.mocked(userRepository.findAll).mockResolvedValue([user()]);
    const result = await new GetAllUsersUseCase(userRepository).execute();
    expect(result[0]).not.toHaveProperty('password');
  });
});
